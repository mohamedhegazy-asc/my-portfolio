import { Router } from 'express'
import {
    getArticlesService,
    getArticleBySlugService,
    createArticleService,
    updateArticleService,
    deleteArticleService
} from './article.service.js'
import { requireAdmin, verifyAdminToken } from '../../middleware/requireAdmin.js'
import { validateBody, articleCreateSchema, articleUpdateSchema } from '../../utils/validation.js'

const router = Router()

// GET /api/articles — public, paginated & cached
router.get('/', async (req, res, next) => {
    try {
        const result = await getArticlesService(req.query, { all: false })
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

// GET /api/articles/:slug
router.get('/:slug', async (req, res, next) => {
    try {
        const { slug } = req.params
        const isAdmin = Boolean(verifyAdminToken(req))
        const article = await getArticleBySlugService(slug, { includePrivate: isAdmin })
        if (!article) {
            return res.status(404).json({ success: false, message: `Article '${slug}' not found` })
        }
        if (!isAdmin) {
            res.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120')
        }
        return res.status(200).json({ success: true, data: article })
    } catch (error) {
        next(error)
    }
})

// POST /api/articles (Admin + strict Zod validation)
router.post('/', requireAdmin, validateBody(articleCreateSchema), async (req, res, next) => {
    try {
        const article = await createArticleService(req.body)
        return res.status(201).json({ success: true, message: "Article published successfully", data: article })
    } catch (error) {
        next(error)
    }
})

// PUT /api/articles/:id (Admin + strict Zod validation)
router.put('/:id', requireAdmin, validateBody(articleUpdateSchema), async (req, res, next) => {
    try {
        const article = await updateArticleService(req.params.id, req.body)
        if (!article) return res.status(404).json({ success: false, message: "Article not found" })
        return res.status(200).json({ success: true, message: "Article updated successfully", data: article })
    } catch (error) {
        next(error)
    }
})

// DELETE /api/articles/:id (Admin)
router.delete('/:id', requireAdmin, async (req, res, next) => {
    try {
        const success = await deleteArticleService(req.params.id)
        if (!success) return res.status(404).json({ success: false, message: "Article not found" })
        return res.status(200).json({ success: true, message: "Article deleted successfully" })
    } catch (error) {
        next(error)
    }
})

export default router
