import mongoose from 'mongoose'

// Individual event log — one document per tracked event
const analyticsEventSchema = new mongoose.Schema({
    event: {
        type: String,
        required: true,
        enum: ['page_view', 'project_click', 'cv_download', 'article_view', 'contact_submit']
    },
    page: { type: String, default: '/' },
    ip: { type: String, default: '' },
    userAgent: { type: String, default: '' },
    referrer: { type: String, default: '' },
    // Extra context (e.g. projectId, articleSlug)
    meta: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true })

// Index for fast aggregation queries
analyticsEventSchema.index({ event: 1, createdAt: -1 })
analyticsEventSchema.index({ ip: 1, createdAt: -1 })

export const AnalyticsEvent = mongoose.models.AnalyticsEvent || mongoose.model('AnalyticsEvent', analyticsEventSchema)

// Daily aggregate snapshot — updated once per day via cron / on-read
const dailySnapshotSchema = new mongoose.Schema({
    date: { type: String, required: true, unique: true }, // "YYYY-MM-DD"
    views: { type: Number, default: 0 },
    uniqueVisitors: { type: Number, default: 0 },
    projectClicks: { type: Number, default: 0 },
    cvDownloads: { type: Number, default: 0 }
}, { timestamps: false })

export const DailySnapshot = mongoose.models.DailySnapshot || mongoose.model('DailySnapshot', dailySnapshotSchema)

