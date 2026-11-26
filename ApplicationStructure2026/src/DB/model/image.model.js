import mongoose from 'mongoose'

export const IMAGE_PURPOSES = ['thumbnail', 'inline', 'gallery']

const imageSchema = new mongoose.Schema({
    publicId: { type: String, required: true, unique: true, trim: true },
    secureUrl: { type: String, default: '', trim: true },
    width: { type: Number, required: true, min: 1 },
    height: { type: Number, required: true, min: 1 },
    format: { type: String, required: true, lowercase: true, trim: true },
    bytes: { type: Number, required: true, min: 1, max: 10 * 1024 * 1024 },
    purpose: {
        type: String,
        enum: IMAGE_PURPOSES,
        required: true
    },
    alt: { type: String, default: '', trim: true, maxlength: 300 },
    altAr: { type: String, default: '', trim: true, maxlength: 300 }
}, {
    timestamps: true
})

imageSchema.index({ purpose: 1, createdAt: -1 })

export const Image = mongoose.models.Image || mongoose.model('Image', imageSchema)
export default Image
