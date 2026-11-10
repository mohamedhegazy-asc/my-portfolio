import express from 'express'
import cors from 'cors'
import { NODE_ENV, port, CLIENT_URL } from '../config/config.service.js'
import { connectDB } from './DB/connection.db.js'
import { seedDB } from './DB/seed.js'
import {
    authRouter,
    userRouter,
    profileRouter,
    projectRouter,
    contactRouter,
    articleRouter,
    analyticsRouter,
} from './modules/index.js'

export function createApp() {
    const app = express()

    // 1. CORS configuration - universal support for localhost, Vercel preview URLs and custom domains
    app.use(cors({
        origin: true,
        credentials: true,
    }))

    // 2. Body parsers
    app.use(express.json())
    app.use(express.urlencoded({ extended: true }))

    // 3. Normalize routing: ensure requests routed with or without /api prefix match correctly
    app.use((req, res, next) => {
        if (!req.url.startsWith('/api') && req.url !== '/' && !req.url.startsWith('/auth') && !req.url.startsWith('/user')) {
            req.url = '/api' + req.url
        }
        next()
    })

    // 4. Base API status endpoint
    app.get(['/', '/api'], (req, res) => {
        return res.status(200).json({
            status: 'online',
            service: 'Portfolio REST API & Admin CMS',
            environment: NODE_ENV,
            version: '2026.3',
            endpoints: {
                profile: '/api/profile',
                projects: '/api/projects',
                articles: '/api/articles',
                contact: '/api/contact',
                analytics: '/api/analytics',
                messages: '/api/contact/messages'
            }
        })
    })

    // 5. Portfolio & CMS API routes
    app.use('/api/profile', profileRouter)
    app.use('/api/projects', projectRouter)
    app.use('/api/articles', articleRouter)
    app.use('/api/contact', contactRouter)
    app.use('/api/analytics', analyticsRouter)

    // Legacy module routes preserved
    app.use('/auth', authRouter)
    app.use('/user', userRouter)

    // 6. 404 Route handling
    app.use((req, res) => {
        return res.status(404).json({
            success: false,
            message: `Route not found: ${req.method} ${req.originalUrl}`
        })
    })

    // 7. Centralized Error-handling middleware
    app.use((error, req, res, next) => {
        const status = error.cause?.status ?? error.status ?? 500
        const message = error.message || 'Something went wrong on the server'
        
        console.error(`[API Error ${status}]:`, error)
        return res.status(status).json({
            success: false,
            message,
            stack: NODE_ENV === 'development' ? error.stack : undefined
        })
    })

    return app
}

export default async function bootstrap() {
    const app = createApp()

    // Connect to Database & run seeds
    await connectDB()
    await seedDB()

    app.listen(port, () => {
        console.log(`Server successfully started and listening on http://localhost:${port}`)
    })

    return app
}
