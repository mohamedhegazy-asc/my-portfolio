import { z } from 'zod'
import { MAX_UPLOAD_BYTES } from '../../config/config.service.js'

const objectIdStr = z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid ObjectId')

// Strip keys starting with '$' or containing '.' recursively
export function stripMongoOperators(obj) {
    if (Array.isArray(obj)) {
        return obj.map(stripMongoOperators)
    }
    if (obj && typeof obj === 'object') {
        const clean = {}
        for (const [key, val] of Object.entries(obj)) {
            if (key.startsWith('$') || key.includes('.')) continue
            clean[key] = stripMongoOperators(val)
        }
        return clean
    }
    return obj
}

// Sanitize list query params safely
export function sanitizeListQuery(query = {}) {
    const clean = stripMongoOperators(query)
    const page = Math.max(1, parseInt(clean.page, 10) || 1)
    const limit = Math.min(50, Math.max(1, parseInt(clean.limit, 10) || 20))
    const category = typeof clean.category === 'string' ? clean.category.trim().slice(0, 60) : ''
    const q = typeof clean.q === 'string' ? clean.q.trim().slice(0, 100) : ''
    const sort = typeof clean.sort === 'string' ? clean.sort.trim().slice(0, 40) : 'newest'
    return { page, limit, category, q, sort }
}

// Express middleware for strict Zod validation
export const validateBody = (schema) => (req, res, next) => {
    const sanitized = stripMongoOperators(req.body || {})
    const parsed = schema.safeParse(sanitized)
    if (!parsed.success) {
        const firstIssue = parsed.error.issues[0]
        const msg = firstIssue
            ? `${firstIssue.path.join('.') || 'body'}: ${firstIssue.message}`
            : 'Invalid request payload.'
        return res.status(400).json({ success: false, message: msg })
    }
    req.body = parsed.data
    next()
}

// ─── Project Schemas (strict — rejects unknown fields & blocks clicks) ──────
const thumbnailImageSchema = z.object({
    publicId: z.string().trim().min(1).max(300),
    width: z.number().int().min(1).max(20000).optional(),
    height: z.number().int().min(1).max(20000).optional(),
    alt: z.string().trim().max(300).optional(),
    altAr: z.string().trim().max(300).optional(),
}).strict()

const galleryItemSchema = z.object({
    publicId: z.string().trim().min(1).max(300),
    width: z.number().int().min(1).max(20000).optional(),
    height: z.number().int().min(1).max(20000).optional(),
    alt: z.string().trim().max(300).optional(),
    altAr: z.string().trim().max(300).optional(),
    caption: z.string().trim().max(500).optional(),
    captionAr: z.string().trim().max(500).optional(),
}).strict()

export const projectCreateSchema = z.object({
    title: z.string().trim().min(1).max(200),
    slug: z.string().trim().max(220).optional(),
    subtitle: z.string().trim().max(500).optional(),
    logoUrl: z.string().trim().max(500).optional(),
    category: z.string().trim().max(80).optional(),
    type: z.string().trim().max(80).optional(),
    client: z.string().trim().max(120).optional(),
    thumbnail: z.string().trim().max(1000).optional(),
    thumbnailImage: thumbnailImageSchema.optional(),
    images: z.array(z.string().trim().max(1000)).max(20).optional(),
    gallery: z.array(galleryItemSchema).max(20).optional(),
    liveUrl: z.string().trim().max(1000).optional(),
    repoUrl: z.string().trim().max(1000).optional(),
    order: z.number().int().min(0).max(10000).optional(),
    featured: z.boolean().optional(),
    published: z.boolean().optional(),
    status: z.enum(['public', 'private', 'draft']).optional(),
    publishedAt: z.union([z.string().max(60), z.date(), z.null()]).optional(),
    description: z.string().max(20000).optional(),
    tags: z.array(z.string().trim().max(50)).max(20).optional(),
    tech: z.array(z.string().trim().max(50)).max(30).optional(),
    attachments: z.array(objectIdStr).max(20).optional(),
}).strict()

export const projectUpdateSchema = projectCreateSchema.partial().strict()

// ─── Article Schemas (strict — rejects unknown fields & blocks views) ───────
export const articleCreateSchema = z.object({
    title: z.string().trim().min(1).max(200),
    slug: z.string().trim().max(220).optional(),
    excerpt: z.string().trim().max(1000).optional(),
    content: z.string().trim().min(1).max(200000),
    category: z.string().trim().max(80).optional(),
    coverImage: z.string().trim().max(1000).optional(),
    thumbnailImage: thumbnailImageSchema.optional(),
    readTime: z.string().trim().max(50).optional(),
    author: z.string().trim().max(120).optional(),
    published: z.boolean().optional(),
    status: z.enum(['public', 'private', 'draft']).optional(),
    publishedAt: z.union([z.string().max(60), z.date(), z.null()]).optional(),
    tags: z.array(z.string().trim().max(50)).max(20).optional(),
    attachments: z.array(objectIdStr).max(20).optional(),
    createdAt: z.string().max(60).optional(),
}).strict()

export const articleUpdateSchema = articleCreateSchema.partial().strict()

// ─── Profile Schema ──────────────────────────────────────────────────────────
export const profileUpdateSchema = z.object({
    name: z.string().trim().min(1).max(120).optional(),
    shortName: z.string().trim().max(60).optional(),
    initials: z.string().trim().max(10).optional(),
    title: z.string().trim().min(1).max(160).optional(),
    country: z.string().trim().max(120).optional(),
    birthDate: z.string().trim().max(40).optional(),
    bio: z.string().trim().min(10).max(5000).optional(),
    avatarUrl: z.string().trim().max(1000).optional(),
    heroImageUrl: z.string().trim().max(1000).optional(),
    cvUrl: z.string().trim().max(1000).optional(),
    socials: z.object({
        github: z.string().trim().max(500).optional(),
        linkedin: z.string().trim().max(500).optional(),
        email: z.string().trim().max(200).optional(),
        phone: z.string().trim().max(40).optional(),
        location: z.string().trim().max(120).optional(),
    }).strict().optional(),
    tools: z.array(z.object({
        name: z.string().trim().min(1).max(60),
        icon: z.string().trim().max(60).optional(),
    }).strict()).max(30).optional(),
}).strict()

// ─── Contact Schemas ─────────────────────────────────────────────────────────
export const contactCreateSchema = z.object({
    name: z.string().trim().min(2).max(80),
    email: z.string().trim().email().max(200),
    subject: z.string().trim().max(120).optional().default(''),
    message: z.string().trim().min(10).max(2000),
}).strict()

export const messageToggleReadSchema = z.object({
    isRead: z.boolean().optional(),
}).strict()

export const messageToggleStarSchema = z.object({
    isStarred: z.boolean().optional(),
}).strict()

// ─── Analytics Track Schema ──────────────────────────────────────────────────
export const analyticsTrackSchema = z.object({
    event: z.enum([
        'page_view',
        'project_click',
        'cv_download',
        'article_view',
        'asset_view',
        'asset_download',
        'contact_submit'
    ]),
    page: z.string().trim().max(200).optional(),
    meta: z.record(z.string().max(40), z.union([z.string().max(200), z.number(), z.boolean()])).optional(),
}).strict()

// ─── Asset Schemas ───────────────────────────────────────────────────────────
export const assetCreateSchema = z.object({
    title: z.string().trim().min(1).max(200),
    description: z.string().trim().max(1000).optional(),
    originalName: z.string().trim().min(1).max(260),
    mimeType: z.string().trim().min(1).max(150),
    size: z.number().int().min(1).max(MAX_UPLOAD_BYTES),
    url: z.string().trim().url().max(1500),
    pathname: z.string().trim().max(500).optional(),
    status: z.enum(['public', 'private', 'draft']).optional(),
    sheetCount: z.number().int().min(1).max(200).optional(),
    checksum: z.string().trim().max(128).optional(),
}).strict()

export const assetUpdateSchema = z.object({
    title: z.string().trim().min(1).max(200).optional(),
    description: z.string().trim().max(1000).optional(),
    status: z.enum(['public', 'private', 'draft']).optional(),
}).strict()

// ─── Cloudinary Image Schemas ────────────────────────────────────────────────
export const imageSignSchema = z.object({
    purpose: z.enum(['thumbnail', 'inline', 'gallery']),
}).strict()

export const imageRegisterSchema = z.object({
    publicId: z.string().trim().min(3).max(300),
    purpose: z.enum(['thumbnail', 'inline', 'gallery']),
    alt: z.string().trim().max(300).optional(),
    altAr: z.string().trim().max(300).optional(),
}).strict()

export const imageUpdateSchema = z.object({
    purpose: z.enum(['thumbnail', 'inline', 'gallery']).optional(),
    alt: z.string().trim().max(300).optional(),
    altAr: z.string().trim().max(300).optional(),
}).strict()
