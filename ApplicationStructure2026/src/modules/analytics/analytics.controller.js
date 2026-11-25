import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { getAnalyticsStatsService, recordEventService } from './analytics.service.js'
import { requireAdmin } from '../../middleware/requireAdmin.js'
import { validateBody, analyticsTrackSchema } from '../../utils/validation.js'

const router = Router()

const trackLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many tracking requests.' }
})

// GET /api/analytics (Admin)
router.get('/', requireAdmin, async (req, res, next) => {
    try {
        const stats = await getAnalyticsStatsService()
        return res.status(200).json({ success: true, data: stats })
    } catch (error) {
        next(error)
    }
})

// POST /api/analytics/track (Public — Zod validated & rate limited)
router.post('/track', trackLimiter, validateBody(analyticsTrackSchema), async (req, res, next) => {
    try {
        const { event, page, meta } = req.body
        const ip = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').split(',')[0].trim()
        const userAgent = req.headers['user-agent'] || ''
        const referrer = req.headers['referer'] || ''

        const result = await recordEventService(event, {
            ip,
            page: page || '/',
            userAgent,
            referrer,
            meta: meta || {}
        })
        return res.status(200).json({ success: true, data: result })
    } catch (error) {
        next(error)
    }
})

export default router
