import { createApp } from '../ApplicationStructure2026/src/app.bootstrap.js'
import { connectDB } from '../ApplicationStructure2026/src/DB/connection.db.js'
import { seedDB } from '../ApplicationStructure2026/src/DB/seed.js'

let app = null
let dbInit = null

export default async function handler(req, res) {
    if (!app) {
        app = createApp()
    }

    if (!dbInit) {
        dbInit = (async () => {
            await connectDB()
            await seedDB()
        })().catch(err => {
            console.error('[Vercel Serverless DB Error]:', err.message)
            dbInit = null
        })
    }
    await dbInit

    return app(req, res)
}
