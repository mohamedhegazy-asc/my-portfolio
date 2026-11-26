import mongoose from 'mongoose'

const assetSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, default: '', trim: true, maxlength: 1000 },
    kind: {
        type: String,
        enum: ['xlsx', 'xls', 'csv', 'docx', 'doc', 'pptx', 'ppt', 'pdf', 'image', 'other'],
        required: true,
        default: 'other'
    },
    previewMode: {
        type: String,
        enum: ['excel', 'word', 'slides', 'pdf', 'image', 'download-only'],
        default: 'download-only'
    },
    isLegacy: { type: Boolean, default: false },
    verifiedSignature: { type: Boolean, default: false },
    entryCount: { type: Number, default: undefined },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true, min: 1 },
    url: { type: String, required: true },
    pathname: { type: String, default: '' },
    status: {
        type: String,
        enum: ['public', 'private', 'draft'],
        default: 'draft'
    },
    sheetCount: { type: Number, default: undefined },
    downloads: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    checksum: { type: String, default: '' }
}, {
    timestamps: true
})

assetSchema.index({ status: 1, createdAt: -1 })
assetSchema.index({ checksum: 1 })

export const Asset = mongoose.models.Asset || mongoose.model('Asset', assetSchema)
export default Asset
