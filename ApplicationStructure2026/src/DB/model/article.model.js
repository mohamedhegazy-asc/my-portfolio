import mongoose from 'mongoose'

const articleSchema = new mongoose.Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    excerpt: { type: String, required: true },
    content: { type: String, required: true },
    category: { type: String, required: true, default: "Data Analysis" },
    coverImage: { type: String, default: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80" },
    readTime: { type: String, default: "5 min read" },
    author: { type: String, default: "Mohamed Mahmoud Hegazy" },
    published: { type: Boolean, default: true },
    publishedAt: { type: Date, default: null }, // set when published=true
    views: { type: Number, default: 0 },
    tags: [{ type: String }]
}, { timestamps: true })

articleSchema.index({ slug: 1 }, { unique: true })
articleSchema.index({ category: 1, createdAt: -1 })
articleSchema.index({ published: 1, publishedAt: -1 })

// Auto-set publishedAt when article is published for the first time
articleSchema.pre('save', function (next) {
    if (this.published && !this.publishedAt) {
        this.publishedAt = new Date()
    }
    next()
})

export const Article = mongoose.models.Article || mongoose.model('Article', articleSchema)

