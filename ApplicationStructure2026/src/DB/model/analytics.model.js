import mongoose from 'mongoose'

// Individual event log — one document per tracked event (no raw IP stored)
const analyticsEventSchema = new mongoose.Schema({
    event: {
        type: String,
        required: true,
        enum: [
            'page_view',
            'project_click',
            'cv_download',
            'article_view',
            'asset_view',
            'asset_download',
            'contact_submit'
        ]
    },
    page: { type: String, default: '/' },
    visitorHash: { type: String, default: '' },
    userAgent: { type: String, default: '' },
    referrer: { type: String, default: '' },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true })

analyticsEventSchema.index({ event: 1, createdAt: -1 })
analyticsEventSchema.index({ visitorHash: 1, event: 1, createdAt: -1 })
// Automatically expire raw events after 180 days
analyticsEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 180 * 24 * 60 * 60 })

export const AnalyticsEvent = mongoose.models.AnalyticsEvent || mongoose.model('AnalyticsEvent', analyticsEventSchema)

// Daily aggregate snapshot
const dailySnapshotSchema = new mongoose.Schema({
    date: { type: String, required: true, unique: true }, // "YYYY-MM-DD"
    views: { type: Number, default: 0 },
    uniqueVisitors: { type: Number, default: 0 },
    projectClicks: { type: Number, default: 0 },
    cvDownloads: { type: Number, default: 0 },
    assetViews: { type: Number, default: 0 },
    assetDownloads: { type: Number, default: 0 }
}, { timestamps: false })

export const DailySnapshot = mongoose.models.DailySnapshot || mongoose.model('DailySnapshot', dailySnapshotSchema)
