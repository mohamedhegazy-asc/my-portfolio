import { createApp } from '../ApplicationStructure2026/src/app.bootstrap.js'
import { connectDB, getDBStatus } from '../ApplicationStructure2026/src/DB/connection.db.js'
import { NODE_ENV } from '../ApplicationStructure2026/config/config.service.js'

let app = null
let dbInit = null

export default async function handler(req, res) {
    if (!app) {
        app = createApp()
    }

    if (!dbInit) {
        dbInit = connectDB().catch(err => {
            console.error('[Vercel Serverless DB Error]:', err.message)
            dbInit = null // Reset so subsequent requests can retry connecting
            throw err
        })
    }

    try {
        await dbInit
    } catch (err) {
        if (NODE_ENV === 'production') {
            return res.status(503).json({
                success: false,
                message: 'Database connection unavailable. Please try again later.'
            })
        }
    }

    // In production, double check DB status before passing to route handlers
    if (NODE_ENV === 'production' && !getDBStatus()) {
        return res.status(503).json({
            success: false,
            message: 'Database connection unavailable. Please try again later.'
        })
    }

    return app(req, res)
}
