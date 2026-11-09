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

async function bootstrap() {
    const app = express()

    // 1. Connect to Database & run seeds
    await connectDB()
    await seedDB()

    // 2. CORS configuration
    app.use(cors({
        origin: [CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
        credentials: true,
    }))

    // 3. Body parsers
    app.use(express.json())
    app.use(express.urlencoded({ extended: true }))

    // 4. API Endpoints
    app.get('/', (req, res) => {
        return res.status(200).json({
            status: 'online',
            service: 'Portfolio REST API & Admin CMS',
            version: '2026.2',
            endpoints: {
                profile: '/api/profile',
                projects: '/api/projects',
                articles: '/api/articles',
                contact: '/api/contact',
                messages: '/api/contact/messages'
            }
        })
    })

    // Portfolio & CMS API routes
    app.use('/api/profile', profileRouter)
    app.use('/api/projects', projectRouter)
    app.use('/api/articles', articleRouter)
    app.use('/api/contact', contactRouter)
    app.use('/api/analytics', analyticsRouter)

    // Legacy module routes preserved
    app.use('/auth', authRouter)
    app.use('/user', userRouter)

    // 5. 404 Route handling (compatible with Express 5)
    app.use((req, res) => {
        return res.status(404).json({
            success: false,
            message: `Route not found: ${req.method} ${req.originalUrl}`
        })
    })

    // 6. Centralized Error-handling middleware
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

    app.listen(port, () => {
        console.log(`Server successfully started and listening on http://localhost:${port}`)
    })
}

export default bootstrap
