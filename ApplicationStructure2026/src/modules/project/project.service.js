import { Project } from '../../DB/model/index.js'
import { getDBStatus } from '../../DB/connection.db.js'
import { defaultProjects } from '../../DB/seed.js'

let inMemoryProjects = [...defaultProjects]

export const getProjectsService = async (category) => {
    if (getDBStatus()) {
        try {
            const query = category && category !== 'All' ? { category } : {}
            const projects = await Project.find(query).sort({ order: 1, createdAt: -1 }).lean()
            if (projects && projects.length > 0) return projects
        } catch (err) {
            console.error("Error fetching projects from MongoDB:", err.message)
        }
    }
    
    // In-memory fallback
    if (category && category !== 'All') {
        return inMemoryProjects.filter(p => p.category.toLowerCase() === category.toLowerCase())
    }
    return inMemoryProjects
}

export const getProjectBySlugService = async (slug) => {
    if (getDBStatus()) {
        try {
            const project = await Project.findOne({ slug }).lean()
            if (project) return project
        } catch (err) {
            console.error("Error fetching project by slug from MongoDB:", err.message)
        }
    }
    
    // In-memory fallback
    const found = inMemoryProjects.find(p => p.slug === slug)
    return found || null
}

export const createProjectService = async (data) => {
    if (!data.title || !data.subtitle) {
        const error = new Error("Title and subtitle are required")
        error.cause = { status: 400 }
        throw error
    }

    const slug = data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')

    if (getDBStatus()) {
        const newProj = await Project.create({ ...data, slug })
        return newProj
    }

    const mockProj = {
        _id: `proj_${Date.now()}`,
        ...data,
        slug,
        order: inMemoryProjects.length + 1,
        createdAt: new Date()
    }
    inMemoryProjects.unshift(mockProj)
    return mockProj
}

export const updateProjectService = async (idOrSlug, data) => {
    if (getDBStatus()) {
        const updated = await Project.findOneAndUpdate(
            { $or: [{ _id: idOrSlug }, { slug: idOrSlug }] },
            { $set: data },
            { new: true }
        )
        return updated
    }

    const idx = inMemoryProjects.findIndex(p => p._id === idOrSlug || p.slug === idOrSlug)
    if (idx !== -1) {
        inMemoryProjects[idx] = { ...inMemoryProjects[idx], ...data }
        return inMemoryProjects[idx]
    }
    return null
}

export const deleteProjectService = async (idOrSlug) => {
    if (getDBStatus()) {
        const deleted = await Project.findOneAndDelete({
            $or: [{ _id: idOrSlug }, { slug: idOrSlug }]
        })
        return !!deleted
    }

    const idx = inMemoryProjects.findIndex(p => p._id === idOrSlug || p.slug === idOrSlug)
    if (idx !== -1) {
        inMemoryProjects.splice(idx, 1)
        return true
    }
    return false
}
