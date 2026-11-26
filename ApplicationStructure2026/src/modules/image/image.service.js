import mongoose from 'mongoose'
import { Image, IMAGE_PURPOSES } from '../../DB/model/image.model.js'
import { Project } from '../../DB/model/project.model.js'
import { Article } from '../../DB/model/article.model.js'
import { Profile } from '../../DB/model/profile.model.js'
import { getCloudinaryCredentials, getCloudinarySdk } from './cloudinary.client.js'

export const ALLOWED_IMAGE_FORMATS = ['jpg', 'jpeg', 'png', 'webp', 'avif', 'gif']
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024 // 10 MB
export const APPROVED_FOLDER_PREFIX = 'portfolio/'

function assertValidObjectId(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        const err = new Error('Invalid image ID.')
        err.cause = { status: 400 }
        throw err
    }
}

function escapeRegex(value = '') {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function isApprovedProjectFolder(publicId = '', purpose = '', assetFolder = '') {
    const normalizedId = String(publicId).replace(/^\/+/, '')
    if (!normalizedId || normalizedId.includes('..')) return false

    const expectedPrefix = `${APPROVED_FOLDER_PREFIX}${purpose}/`
    const hasApprovedPublicIdPrefix = normalizedId.startsWith(expectedPrefix) || normalizedId.startsWith(APPROVED_FOLDER_PREFIX)
    if (!hasApprovedPublicIdPrefix) return false

    if (assetFolder) {
        const normalizedFolder = String(assetFolder).replace(/^\/+/, '')
        if (!normalizedFolder.startsWith('portfolio')) return false
    }
    return true
}

export function signImageUploadService({ purpose }) {
    if (!IMAGE_PURPOSES.includes(purpose)) {
        const err = new Error(`Invalid image purpose '${purpose}'.`)
        err.cause = { status: 400 }
        throw err
    }

    const { cloudName, apiKey, apiSecret } = getCloudinaryCredentials()
    const sdk = getCloudinarySdk()
    const timestamp = Math.floor(Date.now() / 1000)
    const folder = `portfolio/${purpose}`

    const paramsToSign = { timestamp, folder }
    const signature = sdk.utils.api_sign_request(paramsToSign, apiSecret)

    return {
        cloudName,
        apiKey,
        timestamp,
        folder,
        signature,
        maxBytes: MAX_IMAGE_BYTES,
        allowedFormats: ALLOWED_IMAGE_FORMATS
    }
}

export async function registerImageService({ publicId, purpose, alt = '', altAr = '' }) {
    if (!isApprovedProjectFolder(publicId, purpose)) {
        const err = new Error(`publicId must reside inside an approved folder (${APPROVED_FOLDER_PREFIX}${purpose}/).`)
        err.cause = { status: 400 }
        throw err
    }

    const existing = await Image.findOne({ publicId }).lean()
    if (existing) {
        const err = new Error('Image with this publicId is already registered.')
        err.cause = { status: 409 }
        throw err
    }

    const sdk = getCloudinarySdk()
    let resource
    try {
        resource = await sdk.api.resource(publicId, { resource_type: 'image' })
    } catch (apiErr) {
        const status = apiErr?.error?.http_code === 404 || apiErr?.http_code === 404 ? 404 : 400
        const err = new Error(status === 404 ? 'Uploaded image was not found in Cloudinary.' : `Cloudinary verification failed: ${apiErr.message || 'unknown error'}`)
        err.cause = { status }
        throw err
    }

    if (!resource || resource.resource_type !== 'image') {
        const err = new Error('Cloudinary resource is not a valid image.')
        err.cause = { status: 400 }
        throw err
    }

    const format = String(resource.format || '').toLowerCase()
    if (!ALLOWED_IMAGE_FORMATS.includes(format)) {
        const err = new Error(`Image format '${format || 'unknown'}' is not allowed.`)
        err.cause = { status: 400 }
        throw err
    }

    const bytes = Number(resource.bytes || 0)
    if (!Number.isFinite(bytes) || bytes < 1 || bytes > MAX_IMAGE_BYTES) {
        const err = new Error(`Image size exceeds maximum allowed limit of 10 MB.`)
        err.cause = { status: 400 }
        throw err
    }

    if (!isApprovedProjectFolder(resource.public_id || publicId, purpose, resource.asset_folder || resource.folder || '')) {
        const err = new Error('Cloudinary resource does not belong to an approved project folder.')
        err.cause = { status: 400 }
        throw err
    }

    const created = await Image.create({
        publicId: resource.public_id || publicId,
        secureUrl: resource.secure_url || '',
        width: Number(resource.width) || 1,
        height: Number(resource.height) || 1,
        format,
        bytes,
        purpose,
        alt,
        altAr
    })

    return created.toObject()
}

export async function getAdminImagesService({ page = 1, limit = 20, purpose = '', q = '' } = {}) {
    const p = Math.max(1, parseInt(page, 10) || 1)
    const l = Math.min(100, Math.max(1, parseInt(limit, 10) || 20))

    const filter = {}
    if (purpose && IMAGE_PURPOSES.includes(purpose)) {
        filter.purpose = purpose
    }
    if (q && String(q).trim()) {
        const regex = new RegExp(escapeRegex(String(q).trim()), 'i')
        filter.$or = [{ publicId: regex }, { alt: regex }, { altAr: regex }]
    }

    const [items, total] = await Promise.all([
        Image.find(filter)
            .sort({ createdAt: -1 })
            .skip((p - 1) * l)
            .limit(l)
            .lean(),
        Image.countDocuments(filter)
    ])

    return {
        data: items,
        pagination: {
            page: p,
            limit: l,
            total,
            totalPages: Math.max(1, Math.ceil(total / l))
        }
    }
}

export async function updateImageService(id, payload) {
    assertValidObjectId(id)
    const updated = await Image.findByIdAndUpdate(
        id,
        { $set: payload },
        { new: true, runValidators: true }
    ).lean()
    return updated
}

export async function getImageUsageService(id) {
    assertValidObjectId(id)
    const image = await Image.findById(id).lean()
    if (!image) return null

    const needles = [image.publicId, image.secureUrl].filter(Boolean)
    const pattern = needles.map(escapeRegex).join('|')
    const regex = new RegExp(pattern)

    const [projects, articles, profiles] = await Promise.all([
        Project.find({
            $or: [
                { thumbnail: regex },
                { 'thumbnailImage.publicId': image.publicId },
                { logoUrl: regex },
                { images: regex },
                { 'gallery.publicId': image.publicId }
            ]
        }).select('_id title slug').lean(),
        Article.find({
            $or: [
                { coverImage: regex },
                { 'thumbnailImage.publicId': image.publicId },
                { content: regex }
            ]
        }).select('_id title slug').lean(),
        Profile.find({
            $or: [
                { avatarUrl: regex },
                { heroImageUrl: regex }
            ]
        }).select('_id name').lean()
    ])

    const count = projects.length + articles.length + profiles.length
    return {
        imageId: String(image._id),
        publicId: image.publicId,
        inUse: count > 0,
        count,
        projects,
        articles,
        profiles
    }
}

export async function deleteImageService(id) {
    assertValidObjectId(id)
    const usage = await getImageUsageService(id)
    if (!usage) return null

    if (usage.inUse) {
        const err = new Error('Cannot delete image because it is still in use.')
        err.cause = { status: 409, usage }
        throw err
    }

    const sdk = getCloudinarySdk()
    await sdk.uploader.destroy(usage.publicId, {
        resource_type: 'image',
        invalidate: true
    })

    await Image.findByIdAndDelete(id)
    return { deleted: true, publicId: usage.publicId }
}

export async function verifyReferencedPublicIdsExist(publicIds = []) {
    const uniqueIds = [...new Set((publicIds || []).map((id) => String(id || '').trim()).filter(Boolean))]
    if (uniqueIds.length === 0) return true

    const found = await Image.find({ publicId: { $in: uniqueIds } }).select('publicId').lean()
    const foundSet = new Set(found.map((item) => item.publicId))

    for (const id of uniqueIds) {
        if (!foundSet.has(id)) {
            const err = new Error(`Referenced image publicId '${id}' does not exist in Image collection.`)
            err.cause = { status: 400 }
            throw err
        }
    }
    return true
}
