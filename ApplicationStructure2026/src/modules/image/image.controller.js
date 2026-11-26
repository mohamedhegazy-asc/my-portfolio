import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { requireAdmin } from '../../middleware/requireAdmin.js'
import { validateBody, imageSignSchema, imageRegisterSchema, imageUpdateSchema } from '../../utils/validation.js'
import { isCloudinaryConfigured } from './cloudinary.client.js'
import {
    signImageUploadService,
    registerImageService,
    getAdminImagesService,
    updateImageService,
    getImageUsageService,
    deleteImageService
} from './image.service.js'

const adminImageRouter = Router()

const imageLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many image requests. Please slow down.' }
})

function requireCloudinaryConfigured(req, res, next) {
    if (!isCloudinaryConfigured()) {
        return res.status(503).json({
            success: false,
            message: 'Cloudinary image service is not configured.'
        })
    }
    next()
}

adminImageRouter.use(requireAdmin, imageLimiter, requireCloudinaryConfigured)

// POST /api/admin/images/sign
adminImageRouter.post('/sign', validateBody(imageSignSchema), (req, res, next) => {
    try {
        const signed = signImageUploadService(req.body)
        return res.status(200).json({ success: true, data: signed })
    } catch (error) {
        next(error)
    }
})

// POST /api/admin/images
adminImageRouter.post('/', validateBody(imageRegisterSchema), async (req, res, next) => {
    try {
        const image = await registerImageService(req.body)
        return res.status(201).json({
            success: true,
            message: 'Image verified and registered successfully.',
            data: image
        })
    } catch (error) {
        next(error)
    }
})

// GET /api/admin/images
adminImageRouter.get('/', async (req, res, next) => {
    try {
        const { page, limit, purpose, q } = req.query
        const result = await getAdminImagesService({ page, limit, purpose, q })
        return res.status(200).json({ success: true, ...result })
    } catch (error) {
        next(error)
    }
})

// PUT /api/admin/images/:id
adminImageRouter.put('/:id', validateBody(imageUpdateSchema), async (req, res, next) => {
    try {
        const updated = await updateImageService(req.params.id, req.body)
        if (!updated) {
            return res.status(404).json({ success: false, message: 'Image not found.' })
        }
        return res.status(200).json({
            success: true,
            message: 'Image updated successfully.',
            data: updated
        })
    } catch (error) {
        next(error)
    }
})

// GET /api/admin/images/:id/usage
adminImageRouter.get('/:id/usage', async (req, res, next) => {
    try {
        const usage = await getImageUsageService(req.params.id)
        if (!usage) {
            return res.status(404).json({ success: false, message: 'Image not found.' })
        }
        return res.status(200).json({ success: true, data: usage })
    } catch (error) {
        next(error)
    }
})

// DELETE /api/admin/images/:id
adminImageRouter.delete('/:id', async (req, res, next) => {
    try {
        const result = await deleteImageService(req.params.id)
        if (!result) {
            return res.status(404).json({ success: false, message: 'Image not found.' })
        }
        return res.status(200).json({
            success: true,
            message: 'Image deleted successfully.',
            data: result
        })
    } catch (error) {
        if (error?.cause?.status === 409 && error?.cause?.usage) {
            return res.status(409).json({
                success: false,
                message: error.message,
                usage: error.cause.usage
            })
        }
        next(error)
    }
})

export default adminImageRouter
