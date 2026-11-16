import mongoose from 'mongoose'
import { Article } from '../../DB/model/index.js'
import { getDBStatus } from '../../DB/connection.db.js'
import { defaultArticles } from '../../DB/seed.js'
import { slugify, ensureUniqueSlug } from '../../utils/slugify.js'

let inMemoryArticles = []

function buildFilter(idOrSlug) {
    if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
        return { $or: [{ _id: idOrSlug }, { slug: idOrSlug }] }
    }
    return { slug: idOrSlug }
}

export const getArticlesService = async (category) => {
    if (getDBStatus()) {
        try {
            const query = category && category !== 'All' ? { category } : {}
            const articles = await Article.find(query).sort({ publishedAt: -1, createdAt: -1 }).lean()
            return articles || []
        } catch (err) {
            console.error('Error fetching articles from MongoDB:', err.message)
        }
    }
    if (category && category !== 'All') {
        return inMemoryArticles.filter(a => a.category.toLowerCase() === category.toLowerCase())
    }
    return inMemoryArticles
}

export const getArticleBySlugService = async (slug) => {
    if (getDBStatus()) {
        try {
            const article = await Article.findOneAndUpdate(
                { slug },
                { $inc: { views: 1 } },
                { new: true }
            ).lean()
            if (article) return article
        } catch (err) {
            console.error('Error fetching article by slug from MongoDB:', err.message)
        }
    }
    const found = inMemoryArticles.find(a => a.slug === slug)
    if (found) found.views = (found.views || 0) + 1
    return found || null
}

export const createArticleService = async (data) => {
    if (!data.title || !data.title.trim()) {
        const error = new Error('Article title is required')
        error.cause = { status: 400 }
        throw error
    }

    if (!data.content || !data.content.trim()) {
        const error = new Error('Article content is required')
        error.cause = { status: 400 }
        throw error
    }

    const baseSlug = slugify(data.slug || data.title)
    const publishedAt = data.published !== false ? new Date() : null
    const excerpt = data.excerpt && data.excerpt.trim() 
        ? data.excerpt.trim() 
        : data.content.trim().slice(0, 150) + '...'

    if (getDBStatus()) {
        const slug = await ensureUniqueSlug(Article, baseSlug)
        const cleanData = {
            ...data,
            title: data.title.trim(),
            slug,
            excerpt,
            content: data.content.trim(),
            category: data.category || 'Data Analysis',
            coverImage: data.coverImage || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
            readTime: data.readTime || '5 min read',
            author: data.author || 'Mohamed Mahmoud Hegazy',
            published: data.published !== false,
            publishedAt,
            views: data.views || 0
        }
        delete cleanData._id

        const newArticle = await Article.create(cleanData)
        return newArticle
    }

    const mockArticle = {
        _id: `art_${Date.now()}`,
        ...data,
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
    if (getDBStatus()) {
        const filter = buildFilter(idOrSlug)
        const existing = await Article.findOne(filter)
        if (!existing) {
            const error = new Error('Article not found')
            error.cause = { status: 404 }
            throw error
        }

        const updateData = { ...data }
        delete updateData._id

        if (data.slug && data.slug.trim()) {
            updateData.slug = await ensureUniqueSlug(Article, slugify(data.slug), existing._id)
        } else if (data.title && data.title.trim() && !existing.slug) {
            updateData.slug = await ensureUniqueSlug(Article, slugify(data.title), existing._id)
        }

        if (data.published === true && !existing.publishedAt) {
            updateData.publishedAt = new Date()
        }

        const updated = await Article.findByIdAndUpdate(
            existing._id,
            { $set: updateData },
            { new: true, runValidators: true }
        )
        return updated
    }

    const idx = inMemoryArticles.findIndex(a => a._id === idOrSlug || a.slug === idOrSlug)
    if (idx !== -1) {
        inMemoryArticles[idx] = { ...inMemoryArticles[idx], ...data, updatedAt: new Date() }
        return inMemoryArticles[idx]
    }
    return null
}

export const deleteArticleService = async (idOrSlug) => {
    if (getDBStatus()) {
        const filter = buildFilter(idOrSlug)
        const deleted = await Article.findOneAndDelete(filter)
        return !!deleted
    }
    const idx = inMemoryArticles.findIndex(a => a._id === idOrSlug || a.slug === idOrSlug)
    if (idx !== -1) {
        inMemoryArticles.splice(idx, 1)
        return true
    }
    return false
}
