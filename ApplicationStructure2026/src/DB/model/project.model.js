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
    featured: { type: Boolean, default: false }
}, { timestamps: true })

export const Project = mongoose.models.Project || mongoose.model('Project', projectSchema)

