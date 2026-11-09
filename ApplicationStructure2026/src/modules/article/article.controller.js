import { Router } from 'express'
import {
    getArticlesService,
    getArticleBySlugService,
    createArticleService,
    updateArticleService,
    deleteArticleService
} from './article.service.js'

const router = Router()

// GET /api/articles
router.get('/', async (req, res, next) => {
    try {
        const { category } = req.query
        const articles = await getArticlesService(category)
        return res.status(200).json({ success: true, count: articles.length, data: articles })
    } catch (error) {
        next(error)
    }
})

// GET /api/articles/:slug
router.get('/:slug', async (req, res, next) => {
    try {
        const { slug } = req.params
        const article = await getArticleBySlugService(slug)
        if (!article) {
            return res.status(404).json({ success: false, message: `Article '${slug}' not found` })
        }
        return res.status(200).json({ success: true, data: article })
    } catch (error) {
        next(error)
    }
})

// POST /api/articles (Admin)
router.post('/', async (req, res, next) => {
    try {
        const article = await createArticleService(req.body)
        return res.status(201).json({ success: true, message: "Article published successfully", data: article })
    } catch (error) {
        next(error)
    }
})

// PUT /api/articles/:id (Admin)
router.put('/:id', async (req, res, next) => {
    try {
        const article = await updateArticleService(req.params.id, req.body)
        if (!article) return res.status(404).json({ success: false, message: "Article not found" })
        return res.status(200).json({ success: true, message: "Article updated successfully", data: article })
    } catch (error) {
        next(error)
    }
})

// DELETE /api/articles/:id (Admin)
router.delete('/:id', async (req, res, next) => {
    try {
        const success = await deleteArticleService(req.params.id)
        if (!success) return res.status(404).json({ success: false, message: "Article not found" })
        return res.status(200).json({ success: true, message: "Article deleted successfully" })
    } catch (error) {
        next(error)
    }
})

export default router

