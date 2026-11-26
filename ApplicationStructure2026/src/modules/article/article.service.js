import mongoose from 'mongoose'
import { Article } from '../../DB/model/index.js'
import { getDBStatus } from '../../DB/connection.db.js'
import { slugify, ensureUniqueSlug } from '../../utils/slugify.js'
import { NODE_ENV } from '../../../config/config.service.js'
import { sanitizeListQuery } from '../../utils/validation.js'
import { verifyReferencedPublicIdsExist } from '../image/image.service.js'

let inMemoryArticles = []

const ALLOWED_WRITE_FIELDS = [
    'title', 'slug', 'excerpt', 'content', 'category', 'coverImage', 'thumbnailImage',
    'readTime', 'author', 'published', 'status', 'publishedAt', 'tags', 'attachments'
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

export const getArticlesService = async (rawQueryOrCategory, options = {}) => {
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
                    { excerpt: { $regex: escaped, $options: 'i' } },
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

            const sortObj = sort === 'views' ? { views: -1 } : { publishedAt: -1, createdAt: -1 }
            const projection = isAll ? {} : { content: 0 }

            const [total, data] = await Promise.all([
                Article.countDocuments(query),
                Article.find(query, projection).sort(sortObj).skip(skip).limit(limit).lean()
            ])
            return { data: data || [], page, limit, total }
        } catch (err) {
            console.error('Error fetching articles from MongoDB:', err.message)
            if (NODE_ENV === 'production') throw err
        }
    }
    if (NODE_ENV === 'production') {
        throw new Error('Database connection unavailable')
    }
    let list = [...inMemoryArticles]
    if (!isAll) {
        list = list.filter(a => a.published !== false && a.status !== 'private' && a.status !== 'draft')
    }
    if (category && category !== 'All') {
        list = list.filter(a => (a.category || '').toLowerCase() === category.toLowerCase())
    }
    if (q) {
        const needle = q.toLowerCase()
        list = list.filter(a => (a.title || '').toLowerCase().includes(needle) || (a.excerpt || '').toLowerCase().includes(needle))
    }
    return { data: list.slice(skip, skip + limit), page, limit, total: list.length }
}

export const getArticleBySlugService = async (slug, options = {}) => {
    const includePrivate = options.includePrivate === true
    const publicFilter = includePrivate
        ? { slug }
        : { slug, published: { $ne: false }, status: { $nin: ['private', 'draft'] } }

    if (getDBStatus()) {
        try {
            return await Article.findOneAndUpdate(
                publicFilter,
                { $inc: { views: 1 } },
                { new: true }
            )
                .populate({ path: 'attachments', match: includePrivate ? {} : { status: 'public' } })
                .lean()
        } catch (err) {
            console.error('Error fetching article by slug from MongoDB:', err.message)
            if (NODE_ENV === 'production') throw err
        }
    }
    if (NODE_ENV === 'production') throw new Error('Database connection unavailable')
    const found = inMemoryArticles.find(a => a.slug === slug)
    if (!found) return null
    if (!includePrivate && (found.published === false || found.status === 'private' || found.status === 'draft')) {
        return null
    }
    found.views = (found.views || 0) + 1
    return found
}

export const createArticleService = async (data) => {
    const clean = pickAllowed(data)
    const baseSlug = slugify(clean.slug || clean.title)
    const publishedAt = clean.published !== false ? (clean.publishedAt ? new Date(clean.publishedAt) : new Date()) : null
    const excerpt = clean.excerpt && clean.excerpt.trim()
        ? clean.excerpt.trim()
        : clean.content.trim().slice(0, 150) + '...'

    if (getDBStatus()) {
        if (clean.thumbnailImage?.publicId) {
            await verifyReferencedPublicIdsExist([clean.thumbnailImage.publicId])
        }
        const slug = await ensureUniqueSlug(Article, baseSlug)
        return await Article.create({
            ...clean,
            title: clean.title.trim(),
            slug,
            excerpt,
            content: clean.content.trim(),
            category: clean.category || 'Data Analysis',
            coverImage: clean.coverImage || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
            readTime: clean.readTime || '5 min read',
            author: clean.author || 'Mohamed Mahmoud Hegazy',
            published: clean.published !== false,
            publishedAt
        })
    }

    const mockArticle = {
        _id: new mongoose.Types.ObjectId().toString(),
        ...clean,
        slug: baseSlug,
        excerpt,
        views: 0,
        publishedAt,
        createdAt: new Date(),
        updatedAt: new Date()
    }
    inMemoryArticles.unshift(mockArticle)
    return mockArticle
}

export const updateArticleService = async (idOrSlug, data) => {
    const updateData = pickAllowed(data)
    if (getDBStatus()) {
        if (updateData.thumbnailImage?.publicId) {
            await verifyReferencedPublicIdsExist([updateData.thumbnailImage.publicId])
        }
        const existing = await Article.findOne(buildFilter(idOrSlug))
        if (!existing) {
            const error = new Error('Article not found')
            error.cause = { status: 404 }
            throw error
        }

        if (updateData.slug && updateData.slug.trim()) {
            updateData.slug = await ensureUniqueSlug(Article, slugify(updateData.slug), existing._id)
        } else if (updateData.title && updateData.title.trim() && !existing.slug) {
            updateData.slug = await ensureUniqueSlug(Article, slugify(updateData.title), existing._id)
        }

        if (updateData.published === true && !existing.publishedAt && !updateData.publishedAt) {
            updateData.publishedAt = new Date()
        }

        return await Article.findByIdAndUpdate(
            existing._id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).lean()
    }

    const idx = inMemoryArticles.findIndex(a => a._id === idOrSlug || a.slug === idOrSlug)
    if (idx !== -1) {
        inMemoryArticles[idx] = { ...inMemoryArticles[idx], ...updateData, updatedAt: new Date() }
        return inMemoryArticles[idx]
    }
    return null
}

export const deleteArticleService = async (idOrSlug) => {
    if (getDBStatus()) {
        const deleted = await Article.findOneAndDelete(buildFilter(idOrSlug))
        return !!deleted
    }
    const idx = inMemoryArticles.findIndex(a => a._id === idOrSlug || a.slug === idOrSlug)
    if (idx !== -1) {
        inMemoryArticles.splice(idx, 1)
        return true
    }
    return false
}
