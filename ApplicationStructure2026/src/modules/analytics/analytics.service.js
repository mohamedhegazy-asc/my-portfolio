import { AnalyticsEvent, DailySnapshot } from '../../DB/model/index.js'
import { Article } from '../../DB/model/index.js'
import { Project } from '../../DB/model/index.js'
import { Message } from '../../DB/model/index.js'
import { getDBStatus } from '../../DB/connection.db.js'

// ─── In-memory fallback store ───────────────────────────────────────────────
let mem = {
    totalPageViews: 0,
    uniqueVisitors: 0,
    projectClicks: 0,
    cvDownloads: 0,
    seenIps: new Set(),
    dailyViews: {} // { 'YYYY-MM-DD': count }
}

function todayStr() {
    return new Date().toISOString().slice(0, 10)
}

// ─── Record Event ────────────────────────────────────────────────────────────
export const recordEventService = async (event, payload = {}) => {
    const { ip = '', page = '/', userAgent = '', referrer = '', meta = {} } = payload

    if (getDBStatus()) {
        try {
            // Persist event document
            await AnalyticsEvent.create({ event, page, ip, userAgent, referrer, meta })

            // Upsert daily snapshot
            const today = todayStr()
            const inc = { views: event === 'page_view' ? 1 : 0, projectClicks: event === 'project_click' ? 1 : 0, cvDownloads: event === 'cv_download' ? 1 : 0 }

            await DailySnapshot.findOneAndUpdate(
                { date: today },
                { $inc: inc },
                { upsert: true, new: true }
            )

            // Track unique IP per day
            const isNewVisitor = !(await AnalyticsEvent.exists({
                ip,
                createdAt: { $gte: new Date(today) }
            }))
            if (isNewVisitor && ip) {
                await DailySnapshot.findOneAndUpdate(
                    { date: today },
                    { $inc: { uniqueVisitors: 1 } },
                    { upsert: true }
                )
            }

            return { success: true, event, persisted: true }
        } catch (err) {
            console.error('[Analytics] MongoDB write error:', err.message)
            // Fall through to in-memory
        }
    }

    // In-memory fallback
    const today = todayStr()
    if (ip && !mem.seenIps.has(ip)) {
        mem.seenIps.add(ip)
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

// ─── Get Analytics Stats ─────────────────────────────────────────────────────
export const getAnalyticsStatsService = async () => {
    if (getDBStatus()) {
        try {
            // Aggregate totals from event log
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

            // Unique visitors = distinct IPs
            const uniqueVisitors = await AnalyticsEvent.distinct('ip').then(ips => ips.filter(Boolean).length)

            // Daily visits — last 7 days from DailySnapshot
            const sevenDaysAgo = new Date()
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
            const sevenDayStr = sevenDaysAgo.toISOString().slice(0, 10)

            const snapshots = await DailySnapshot.find({ date: { $gte: sevenDayStr } }).sort({ date: 1 }).lean()
            const dailyVisits = buildDailyVisits(snapshots)

            // Collection counts
            const [totalArticles, totalProjects, totalMessages] = await Promise.all([
                Article.countDocuments({ published: true }),
                Project.countDocuments(),
                Message.countDocuments()
            ])

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
                totalArticles,
                totalArticleViews,
                totalProjects,
                totalMessages,
                engagementRate: `${engagementRate}%`,
                dailyVisits
            }
        } catch (err) {
            console.error('[Analytics] MongoDB read error:', err.message)
            // Fall through to in-memory
        }
    }

    // In-memory fallback stats
    const dailyVisits = buildDailyVisitsFromMem(mem.dailyViews)
    return {
        totalPageViews: mem.totalPageViews,
        uniqueVisitors: mem.uniqueVisitors,
        projectClicks: mem.projectClicks,
        cvDownloads: mem.cvDownloads,
        totalArticles: 0,
        totalArticleViews: 0,
        totalProjects: 0,
        totalMessages: 0,
        engagementRate: '0.00%',
        dailyVisits
    }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function buildDailyVisits(snapshots) {
    const map = {}
    for (const s of snapshots) map[s.date] = s.views

    const result = []
    for (let i = 6; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const key = d.toISOString().slice(0, 10)
        const label = i === 0 ? 'Today' : i === 1 ? 'Yesterday' : key.slice(5)
        result.push({ date: label, views: map[key] || 0 })
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
