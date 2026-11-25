import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import {
    NODE_ENV,
    JWT_SECRET,
    ADMIN_CREDENTIAL_HASH,
    ADMIN_EXTRA_SECRET_HASH
} from '../../../config/config.service.js'
import { requireAdmin, verifyAdminToken, ADMIN_COOKIE_NAME } from '../../middleware/requireAdmin.js'
import { getProjectsService } from '../project/project.service.js'
import { getArticlesService } from '../article/article.service.js'

const router = Router()

const GENERIC_AUTH_ERROR = 'Invalid credentials.'

// Normalize phone input: strip non-digits and handle +20, 0020, and 20 prefixes
export const normalizePhone = (val = '') => {
    let digits = String(val).replace(/\D/g, '')
    if (digits.startsWith('0020')) {
        digits = digits.slice(4)
    } else if (digits.startsWith('20') && digits.length >= 12) {
        digits = digits.slice(2)
    }
    if (digits.length === 10 && digits.startsWith('1')) {
        digits = '0' + digits
    }
    return digits
}

// Track recent failed attempts per IP for progressive delay
const failedAttempts = new Map()
const progressiveDelay = async (ip) => {
    const now = Date.now()
    const entry = failedAttempts.get(ip)
    const count = entry && (now - entry.ts < 15 * 60 * 1000) ? entry.count + 1 : 1
    failedAttempts.set(ip, { count, ts: now })
    const waitMs = Math.min(4000, count * 500)
    await new Promise((resolve) => setTimeout(resolve, waitMs))
}

// Brute-force protection: max 5 login attempts per 15 minutes per IP
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many login attempts. Please try again in 15 minutes.'
    }
})

// POST /api/admin/login
router.post('/login', loginLimiter, async (req, res, next) => {
    try {
        const { phone, confirmPhone, extraSecret } = req.body || {}
        const clientIp = req.ip || 'unknown'

        if (typeof phone !== 'string' || typeof confirmPhone !== 'string' || !phone.trim() || !confirmPhone.trim()) {
            console.warn(`[Admin Auth] Failed login attempt (missing fields) from IP ${clientIp}`)
            await progressiveDelay(clientIp)
            return res.status(401).json({ success: false, message: GENERIC_AUTH_ERROR })
        }

        const normalizedPhone = normalizePhone(phone)
        const normalizedConfirm = normalizePhone(confirmPhone)

        if (!normalizedPhone || normalizedPhone !== normalizedConfirm) {
            console.warn(`[Admin Auth] Failed login attempt (confirmation mismatch) from IP ${clientIp}`)
            await progressiveDelay(clientIp)
            return res.status(401).json({ success: false, message: GENERIC_AUTH_ERROR })
        }

        if (!ADMIN_CREDENTIAL_HASH || !JWT_SECRET) {
            console.error('[Admin Auth] ADMIN_CREDENTIAL_HASH or JWT_SECRET is not configured.')
            return res.status(503).json({ success: false, message: 'Admin authentication is not configured.' })
        }

        const phoneValid = await bcrypt.compare(normalizedPhone, ADMIN_CREDENTIAL_HASH)
        if (!phoneValid) {
            console.warn(`[Admin Auth] Failed login attempt from IP ${clientIp}`)
            await progressiveDelay(clientIp)
            return res.status(401).json({ success: false, message: GENERIC_AUTH_ERROR })
        }

        if (ADMIN_EXTRA_SECRET_HASH) {
            if (typeof extraSecret !== 'string' || !extraSecret) {
                console.warn(`[Admin Auth] Failed login attempt (missing extra secret) from IP ${clientIp}`)
                await progressiveDelay(clientIp)
                return res.status(401).json({ success: false, message: GENERIC_AUTH_ERROR })
            }
            const extraValid = await bcrypt.compare(extraSecret, ADMIN_EXTRA_SECRET_HASH)
            if (!extraValid) {
                console.warn(`[Admin Auth] Failed login attempt (invalid extra secret) from IP ${clientIp}`)
                await progressiveDelay(clientIp)
                return res.status(401).json({ success: false, message: GENERIC_AUTH_ERROR })
            }
        }

        failedAttempts.delete(clientIp)

        const token = jwt.sign(
            { role: 'admin' },
            JWT_SECRET,
            { algorithm: 'HS256', expiresIn: '12h' }
        )

        res.cookie(ADMIN_COOKIE_NAME, token, {
            httpOnly: true,
            secure: NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 12 * 60 * 60 * 1000
        })

        return res.status(200).json({
            success: true,
            message: 'Authenticated.'
        })
    } catch (error) {
        next(error)
    }
})

// POST /api/admin/logout
router.post('/logout', (req, res) => {
    res.clearCookie(ADMIN_COOKIE_NAME, {
        httpOnly: true,
        secure: NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/'
    })
    return res.status(200).json({
        success: true,
        message: 'Logged out.'
    })
})

// GET /api/admin/session — never returns 401 noise for public visitors
router.get('/session', (req, res) => {
    const decoded = verifyAdminToken(req)
    return res.status(200).json({
        authenticated: Boolean(decoded),
        requiresExtraSecret: Boolean(ADMIN_EXTRA_SECRET_HASH)
    })
})

// GET /api/admin/projects — admin list including private/draft
router.get('/projects', requireAdmin, async (req, res, next) => {
    try {
        const result = await getProjectsService(req.query, { all: true })
        return res.status(200).json({ success: true, count: result.data.length, ...result })
    } catch (error) {
        next(error)
    }
})

// GET /api/admin/articles — admin list including private/draft
router.get('/articles', requireAdmin, async (req, res, next) => {
    try {
        const result = await getArticlesService(req.query, { all: true })
        return res.status(200).json({ success: true, count: result.data.length, ...result })
    } catch (error) {
        next(error)
    }
})

export default router
