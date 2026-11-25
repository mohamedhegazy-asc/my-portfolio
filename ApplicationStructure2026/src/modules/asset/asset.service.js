import { createHash } from 'node:crypto'
import mongoose from 'mongoose'
import { head, del } from '@vercel/blob'
import { Asset } from '../../DB/model/asset.model.js'
import { getDBStatus } from '../../DB/connection.db.js'
import { NODE_ENV } from '../../../config/config.service.js'

export const MAX_ASSET_SIZE_BYTES = 15 * 1024 * 1024 // 15 MB

export const FORBIDDEN_EXTENSIONS = new Set([
    'xlsm', 'xlsb', 'xltm', 'xlam',
    'exe', 'bat', 'cmd', 'sh', 'ps1', 'msi', 'dll',
    'js', 'mjs', 'cjs', 'ts', 'jsx', 'tsx',
    'html', 'htm', 'svg', 'php', 'py', 'rb'
])

export const EXTENSION_MIME_MAP = {
    xlsx: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/octet-stream'],
    xls: ['application/vnd.ms-excel', 'application/octet-stream'],
    csv: ['text/csv', 'application/csv', 'text/plain', 'application/vnd.ms-excel'],
    pdf: ['application/pdf'],
    png: ['image/png'],
    jpg: ['image/jpeg'],
    jpeg: ['image/jpeg'],
    webp: ['image/webp']
}

export const ALLOWED_EXTENSIONS = Object.keys(EXTENSION_MIME_MAP)
export const ALLOWED_MIME_TYPES = Array.from(new Set(Object.values(EXTENSION_MIME_MAP).flat()))

// In-memory store for development fallback only
let inMemoryAssets = []

export const getExtension = (filename = '') => {
    const base = String(filename).trim().split('/').pop().split('\\').pop()
    const parts = base.split('.')
    return parts.length > 1 ? parts.pop().toLowerCase() : ''
}

export const resolveAssetKind = (ext) => {
    if (ext === 'xlsx') return 'xlsx'
    if (ext === 'xls') return 'xls'
    if (ext === 'csv') return 'csv'
    if (ext === 'pdf') return 'pdf'
    if (['png', 'jpg', 'jpeg', 'webp'].includes(ext)) return 'image'
    return 'other'
}

export const validateAssetMetadata = ({ originalName, mimeType, size }) => {
    const ext = getExtension(originalName)
    if (!ext || FORBIDDEN_EXTENSIONS.has(ext) || !EXTENSION_MIME_MAP[ext]) {
        const err = new Error(`File type '.${ext || 'unknown'}' is not allowed.`)
        err.cause = { status: 400 }
        throw err
    }

    const numericSize = Number(size)
    if (!Number.isFinite(numericSize) || numericSize <= 0 || numericSize > MAX_ASSET_SIZE_BYTES) {
        const err = new Error(`File size must be between 1 byte and ${MAX_ASSET_SIZE_BYTES / (1024 * 1024)} MB.`)
        err.cause = { status: 400 }
        throw err
    }

    const normalizedMime = String(mimeType || '').split(';')[0].trim().toLowerCase()
    const allowedMimes = EXTENSION_MIME_MAP[ext]
    if (!allowedMimes.includes(normalizedMime)) {
        const err = new Error(`MIME type '${normalizedMime || 'unknown'}' does not match '.${ext}'.`)
        err.cause = { status: 400 }
        throw err
    }

    return { ext, kind: resolveAssetKind(ext), size: numericSize, mimeType: normalizedMime }
}

/**
 * Verify blob exists on Vercel Blob and compute SHA-256 checksum when feasible.
 */
export const verifyBlobAndChecksum = async (url, expectedSize) => {
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
        if (verifiedSize > MAX_ASSET_SIZE_BYTES) {
            const err = new Error('Uploaded blob exceeds 15 MB limit.')
            err.cause = { status: 400 }
            throw err
        }
    }

    let checksum = ''
    try {
        if (/^https:\/\//i.test(url)) {
            const resp = await fetch(url)
            if (resp.ok) {
                const buf = Buffer.from(await resp.arrayBuffer())
                if (buf.byteLength <= MAX_ASSET_SIZE_BYTES) {
                    checksum = createHash('sha256').update(buf).digest('hex')
                }
            }
        }
    } catch {
        // Non-fatal if remote fetch for checksum fails
    }

    return { verifiedSize, verifiedPathname, checksum }
}

export const getPublicAssetByIdService = async (id) => {
    if (getDBStatus()) {
        if (!mongoose.Types.ObjectId.isValid(id)) return null
        return await Asset.findOne({ _id: id, status: 'public' }).lean()
    }
    if (NODE_ENV === 'production') {
        throw new Error('Database connection unavailable')
    }
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
    if (NODE_ENV === 'production') {
        throw new Error('Database connection unavailable')
    }
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
    if (NODE_ENV === 'production') {
        throw new Error('Database connection unavailable')
    }
    const found = inMemoryAssets.find(a => a._id === id && a.status === 'public')
    if (!found) return null
    found.views = (found.views || 0) + 1
    return { views: found.views }
}

export const getAdminAssetsService = async ({ page = 1, limit = 20, status, kind, q }) => {
    const pageNum = Math.max(1, parseInt(page) || 1)
    const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 20))
    const skip = (pageNum - 1) * limitNum

    if (getDBStatus()) {
        const query = {}
        if (status && ['public', 'private', 'draft'].includes(status)) {
            query.status = status
        }
        if (kind && ['xlsx', 'xls', 'csv', 'pdf', 'image', 'other'].includes(kind)) {
            query.kind = kind
        }
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

        return {
            data,
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum) || 1
        }
    }

    if (NODE_ENV === 'production') {
        throw new Error('Database connection unavailable')
    }

    let list = [...inMemoryAssets]
    if (status && ['public', 'private', 'draft'].includes(status)) {
        list = list.filter(a => a.status === status)
    }
    if (kind && ['xlsx', 'xls', 'csv', 'pdf', 'image', 'other'].includes(kind)) {
        list = list.filter(a => a.kind === kind)
    }
    if (q && typeof q === 'string' && q.trim()) {
        const needle = q.trim().toLowerCase()
        list = list.filter(a => a.title.toLowerCase().includes(needle) || a.originalName.toLowerCase().includes(needle))
    }
    const total = list.length
    return {
        data: list.slice(skip, skip + limitNum),
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1
    }
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
    const blobInfo = await verifyBlobAndChecksum(url.trim(), validated.size)

    const docData = {
        title: title.trim().slice(0, 200),
        description: typeof description === 'string' ? description.trim().slice(0, 1000) : '',
        kind: validated.kind,
        originalName: String(originalName).trim(),
        mimeType: validated.mimeType,
        size: blobInfo.verifiedSize || validated.size,
        url: url.trim(),
        pathname: blobInfo.verifiedPathname || String(pathname || '').trim(),
        status: validStatus,
        ...(Number.isFinite(Number(sheetCount)) ? { sheetCount: Number(sheetCount) } : {}),
        checksum: blobInfo.checksum || (typeof checksum === 'string' ? checksum.trim() : '')
    }

    if (getDBStatus()) {
        return await Asset.create(docData)
    }
    if (NODE_ENV === 'production') {
        throw new Error('Database connection unavailable')
    }
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
    if (NODE_ENV === 'production') {
        throw new Error('Database connection unavailable')
    }
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

    if (NODE_ENV === 'production') {
        throw new Error('Database connection unavailable')
    }

    const idx = inMemoryAssets.findIndex(a => a._id === id)
    if (idx === -1) return null
    const asset = inMemoryAssets[idx]
    if (asset.url && process.env.BLOB_READ_WRITE_TOKEN) {
        await deleteBlobFn(asset.url)
    }
    inMemoryAssets.splice(idx, 1)
    return true
}
