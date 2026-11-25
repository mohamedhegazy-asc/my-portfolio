import mongoose from 'mongoose'

const projectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    subtitle: { type: String, required: true },
    logoUrl: { type: String, default: "" },
    category: { type: String, required: true }, // e.g. "Web App", "Mobile App", "E-commerce", "Website", "AI"
    type: { type: String, required: true },
    client: { type: String, required: true },
    thumbnail: { type: String, required: true },
    images: [{ type: String }],
    liveUrl: { type: String, default: "#" },
    repoUrl: { type: String, default: "#" },
    order: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    published: { type: Boolean, default: true },
    status: { type: String, enum: ['public', 'private', 'draft'], default: 'public' },
    attachments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Asset' }],
    clicks: { type: Number, default: 0 },
    description: { type: String, default: '' },
    tags: [{ type: String }],
    tech: [{ type: String }]
}, { timestamps: true })

projectSchema.index({ title: 'text', subtitle: 'text', tags: 'text' })

export const Project = mongoose.models.Project || mongoose.model('Project', projectSchema)

