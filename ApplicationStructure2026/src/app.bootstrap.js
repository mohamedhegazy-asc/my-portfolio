import { randomUUID } from 'node:crypto'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import mongoose from 'mongoose'
import { NODE_ENV, port, CLIENT_URL } from '../config/config.service.js'
import { connectDB, getDBStatus } from './DB/connection.db.js'
import { seedDB } from './DB/seed.js'
import {
    profileRouter,
    projectRouter,
    contactRouter,
    articleRouter,
    analyticsRouter,
    publicAssetRouter,
    adminAssetRouter,
    adminImageRouter,
} from './modules/index.js'
import adminRouter from './modules/admin/admin.controller.js'

const allowedOrigins = CLIENT_URL
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean)

const isOriginAllowed = (origin) => {
    if (!origin) return true
    if (allowedOrigins.includes(origin)) return true
    if (NODE_ENV === 'development' && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        return true
    }
    return false
}

export function createApp() {
    const app = express()

    // 0. Trust Vercel reverse proxy
    app.set('trust proxy', 1)

    // 1. Request ID middleware for structured logging
    app.use((req, res, next) => {
        const reqId = req.headers['x-request-id'] || randomUUID()
        req.id = reqId
        res.setHeader('X-Request-Id', reqId)
        next()
    })

    // 2. Security headers & gzip compression
    app.use(helmet({ contentSecurityPolicy: false }))
    app.use(compression())

    // 3. CORS allow-list
    app.use(cors({
        origin: (origin, callback) => {
            if (isOriginAllowed(origin)) return callback(null, true)
            const err = new Error(`CORS policy: origin '${origin}' is not allowed.`)
            err.cause = { status: 403 }
            return callback(err)
        },
        credentials: true,
    }))

    // 4. Reject state-changing requests with an unauthorized Origin header
    app.use((req, res, next) => {
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
            const origin = req.headers.origin
            if (origin && !isOriginAllowed(origin)) {
                return res.status(403).json({
                    success: false,
                    message: 'Forbidden: unauthorized request origin.'
                })
            }
        }
        next()
    })

    // 5. Body & cookie parsers
    app.use(express.json({ limit: '2mb' }))
    app.use(express.urlencoded({ extended: true, limit: '2mb' }))
    app.use(cookieParser())

    // 6. Normalize routing
    app.use((req, res, next) => {
        if (!req.url.startsWith('/api') && req.url !== '/') {
            req.url = '/api' + req.url
        }
        next()
    })

    // 7. Health endpoint checking Mongoose readyState
    app.get('/api/health', (req, res) => {
        const readyState = mongoose.connection.readyState
        const stateLabel = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' }[readyState] ?? 'unknown'
        const isUp = readyState === 1 || NODE_ENV === 'development'
        return res.status(readyState === 1 ? 200 : (NODE_ENV === 'production' ? 503 : 200)).json({
            status: readyState === 1 ? 'ok' : (isUp ? 'degraded-dev' : 'unavailable'),
            db: stateLabel,
            readyState,
            env: NODE_ENV,
        })
    })

    // 8. Production DB availability guard
    app.use('/api', (req, res, next) => {
        if (req.path === '/' || req.path === '/health' || req.path.startsWith('/admin/session')) {
            return next()
        }
        if (NODE_ENV === 'production' && !getDBStatus()) {
            return res.status(503).json({
                success: false,
                message: 'Database connection unavailable. Please try again later.'
            })
        }
        next()
    })

    // 9. Base API status
    app.get(['/', '/api'], (req, res) => {
        return res.status(200).json({
            status: 'online',
            service: 'Portfolio REST API & Admin CMS',
            environment: NODE_ENV,
            version: '2026.5',
        })
    })

    // 10. Admin & Public API routes (legacy /auth & /user removed after confirming unused)
    app.use('/api/admin/assets', adminAssetRouter)
    app.use('/api/admin/images', adminImageRouter)
    app.use('/api/admin', adminRouter)
    app.use('/api/profile', profileRouter)
    app.use('/api/projects', projectRouter)
    app.use('/api/articles', articleRouter)
    app.use('/api/assets', publicAssetRouter)
    app.use('/api/contact', contactRouter)
    app.use('/api/analytics', analyticsRouter)

    // 11. 404 Handler
    app.use((req, res) => {
        return res.status(404).json({
            success: false,
            message: `Route not found: ${req.method} ${req.originalUrl}`
        })
    })

    // 12. Centralized Error-handling middleware (with request ID, no stack traces in production)
    app.use((error, req, res, next) => {
        const status = error.cause?.status ?? error.status ?? 500
        const message = NODE_ENV === 'production' && status === 500
            ? 'Something went wrong on the server.'
            : (error.message || 'Something went wrong on the server.')

        console.error(`[API Error ${status}] [reqId=${req.id}]:`, error.message)
        return res.status(status).json({
            success: false,
            message,
            requestId: req.id,
            ...(NODE_ENV === 'development' && { stack: error.stack })
        })
    })

    return app
}

export default async function bootstrap() {
    const app = createApp()
    await connectDB()
    await seedDB()
    app.listen(port, () => {
        console.log(`Server successfully started and listening on http://localhost:${port}`)
    })
    return app
}
