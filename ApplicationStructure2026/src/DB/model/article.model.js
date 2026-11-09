import mongoose from 'mongoose'

const articleSchema = new mongoose.Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    excerpt: { type: String, required: true },
    content: { type: String, required: true },
    category: { type: String, required: true, default: "Data Analysis" }, // "Data Analysis", "AI & Vibe Coding", "Web Development", "Business Intelligence"
    coverImage: { type: String, default: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80" },
    readTime: { type: String, default: "5 min read" },
    author: { type: String, default: "Mohamed Mahmoud Hegazy" },
    published: { type: Boolean, default: true },
    views: { type: Number, default: 0 },
    tags: [{ type: String }]
}, { timestamps: true })

export const Article = mongoose.models.Article || mongoose.model('Article', articleSchema)

