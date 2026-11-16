import mongoose from 'mongoose'
import { Project } from '../../DB/model/index.js'
import { getDBStatus } from '../../DB/connection.db.js'
import { defaultProjects } from '../../DB/seed.js'
import { slugify, ensureUniqueSlug } from '../../utils/slugify.js'

let inMemoryProjects = []

function buildFilter(idOrSlug) {
    if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
        return { $or: [{ _id: idOrSlug }, { slug: idOrSlug }] }
    }
    return { slug: idOrSlug }
}

export const getProjectsService = async (category, options = {}) => {
    const isAll = options.all === true
    if (getDBStatus()) {
        try {
            const query = {}
            if (category && category !== 'All') {
                query.category = category
            }
            if (!isAll) {
                query.$and = [
                    { published: { $ne: false } },
                    { status: { $ne: 'private' } },
                    { status: { $ne: 'draft' } }
                ]
            }
            const projects = await Project.find(query).sort({ order: 1, createdAt: -1 }).lean()
            return projects || []
        } catch (err) {
            console.error('Error fetching projects from MongoDB:', err.message)
        }
    }
    let list = inMemoryProjects
    if (!isAll) {
        list = list.filter(p => p.published !== false && p.status !== 'private' && p.status !== 'draft')
    }
    if (category && category !== 'All') {
        return list.filter(p => p.category.toLowerCase() === category.toLowerCase())
    }
    return list
}

export const getProjectBySlugService = async (slug) => {
    if (getDBStatus()) {
        try {
            const project = await Project.findOne({ slug }).lean()
            if (project) return project
        } catch (err) {
            console.error('Error fetching project by slug from MongoDB:', err.message)
        }
    }
    return inMemoryProjects.find(p => p.slug === slug) || null
}

// Increment click counter when a project card is clicked
export const incrementProjectClicksService = async (slug) => {
    if (getDBStatus()) {
        try {
            await Project.findOneAndUpdate({ slug }, { $inc: { clicks: 1 } })
        } catch (err) {
            console.error('Error incrementing project clicks:', err.message)
        }
        return
    }
    const proj = inMemoryProjects.find(p => p.slug === slug)
    if (proj) proj.clicks = (proj.clicks || 0) + 1
}

export const createProjectService = async (data) => {
    if (!data.title || !data.title.trim()) {
        const error = new Error('Project title is required')
        error.cause = { status: 400 }
        throw error
    }

    const baseSlug = slugify(data.slug || data.title)

    if (getDBStatus()) {
        const slug = await ensureUniqueSlug(Project, baseSlug)
        const cleanData = {
            ...data,
            title: data.title.trim(),
            slug,
            subtitle: data.subtitle ? data.subtitle.trim() : 'Project Showcase',
            category: data.category || 'Data Analysis',
            type: data.type || 'BI Dashboard',
            client: data.client || 'Client Studio',
            thumbnail: data.thumbnail || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
            liveUrl: data.liveUrl || '#',
            repoUrl: data.repoUrl || '#'
        }
        delete cleanData._id

        const newProj = await Project.create(cleanData)
        return newProj
    }

    const mockProj = {
        _id: `proj_${Date.now()}`,
        ...data,
        slug: baseSlug,
        clicks: 0,
        order: inMemoryProjects.length + 1,
        createdAt: new Date()
    }
    inMemoryProjects.unshift(mockProj)
    return mockProj
}

export const updateProjectService = async (idOrSlug, data) => {
    if (getDBStatus()) {
        const filter = buildFilter(idOrSlug)
        const existing = await Project.findOne(filter)
        if (!existing) {
            const error = new Error('Project not found')
            error.cause = { status: 404 }
            throw error
        }

        const updateData = { ...data }
        delete updateData._id

        if (data.slug && data.slug.trim()) {
            updateData.slug = await ensureUniqueSlug(Project, slugify(data.slug), existing._id)
        } else if (data.title && data.title.trim() && !existing.slug) {
            updateData.slug = await ensureUniqueSlug(Project, slugify(data.title), existing._id)
        }

        const updated = await Project.findByIdAndUpdate(
            existing._id,
            { $set: updateData },
            { new: true, runValidators: true }
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
        const filter = buildFilter(idOrSlug)
        const deleted = await Project.findOneAndDelete(filter)
        return !!deleted
    }
    const idx = inMemoryProjects.findIndex(p => p._id === idOrSlug || p.slug === idOrSlug)
    if (idx !== -1) {
        inMemoryProjects.splice(idx, 1)
        return true
    }
    return false
}
