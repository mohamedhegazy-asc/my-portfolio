import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { handleUpload } from '@vercel/blob/client'
import { requireAdmin } from '../../middleware/requireAdmin.js'
import { validateBody, assetCreateSchema, assetUpdateSchema } from '../../utils/validation.js'
import {
    ALLOWED_EXTENSIONS,
    ALLOWED_MIME_TYPES,
    FORBIDDEN_EXTENSIONS,
    MAX_ASSET_SIZE_BYTES,
    getExtension,
    getPublicUploadConfig,
    getPublicAssetByIdService,
    incrementAssetDownloadService,
    incrementAssetViewService,
    getAdminAssetsService,
    createAssetService,
    updateAssetService,
    deleteAssetService
} from './asset.service.js'

const publicAssetRouter = Router()
const adminAssetRouter = Router()

const assetCounterLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests. Please slow down.' }
})

// ─── PUBLIC ASSET ENDPOINTS ──────────────────────────────────────────────────

// GET /api/assets/:id — public metadata only
publicAssetRouter.get('/:id', async (req, res, next) => {
    try {
        const asset = await getPublicAssetByIdService(req.params.id)
        if (!asset) {
            return res.status(404).json({ success: false, message: 'Asset not found.' })
        }
        res.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120')
        return res.status(200).json({ success: true, data: asset })
    } catch (error) {
        next(error)
    }
})

// POST /api/assets/:id/download — increments download counter and returns URL
publicAssetRouter.post('/:id/download', assetCounterLimiter, async (req, res, next) => {
    try {
        const result = await incrementAssetDownloadService(req.params.id)
        if (!result) {
            return res.status(404).json({ success: false, message: 'Asset not found.' })
        }
        return res.status(200).json({ success: true, data: result })
    } catch (error) {
        next(error)
    }
})

// POST /api/assets/:id/view — increments view counter
publicAssetRouter.post('/:id/view', assetCounterLimiter, async (req, res, next) => {
    try {
        const result = await incrementAssetViewService(req.params.id)
        if (!result) {
            return res.status(404).json({ success: false, message: 'Asset not found.' })
        }
        return res.status(200).json({ success: true, data: result })
    } catch (error) {
        next(error)
    }
})

// ─── ADMIN ASSET ENDPOINTS (requireAdmin) ────────────────────────────────────

// GET /api/admin/assets/config — returns server-side upload allow-list & max size
adminAssetRouter.get('/config', requireAdmin, (req, res) => {
    return res.status(200).json({
        success: true,
        data: getPublicUploadConfig()
    })
})

// POST /api/admin/assets/upload-token — browser-direct Vercel Blob upload token
adminAssetRouter.post('/upload-token', requireAdmin, async (req, res) => {
    try {
        const jsonResponse = await handleUpload({
            body: req.body,
            request: req,
            onBeforeGenerateToken: async (pathname) => {
                const ext = getExtension(pathname)
                if (!ext || FORBIDDEN_EXTENSIONS.has(ext) || !ALLOWED_EXTENSIONS.includes(ext)) {
                    throw new Error(`File type '.${ext || 'unknown'}' is rejected.`)
                }
                return {
                    allowedContentTypes: ALLOWED_MIME_TYPES,
                    maximumSizeInBytes: MAX_ASSET_SIZE_BYTES,
                    tokenPayload: JSON.stringify({ role: 'admin' })
                }
            },
            onUploadCompleted: async () => {
                // Metadata is registered explicitly via POST /api/admin/assets
            }
        })
        return res.status(200).json(jsonResponse)
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || 'Could not generate upload token.'
        })
    }
})

// GET /api/admin/assets — paginated + filtered admin list
adminAssetRouter.get('/', requireAdmin, async (req, res, next) => {
    try {
        const { page, limit, status, kind, q } = req.query
        const result = await getAdminAssetsService({ page, limit, status, kind, q })
        return res.status(200).json({ success: true, ...result })
    } catch (error) {
        next(error)
    }
})

// POST /api/admin/assets — register uploaded file metadata (Zod validated)
adminAssetRouter.post('/', requireAdmin, validateBody(assetCreateSchema), async (req, res, next) => {
    try {
        const asset = await createAssetService(req.body)
        return res.status(201).json({
            success: true,
            message: 'Asset registered successfully.',
            data: asset
        })
    } catch (error) {
        next(error)
    }
})

// PUT /api/admin/assets/:id — update title, description, or status (Zod validated)
adminAssetRouter.put('/:id', requireAdmin, validateBody(assetUpdateSchema), async (req, res, next) => {
    try {
        const updated = await updateAssetService(req.params.id, req.body)
        if (!updated) {
            return res.status(404).json({ success: false, message: 'Asset not found.' })
        }
        return res.status(200).json({
            success: true,
            message: 'Asset updated successfully.',
            data: updated
        })
    } catch (error) {
        next(error)
    }
})

// DELETE /api/admin/assets/:id — delete asset and its Vercel Blob file
adminAssetRouter.delete('/:id', requireAdmin, async (req, res, next) => {
    try {
        const deleted = await deleteAssetService(req.params.id)
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Asset not found.' })
        }
        return res.status(200).json({
            success: true,
            message: 'Asset deleted successfully.'
        })
    } catch (error) {
        next(error)
    }
})

export { publicAssetRouter, adminAssetRouter }
