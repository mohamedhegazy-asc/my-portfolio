import { Router } from 'express'
import { getAnalyticsStatsService, recordEventService } from './analytics.service.js'

const router = Router()

// GET /api/analytics
router.get('/', async (req, res, next) => {
    try {
        const stats = await getAnalyticsStatsService()
        return res.status(200).json({ success: true, data: stats })
    } catch (error) {
        next(error)
    }
})

// POST /api/analytics/track
router.post('/track', async (req, res, next) => {
    try {
        const { event, page, meta } = req.body
        const ip = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').split(',')[0].trim()
        const userAgent = req.headers['user-agent'] || ''
        const referrer = req.headers['referer'] || ''

        const result = await recordEventService(event, { ip, page, userAgent, referrer, meta: meta || {} })
        return res.status(200).json({ success: true, data: result })
    } catch (error) {
        next(error)
    }
})

export default router
