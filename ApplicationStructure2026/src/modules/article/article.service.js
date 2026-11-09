import { Article } from '../../DB/model/index.js'
import { getDBStatus } from '../../DB/connection.db.js'
import { defaultArticles } from '../../DB/seed.js'

let inMemoryArticles = [...defaultArticles]

export const getArticlesService = async (category) => {
    if (getDBStatus()) {
        try {
            const query = category && category !== 'All' ? { category } : {}
            const articles = await Article.find(query).sort({ createdAt: -1 }).lean()
            if (articles && articles.length > 0) return articles
        } catch (err) {
            console.error("Error fetching articles from MongoDB:", err.message)
        }
    }
    
    // In-memory fallback
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
            console.error("Error fetching article by slug from MongoDB:", err.message)
        }
    }
    
    const found = inMemoryArticles.find(a => a.slug === slug)
    if (found) found.views = (found.views || 0) + 1
    return found || null
}

export const createArticleService = async (data) => {
    if (!data.title || !data.content) {
        const error = new Error("Title and content are required")
        error.cause = { status: 400 }
        throw error
    }

    const slug = data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')

    if (getDBStatus()) {
        const newArticle = await Article.create({ ...data, slug })
        return newArticle
    }

    const mockArticle = {
        _id: `art_${Date.now()}`,
        ...data,
        slug,
        views: 0,
        createdAt: new Date()
    }
    inMemoryArticles.unshift(mockArticle)
    return mockArticle
}

export const updateArticleService = async (idOrSlug, data) => {
    if (getDBStatus()) {
        const updated = await Article.findOneAndUpdate(
            { $or: [{ _id: idOrSlug }, { slug: idOrSlug }] },
            { $set: data },
            { new: true }
        )
        return updated
    }

    const idx = inMemoryArticles.findIndex(a => a._id === idOrSlug || a.slug === idOrSlug)
    if (idx !== -1) {
        inMemoryArticles[idx] = { ...inMemoryArticles[idx], ...data }
        return inMemoryArticles[idx]
    }
    return null
}

export const deleteArticleService = async (idOrSlug) => {
    if (getDBStatus()) {
        const deleted = await Article.findOneAndDelete({
            $or: [{ _id: idOrSlug }, { slug: idOrSlug }]
        })
        return !!deleted
    }

    const idx = inMemoryArticles.findIndex(a => a._id === idOrSlug || a.slug === idOrSlug)
    if (idx !== -1) {
        inMemoryArticles.splice(idx, 1)
        return true
    }
    return false
}

