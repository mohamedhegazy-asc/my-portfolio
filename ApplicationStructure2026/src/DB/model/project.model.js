import mongoose from 'mongoose'

const thumbnailImageSchema = new mongoose.Schema({
    publicId: { type: String, trim: true, default: '' },
    width: { type: Number, min: 1 },
    height: { type: Number, min: 1 },
    alt: { type: String, trim: true, default: '', maxlength: 300 },
    altAr: { type: String, trim: true, default: '', maxlength: 300 }
}, { _id: false })

const galleryImageSchema = new mongoose.Schema({
    publicId: { type: String, required: true, trim: true },
    width: { type: Number, min: 1 },
    height: { type: Number, min: 1 },
    alt: { type: String, trim: true, default: '', maxlength: 300 },
    altAr: { type: String, trim: true, default: '', maxlength: 300 },
    caption: { type: String, trim: true, default: '', maxlength: 500 },
    captionAr: { type: String, trim: true, default: '', maxlength: 500 }
}, { _id: false })

const projectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    subtitle: { type: String, required: true },
    logoUrl: { type: String, default: "" },
    category: { type: String, required: true }, // e.g. "Web App", "Mobile App", "E-commerce", "Website", "AI"
    type: { type: String, required: true },
    client: { type: String, required: true },
    thumbnail: { type: String, required: true },
    thumbnailImage: { type: thumbnailImageSchema, default: undefined },
    images: [{ type: String }],
    gallery: {
        type: [galleryImageSchema],
        default: undefined,
        validate: {
            validator: (arr) => !arr || arr.length <= 20,
            message: 'Project gallery cannot exceed 20 images.'
        }
    },
    liveUrl: { type: String, default: "#" },
    repoUrl: { type: String, default: "#" },
    order: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    published: { type: Boolean, default: true },
    status: { type: String, enum: ['public', 'private', 'draft'], default: 'public' },
    attachments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Asset' }],
    clicks: { type: Number, default: 0 },
    description: { type: String, default: '', maxlength: 20000 },
    tags: [{ type: String }],
    tech: [{ type: String }]
}, { timestamps: true })

projectSchema.index({ title: 'text', subtitle: 'text', tags: 'text' })

export const Project = mongoose.models.Project || mongoose.model('Project', projectSchema)
