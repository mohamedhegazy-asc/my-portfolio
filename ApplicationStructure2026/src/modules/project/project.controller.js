import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import {
    getProjectsService,
    getProjectBySlugService,
    createProjectService,
    updateProjectService,
    deleteProjectService,
    incrementProjectClicksService
} from './project.service.js'
import { requireAdmin, verifyAdminToken } from '../../middleware/requireAdmin.js'
import { validateBody, projectCreateSchema, projectUpdateSchema } from '../../utils/validation.js'

const router = Router()

const clickLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false
})

// GET /api/projects — public, paginated & cached
router.get('/', async (req, res, next) => {
    try {
        const result = await getProjectsService(req.query, { all: false })
        res.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120')
        return res.status(200).json({
            success: true,
            count: result.data.length,
            ...result
        })
    } catch (error) {
        next(error)
    }
})

// GET /api/projects/:slug
router.get('/:slug', async (req, res, next) => {
    try {
        const { slug } = req.params
        const isAdmin = Boolean(verifyAdminToken(req))
        const project = await getProjectBySlugService(slug, { includePrivate: isAdmin })
        if (!project) {
            return res.status(404).json({ success: false, message: `Project with slug '${slug}' not found` })
        }
        if (!isAdmin) {
            res.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120')
        }
        return res.status(200).json({ success: true, data: project })
    } catch (error) {
        next(error)
    }
})

// POST /api/projects/:slug/click — rate-limited atomic counter
router.post('/:slug/click', clickLimiter, async (req, res, next) => {
    try {
        await incrementProjectClicksService(req.params.slug)
        return res.status(200).json({ success: true })
    } catch (error) {
        next(error)
    }
})

// POST /api/projects (Admin + strict Zod validation)
router.post('/', requireAdmin, validateBody(projectCreateSchema), async (req, res, next) => {
    try {
        const project = await createProjectService(req.body)
        return res.status(201).json({ success: true, message: 'Project created successfully', data: project })
    } catch (error) {
        next(error)
    }
})

// PUT /api/projects/:id (Admin + strict Zod validation)
router.put('/:id', requireAdmin, validateBody(projectUpdateSchema), async (req, res, next) => {
    try {
        const project = await updateProjectService(req.params.id, req.body)
        if (!project) return res.status(404).json({ success: false, message: 'Project not found' })
        return res.status(200).json({ success: true, message: 'Project updated successfully', data: project })
    } catch (error) {
        next(error)
    }
})

// DELETE /api/projects/:id (Admin)
router.delete('/:id', requireAdmin, async (req, res, next) => {
    try {
        const success = await deleteProjectService(req.params.id)
        if (!success) return res.status(404).json({ success: false, message: 'Project not found' })
        return res.status(200).json({ success: true, message: 'Project deleted successfully' })
    } catch (error) {
        next(error)
    }
})

export default router
