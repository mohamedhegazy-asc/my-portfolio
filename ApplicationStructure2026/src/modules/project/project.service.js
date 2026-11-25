import mongoose from 'mongoose'
import { Project } from '../../DB/model/index.js'
import { getDBStatus } from '../../DB/connection.db.js'
import { slugify, ensureUniqueSlug } from '../../utils/slugify.js'
import { NODE_ENV } from '../../../config/config.service.js'
import { sanitizeListQuery } from '../../utils/validation.js'

let inMemoryProjects = []

const ALLOWED_WRITE_FIELDS = [
    'title', 'slug', 'subtitle', 'logoUrl', 'category', 'type', 'client',
    'thumbnail', 'images', 'liveUrl', 'repoUrl', 'order', 'featured',
    'published', 'status', 'description', 'tags', 'tech', 'attachments'
]

function pickAllowed(data = {}) {
    const out = {}
    for (const key of ALLOWED_WRITE_FIELDS) {
        if (data[key] !== undefined) out[key] = data[key]
    }
    return out
}

function buildFilter(idOrSlug) {
    if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
        return { $or: [{ _id: idOrSlug }, { slug: idOrSlug }] }
    }
    return { slug: idOrSlug }
}

export const getProjectsService = async (rawQueryOrCategory, options = {}) => {
    const isAll = options.all === true
    const rawQuery = typeof rawQueryOrCategory === 'string'
        ? { category: rawQueryOrCategory }
        : (rawQueryOrCategory || {})
    const { page, limit, category, q, sort } = sanitizeListQuery(rawQuery)
    const skip = (page - 1) * limit

    if (getDBStatus()) {
        try {
            const query = {}
            if (category && category !== 'All') query.category = category
            if (q) {
                const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
                query.$or = [
                    { title: { $regex: escaped, $options: 'i' } },
                    { subtitle: { $regex: escaped, $options: 'i' } },
                    { tags: { $regex: escaped, $options: 'i' } }
                ]
            }
            if (!isAll) {
                query.$and = [
                    { published: { $ne: false } },
                    { status: { $ne: 'private' } },
                    { status: { $ne: 'draft' } }
                ]
            }

            const sortObj = sort === 'clicks'
                ? { clicks: -1 }
                : sort === 'newest'
                    ? { order: 1, createdAt: -1 }
                    : { order: 1, createdAt: -1 }

            const projection = isAll ? {} : { description: 0 }
            const [total, data] = await Promise.all([
                Project.countDocuments(query),
                Project.find(query, projection).sort(sortObj).skip(skip).limit(limit).lean()
            ])
            return { data: data || [], page, limit, total }
        } catch (err) {
            console.error('Error fetching projects from MongoDB:', err.message)
            if (NODE_ENV === 'production') throw err
        }
    }
    if (NODE_ENV === 'production') {
        throw new Error('Database connection unavailable')
    }
    let list = [...inMemoryProjects]
    if (!isAll) {
        list = list.filter(p => p.published !== false && p.status !== 'private' && p.status !== 'draft')
    }
    if (category && category !== 'All') {
        list = list.filter(p => (p.category || '').toLowerCase() === category.toLowerCase())
    }
    if (q) {
        const needle = q.toLowerCase()
        list = list.filter(p => (p.title || '').toLowerCase().includes(needle) || (p.subtitle || '').toLowerCase().includes(needle))
    }
    return { data: list.slice(skip, skip + limit), page, limit, total: list.length }
}

export const getProjectBySlugService = async (slug, options = {}) => {
    const includePrivate = options.includePrivate === true
    const publicFilter = includePrivate
        ? { slug }
        : { slug, published: { $ne: false }, status: { $nin: ['private', 'draft'] } }
    if (getDBStatus()) {
        try {
            return await Project.findOne(publicFilter)
                .populate({ path: 'attachments', match: includePrivate ? {} : { status: 'public' } })
                .lean()
        } catch (err) {
            console.error('Error fetching project by slug from MongoDB:', err.message)
            if (NODE_ENV === 'production') throw err
        }
    }
    if (NODE_ENV === 'production') throw new Error('Database connection unavailable')
    const found = inMemoryProjects.find(p => p.slug === slug)
    if (!found) return null
    if (!includePrivate && (found.published === false || found.status === 'private' || found.status === 'draft')) {
        return null
    }
    return found
}

export const incrementProjectClicksService = async (slug) => {
    if (getDBStatus()) {
        await Project.findOneAndUpdate({ slug }, { $inc: { clicks: 1 } })
        return
    }
    const proj = inMemoryProjects.find(p => p.slug === slug)
    if (proj) proj.clicks = (proj.clicks || 0) + 1
}

export const createProjectService = async (data) => {
    const clean = pickAllowed(data)
    const baseSlug = slugify(clean.slug || clean.title)

    if (getDBStatus()) {
        const slug = await ensureUniqueSlug(Project, baseSlug)
        return await Project.create({
            ...clean,
            title: clean.title.trim(),
            slug,
            subtitle: clean.subtitle ? clean.subtitle.trim() : 'Project Showcase',
            category: clean.category || 'Data Analysis',
            type: clean.type || 'BI Dashboard',
            client: clean.client || 'Client Studio',
            thumbnail: clean.thumbnail || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
            liveUrl: clean.liveUrl || '#',
            repoUrl: clean.repoUrl || '#'
        })
    }

    const mockProj = {
        _id: new mongoose.Types.ObjectId().toString(),
        ...clean,
        slug: baseSlug,
        clicks: 0,
        order: inMemoryProjects.length + 1,
        createdAt: new Date()
    }
    inMemoryProjects.unshift(mockProj)
    return mockProj
}

export const updateProjectService = async (idOrSlug, data) => {
    const updateData = pickAllowed(data)
    if (getDBStatus()) {
        const existing = await Project.findOne(buildFilter(idOrSlug))
        if (!existing) {
            const error = new Error('Project not found')
            error.cause = { status: 404 }
            throw error
        }

        if (updateData.slug && updateData.slug.trim()) {
            updateData.slug = await ensureUniqueSlug(Project, slugify(updateData.slug), existing._id)
        } else if (updateData.title && updateData.title.trim() && !existing.slug) {
            updateData.slug = await ensureUniqueSlug(Project, slugify(updateData.title), existing._id)
        }

        return await Project.findByIdAndUpdate(
            existing._id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).lean()
    }

    const idx = inMemoryProjects.findIndex(p => p._id === idOrSlug || p.slug === idOrSlug)
    if (idx !== -1) {
        inMemoryProjects[idx] = { ...inMemoryProjects[idx], ...updateData }
        return inMemoryProjects[idx]
    }
    return null
}

export const deleteProjectService = async (idOrSlug) => {
    if (getDBStatus()) {
        const deleted = await Project.findOneAndDelete(buildFilter(idOrSlug))
        return !!deleted
    }
    const idx = inMemoryProjects.findIndex(p => p._id === idOrSlug || p.slug === idOrSlug)
    if (idx !== -1) {
        inMemoryProjects.splice(idx, 1)
        return true
    }
    return false
}
