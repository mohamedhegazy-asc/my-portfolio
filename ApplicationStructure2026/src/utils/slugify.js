export function slugify(text) {
    if (!text || typeof text !== 'string') {
        return `item-${Date.now()}`
    }

    const trimmed = text.trim()
    // Supports full Unicode: Arabic letters (\u0600-\u06FF), Latin letters, and numbers
    let slug = trimmed
        .toLowerCase()
        .replace(/[^\p{L}\p{N}]+/gu, '-')
        .replace(/^-+|-+$/g, '')

    if (!slug) {
        slug = `item-${Date.now()}`
    }

    return slug
}

export async function ensureUniqueSlug(Model, baseSlug, currentId = null) {
    let slug = baseSlug
    let counter = 1
    while (true) {
        const query = { slug }
        if (currentId) {
            query._id = { $ne: currentId }
        }
        const existing = await Model.findOne(query).select('_id').lean()
        if (!existing) break
        slug = `${baseSlug}-${counter}`
        counter++
    }
    return slug
}
