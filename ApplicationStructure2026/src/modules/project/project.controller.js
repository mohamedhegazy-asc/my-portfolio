import { Router } from 'express'
import {
    getProjectsService,
    getProjectBySlugService,
    createProjectService,
    updateProjectService,
    deleteProjectService
} from './project.service.js'

const router = Router()

// GET /api/projects
router.get('/', async (req, res, next) => {
    try {
        const { category } = req.query
        const projects = await getProjectsService(category)
        return res.status(200).json({ success: true, count: projects.length, data: projects })
    } catch (error) {
        next(error)
    }
})

// GET /api/projects/:slug
router.get('/:slug', async (req, res, next) => {
    try {
        const { slug } = req.params
        const project = await getProjectBySlugService(slug)
        if (!project) {
            return res.status(404).json({ success: false, message: `Project with slug '${slug}' not found` })
        }
        return res.status(200).json({ success: true, data: project })
    } catch (error) {
        next(error)
    }
})

// POST /api/projects (Admin)
router.post('/', async (req, res, next) => {
    try {
        const project = await createProjectService(req.body)
        return res.status(201).json({ success: true, message: "Project created successfully", data: project })
    } catch (error) {
        next(error)
    }
})

// PUT /api/projects/:id (Admin)
router.put('/:id', async (req, res, next) => {
    try {
        const project = await updateProjectService(req.params.id, req.body)
        if (!project) return res.status(404).json({ success: false, message: "Project not found" })
        return res.status(200).json({ success: true, message: "Project updated successfully", data: project })
    } catch (error) {
        next(error)
    }
})

// DELETE /api/projects/:id (Admin)
router.delete('/:id', async (req, res, next) => {
    try {
        const success = await deleteProjectService(req.params.id)
        if (!success) return res.status(404).json({ success: false, message: "Project not found" })
        return res.status(200).json({ success: true, message: "Project deleted successfully" })
    } catch (error) {
        next(error)
    }
})

export default router
