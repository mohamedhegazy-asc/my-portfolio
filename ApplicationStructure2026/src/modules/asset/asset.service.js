import { createHash } from 'node:crypto'
import mongoose from 'mongoose'
import { head, del } from '@vercel/blob'
import { Asset } from '../../DB/model/asset.model.js'
import { getDBStatus } from '../../DB/connection.db.js'
import { NODE_ENV, MAX_UPLOAD_MB, MAX_UPLOAD_BYTES } from '../../../config/config.service.js'
import {
    FILE_TYPE_REGISTRY,
    FORBIDDEN_EXTENSIONS,
    ALLOWED_EXTENSIONS,
    ALLOWED_MIME_TYPES,
    ASSET_KINDS,
    getPublicUploadConfig
} from './asset.config.js'
import { inspectFileBuffer } from './fileInspector.js'

export {
    FILE_TYPE_REGISTRY,
    FORBIDDEN_EXTENSIONS,
    ALLOWED_EXTENSIONS,
    ALLOWED_MIME_TYPES,
    ASSET_KINDS,
    MAX_UPLOAD_MB,
    MAX_UPLOAD_BYTES as MAX_ASSET_SIZE_BYTES,
    getPublicUploadConfig
}

let inMemoryAssets = []

export const getExtension = (filename = '') => {
    const base = String(filename).trim().split('/').pop().split('\\').pop()
    const parts = base.split('.')
    return parts.length > 1 ? parts.pop().toLowerCase() : ''
}

export const resolveAssetMetaByExt = (ext) => {
    const entry = FILE_TYPE_REGISTRY[ext]
    if (!entry) return { kind: 'other', previewMode: 'download-only', isLegacy: false }
    return { kind: entry.kind, previewMode: entry.previewMode, isLegacy: entry.isLegacy }
}

export const validateAssetMetadata = ({ originalName, mimeType, size }) => {
    const ext = getExtension(originalName)
    const entry = FILE_TYPE_REGISTRY[ext]
    if (!ext || FORBIDDEN_EXTENSIONS.has(ext) || !entry) {
        const err = new Error(`File type '.${ext || 'unknown'}' is not allowed.`)
        err.cause = { status: 400 }
        throw err
    }

    const numericSize = Number(size)
    if (!Number.isFinite(numericSize) || numericSize <= 0 || numericSize > MAX_UPLOAD_BYTES) {
        const err = new Error(`File size must be between 1 byte and ${MAX_UPLOAD_MB} MB.`)
        err.cause = { status: 400 }
        throw err
    }

    const normalizedMime = String(mimeType || '').split(';')[0].trim().toLowerCase()
    if (!entry.mimes.includes(normalizedMime)) {
        const err = new Error(`MIME type '${normalizedMime || 'unknown'}' does not match '.${ext}'.`)
        err.cause = { status: 400 }
        throw err
    }

    return {
        ext,
        kind: entry.kind,
        previewMode: entry.previewMode,
        isLegacy: entry.isLegacy,
        size: numericSize,
        mimeType: normalizedMime
    }
}

/**
 * Verify blob exists on Vercel Blob, verify actual file signature & OOXML ZIP entries,
 * and compute SHA-256 checksum.
 */
export const verifyBlobAndChecksum = async (url, expectedSize, ext) => {
    const hasBlobToken = Boolean(process.env.BLOB_READ_WRITE_TOKEN)
    let verifiedSize = expectedSize
    let verifiedPathname = ''

    if (hasBlobToken) {
        const blobMeta = await head(url)
        if (!blobMeta) {
            const err = new Error('Uploaded blob could not be verified.')
            err.cause = { status: 400 }
            throw err
        }
        verifiedSize = blobMeta.size
        verifiedPathname = blobMeta.pathname || ''
        if (verifiedSize > MAX_UPLOAD_BYTES) {
            const err = new Error(`Uploaded blob exceeds ${MAX_UPLOAD_MB} MB limit.`)
            err.cause = { status: 400 }
            throw err
        }
    }

    let checksum = ''
    let verifiedSignature = false
    let entryCount = undefined

    if (/^https?:\/\//i.test(url)) {
        let resp = null
        try {
            resp = await fetch(url)
        } catch {
            resp = null
        }

        if (resp && resp.ok) {
            const buf = Buffer.from(await resp.arrayBuffer())
            if (buf.byteLength > MAX_UPLOAD_BYTES) {
                const err = new Error(`Downloaded file exceeds ${MAX_UPLOAD_MB} MB limit.`)
                err.cause = { status: 400 }
                throw err
            }
            const inspected = inspectFileBuffer(buf, ext)
            verifiedSignature = inspected.verifiedSignature
            entryCount = inspected.entryCount
            checksum = createHash('sha256').update(buf).digest('hex')
        }
    }

    return { verifiedSize, verifiedPathname, checksum, verifiedSignature, entryCount }
}

export const getPublicAssetByIdService = async (id) => {
    if (getDBStatus()) {
        if (!mongoose.Types.ObjectId.isValid(id)) return null
        return await Asset.findOne({ _id: id, status: 'public' }).lean()
    }
    if (NODE_ENV === 'production') throw new Error('Database connection unavailable')
    return inMemoryAssets.find(a => a._id === id && a.status === 'public') || null
}

export const incrementAssetDownloadService = async (id) => {
    if (getDBStatus()) {
        if (!mongoose.Types.ObjectId.isValid(id)) return null
        const asset = await Asset.findOneAndUpdate(
            { _id: id, status: 'public' },
            { $inc: { downloads: 1 } },
            { new: true }
        ).lean()
        return asset ? { url: asset.url, downloads: asset.downloads } : null
    }
    if (NODE_ENV === 'production') throw new Error('Database connection unavailable')
    const found = inMemoryAssets.find(a => a._id === id && a.status === 'public')
    if (!found) return null
    found.downloads = (found.downloads || 0) + 1
    return { url: found.url, downloads: found.downloads }
}

export const incrementAssetViewService = async (id) => {
    if (getDBStatus()) {
        if (!mongoose.Types.ObjectId.isValid(id)) return null
        const asset = await Asset.findOneAndUpdate(
            { _id: id, status: 'public' },
            { $inc: { views: 1 } },
            { new: true }
        ).lean()
        return asset ? { views: asset.views } : null
    }
    if (NODE_ENV === 'production') throw new Error('Database connection unavailable')
    const found = inMemoryAssets.find(a => a._id === id && a.status === 'public')
    if (!found) return null
    found.views = (found.views || 0) + 1
    return { views: found.views }
}

export const getAdminAssetsService = async ({ page = 1, limit = 20, status, kind, q }) => {
    const pageNum = Math.max(1, parseInt(page) || 1)
    const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 20))
    const skip = (pageNum - 1) * limitNum

    const kindFilter = kind && ASSET_KINDS.includes(kind) ? kind : null

    if (getDBStatus()) {
        const query = {}
        if (status && ['public', 'private', 'draft'].includes(status)) query.status = status
        if (kindFilter) query.kind = kindFilter
        if (q && typeof q === 'string' && q.trim()) {
            const escaped = q.trim().slice(0, 100).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
            query.$or = [
                { title: { $regex: escaped, $options: 'i' } },
                { originalName: { $regex: escaped, $options: 'i' } }
            ]
        }

        const [total, data] = await Promise.all([
            Asset.countDocuments(query),
            Asset.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean()
        ])

        return { data, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) || 1 }
    }

    if (NODE_ENV === 'production') throw new Error('Database connection unavailable')

    let list = [...inMemoryAssets]
    if (status && ['public', 'private', 'draft'].includes(status)) list = list.filter(a => a.status === status)
    if (kindFilter) list = list.filter(a => a.kind === kindFilter)
    if (q && typeof q === 'string' && q.trim()) {
        const needle = q.trim().toLowerCase()
        list = list.filter(a => a.title.toLowerCase().includes(needle) || a.originalName.toLowerCase().includes(needle))
    }
    const total = list.length
    return { data: list.slice(skip, skip + limitNum), total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) || 1 }
}

export const createAssetService = async (payload) => {
    const {
        title,
        description = '',
        originalName,
        mimeType,
        size,
        url,
        pathname = '',
        status = 'draft',
        sheetCount,
        checksum = ''
    } = payload

    if (!title || typeof title !== 'string' || !title.trim()) {
        const err = new Error('Asset title is required.')
        err.cause = { status: 400 }
        throw err
    }
    if (!url || typeof url !== 'string' || !/^https?:\/\//i.test(url.trim())) {
        const err = new Error('Valid asset URL is required.')
        err.cause = { status: 400 }
        throw err
    }

    const validStatus = ['public', 'private', 'draft'].includes(status) ? status : 'draft'
    const validated = validateAssetMetadata({ originalName, mimeType, size })
    const blobInfo = await verifyBlobAndChecksum(url.trim(), validated.size, validated.ext)

    const docData = {
        title: title.trim().slice(0, 200),
        description: typeof description === 'string' ? description.trim().slice(0, 1000) : '',
        kind: validated.kind,
        previewMode: validated.previewMode,
        isLegacy: validated.isLegacy,
        verifiedSignature: blobInfo.verifiedSignature,
        ...(blobInfo.entryCount !== undefined ? { entryCount: blobInfo.entryCount } : {}),
        originalName: String(originalName).trim(),
        mimeType: validated.mimeType,
        size: blobInfo.verifiedSize || validated.size,
        url: url.trim(),
        pathname: blobInfo.verifiedPathname || String(pathname || '').trim(),
        status: validStatus,
        ...(Number.isFinite(Number(sheetCount)) ? { sheetCount: Number(sheetCount) } : {}),
        checksum: blobInfo.checksum || (typeof checksum === 'string' ? checksum.trim() : '')
    }

    if (getDBStatus()) return await Asset.create(docData)
    if (NODE_ENV === 'production') throw new Error('Database connection unavailable')

    const memAsset = {
        _id: new mongoose.Types.ObjectId().toString(),
        ...docData,
        downloads: 0,
        views: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
    inMemoryAssets.unshift(memAsset)
    return memAsset
}

export const updateAssetService = async (id, payload) => {
    const update = {}
    if (typeof payload?.title === 'string' && payload.title.trim()) {
        update.title = payload.title.trim().slice(0, 200)
    }
    if (typeof payload?.description === 'string') {
        update.description = payload.description.trim().slice(0, 1000)
    }
    if (payload?.status && ['public', 'private', 'draft'].includes(payload.status)) {
        update.status = payload.status
    }

    if (getDBStatus()) {
        if (!mongoose.Types.ObjectId.isValid(id)) return null
        return await Asset.findByIdAndUpdate(id, { $set: update }, { new: true }).lean()
    }
    if (NODE_ENV === 'production') throw new Error('Database connection unavailable')

    const idx = inMemoryAssets.findIndex(a => a._id === id)
    if (idx === -1) return null
    inMemoryAssets[idx] = { ...inMemoryAssets[idx], ...update, updatedAt: new Date().toISOString() }
    return inMemoryAssets[idx]
}

export const deleteAssetService = async (id, deleteBlobFn = del) => {
    if (getDBStatus()) {
        if (!mongoose.Types.ObjectId.isValid(id)) return null
        const asset = await Asset.findById(id).lean()
        if (!asset) return null

        if (asset.url && process.env.BLOB_READ_WRITE_TOKEN) {
            await deleteBlobFn(asset.url)
        }
        await Asset.findByIdAndDelete(id)
        return true
    }

    if (NODE_ENV === 'production') throw new Error('Database connection unavailable')

    const idx = inMemoryAssets.findIndex(a => a._id === id)
    if (idx === -1) return null
    const asset = inMemoryAssets[idx]
    if (asset.url && process.env.BLOB_READ_WRITE_TOKEN) {
        await deleteBlobFn(asset.url)
    }
    inMemoryAssets.splice(idx, 1)
    return true
}
