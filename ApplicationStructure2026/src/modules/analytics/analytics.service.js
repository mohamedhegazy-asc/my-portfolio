import { createHash } from 'node:crypto'
import { AnalyticsEvent, DailySnapshot } from '../../DB/model/index.js'
import { Article, Project, Message, Asset } from '../../DB/model/index.js'
import { getDBStatus } from '../../DB/connection.db.js'
import { ANALYTICS_SALT } from '../../../config/config.service.js'

const BOT_UA_REGEX = /bot|crawler|spider|slurp|curl|wget|python-requests|headless|lighthouse|bingpreview|facebookexternalhit/i

let mem = {
    totalPageViews: 0,
    uniqueVisitors: 0,
    projectClicks: 0,
    cvDownloads: 0,
    seenHashes: new Set(),
    recentPageViews: new Map(),
    dailyViews: {}
}

function todayStr() {
    return new Date().toISOString().slice(0, 10)
}

function hashVisitorIp(ip = '', dateStr = todayStr()) {
    if (!ip) return ''
    return createHash('sha256')
        .update(`${ip}:${dateStr}:${ANALYTICS_SALT}`)
        .digest('hex')
}

export const recordEventService = async (event, payload = {}) => {
    const { ip = '', page = '/', userAgent = '', referrer = '', meta = {} } = payload

    // Skip automated bots
    if (BOT_UA_REGEX.test(userAgent)) {
        return { success: true, event, skipped: 'bot' }
    }

    const today = todayStr()
    const visitorHash = hashVisitorIp(ip, today)

    if (getDBStatus()) {
        try {
            // Deduplicate page_view per visitor per 30 minutes
            if (event === 'page_view' && visitorHash) {
                const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000)
                const recent = await AnalyticsEvent.exists({
                    event: 'page_view',
                    visitorHash,
                    createdAt: { $gte: thirtyMinsAgo }
                })
                if (recent) {
                    return { success: true, event, deduplicated: true }
                }
            }

            await AnalyticsEvent.create({
                event,
                page: String(page || '/').slice(0, 200),
                visitorHash,
                userAgent: String(userAgent || '').slice(0, 250),
                referrer: String(referrer || '').slice(0, 300),
                meta
            })

            const inc = {
                views: event === 'page_view' ? 1 : 0,
                projectClicks: event === 'project_click' ? 1 : 0,
                cvDownloads: event === 'cv_download' ? 1 : 0,
                assetViews: event === 'asset_view' ? 1 : 0,
                assetDownloads: event === 'asset_download' ? 1 : 0,
            }

            if (visitorHash) {
                const seenToday = await AnalyticsEvent.exists({
                    visitorHash,
                    createdAt: { $gte: new Date(today) }
                })
                if (!seenToday) inc.uniqueVisitors = 1
            }

            await DailySnapshot.findOneAndUpdate(
                { date: today },
                { $inc: inc },
                { upsert: true, new: true }
            )

            return { success: true, event, persisted: true }
        } catch (err) {
            console.error('[Analytics] MongoDB write error:', err.message)
        }
    }

    // In-memory fallback (development only)
    if (event === 'page_view' && visitorHash) {
        const lastTs = mem.recentPageViews.get(visitorHash) || 0
        if (Date.now() - lastTs < 30 * 60 * 1000) {
            return { success: true, event, deduplicated: true }
        }
        mem.recentPageViews.set(visitorHash, Date.now())
    }

    if (visitorHash && !mem.seenHashes.has(visitorHash)) {
        mem.seenHashes.add(visitorHash)
        mem.uniqueVisitors += 1
    }
    if (event === 'page_view') {
        mem.totalPageViews += 1
        mem.dailyViews[today] = (mem.dailyViews[today] || 0) + 1
    }
    if (event === 'project_click') mem.projectClicks += 1
    if (event === 'cv_download') mem.cvDownloads += 1

    return { success: true, event, persisted: false }
}

export const getAnalyticsStatsService = async () => {
    if (getDBStatus()) {
        try {
            const [aggregated] = await AnalyticsEvent.aggregate([
                {
                    $group: {
                        _id: null,
                        totalPageViews: { $sum: { $cond: [{ $eq: ['$event', 'page_view'] }, 1, 0] } },
                        projectClicks: { $sum: { $cond: [{ $eq: ['$event', 'project_click'] }, 1, 0] } },
                        cvDownloads: { $sum: { $cond: [{ $eq: ['$event', 'cv_download'] }, 1, 0] } }
                    }
                }
            ])

            const uniqueVisitors = await AnalyticsEvent.distinct('visitorHash').then(h => h.filter(Boolean).length)

            const thirtyDaysAgo = new Date()
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29)
            const thirtyDayStr = thirtyDaysAgo.toISOString().slice(0, 10)

            const snapshots30 = await DailySnapshot.find({ date: { $gte: thirtyDayStr } }).sort({ date: 1 }).lean()
            const dailyVisits = buildDailyVisits(snapshots30, 7)
            const daily30Visits = buildDailyVisits(snapshots30, 30)

            const todayKey = todayStr()
            const sevenDayCutoff = new Date()
            sevenDayCutoff.setDate(sevenDayCutoff.getDate() - 6)
            const sevenDayKey = sevenDayCutoff.toISOString().slice(0, 10)

            const visitsToday = snapshots30.find(s => s.date === todayKey)?.views || 0
            const visits7d = snapshots30.filter(s => s.date >= sevenDayKey).reduce((sum, s) => sum + (s.views || 0), 0)
            const visits30d = snapshots30.reduce((sum, s) => sum + (s.views || 0), 0)

            const [
                totalArticles,
                totalProjects,
                totalMessages,
                unreadMessages,
                fileDownloadsAgg,
                topProjects,
                topArticles,
                topFiles
            ] = await Promise.all([
                Article.countDocuments({ published: true }),
                Project.countDocuments(),
                Message.countDocuments(),
                Message.countDocuments({ isRead: false }),
                Asset.aggregate([{ $group: { _id: null, total: { $sum: '$downloads' } } }]),
                Project.find().sort({ clicks: -1 }).limit(5).select('title slug clicks category status').lean(),
                Article.find().sort({ views: -1 }).limit(5).select('title slug views category status').lean(),
                Asset.find().sort({ views: -1, downloads: -1 }).limit(5).select('title kind views downloads status').lean()
            ])

            const fileDownloads = fileDownloadsAgg[0]?.total || 0
            const totalArticleViews = await Article.aggregate([
                { $group: { _id: null, total: { $sum: '$views' } } }
            ]).then(r => r[0]?.total || 0)

            const totals = aggregated || { totalPageViews: 0, projectClicks: 0, cvDownloads: 0 }
            const totalInteractions = totals.cvDownloads + totalMessages + totals.projectClicks
            const engagementRate = totals.totalPageViews > 0
                ? ((totalInteractions / totals.totalPageViews) * 100).toFixed(2)
                : '0.00'

            return {
                totalPageViews: totals.totalPageViews,
                uniqueVisitors,
                projectClicks: totals.projectClicks,
                cvDownloads: totals.cvDownloads,
                fileDownloads,
                visitsToday,
                visits7d,
                visits30d,
                totalArticles,
                totalArticleViews,
                totalProjects,
                totalMessages,
                unreadMessages,
                engagementRate: `${engagementRate}%`,
                dailyVisits,
                daily30Visits,
                topProjects,
                topArticles,
                topFiles
            }
        } catch (err) {
            console.error('[Analytics] MongoDB read error:', err.message)
        }
    }

    const dailyVisits = buildDailyVisitsFromMem(mem.dailyViews)
    return {
        totalPageViews: mem.totalPageViews,
        uniqueVisitors: mem.uniqueVisitors,
        projectClicks: mem.projectClicks,
        cvDownloads: mem.cvDownloads,
        fileDownloads: 0,
        visitsToday: mem.dailyViews[todayStr()] || 0,
        visits7d: mem.totalPageViews,
        visits30d: mem.totalPageViews,
        totalArticles: 0,
        totalArticleViews: 0,
        totalProjects: 0,
        totalMessages: 0,
        unreadMessages: 0,
        engagementRate: '0.00%',
        dailyVisits,
        daily30Visits: dailyVisits,
        topProjects: [],
        topArticles: [],
        topFiles: []
    }
}

function buildDailyVisits(snapshots, days = 7) {
    const map = {}
    for (const s of snapshots) map[s.date] = s.views

    const result = []
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const key = d.toISOString().slice(0, 10)
        const label = i === 0 ? 'Today' : i === 1 ? 'Yesterday' : key.slice(5)
        result.push({ date: label, fullDate: key, views: map[key] || 0 })
    }
    return result
}

function buildDailyVisitsFromMem(dailyViews) {
    const result = []
    for (let i = 6; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const key = d.toISOString().slice(0, 10)
        const label = i === 0 ? 'Today' : i === 1 ? 'Yesterday' : key.slice(5)
        result.push({ date: label, views: dailyViews[key] || 0 })
    }
    return result
}
