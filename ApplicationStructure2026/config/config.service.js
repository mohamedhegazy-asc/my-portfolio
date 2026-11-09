import { resolve } from 'node:path'
import { config } from 'dotenv'

export const NODE_ENV = process.env.NODE_ENV || 'development'

const envPath = {
    development: '.env.development',
    production: '.env.production',
}

config({ path: resolve(`./config/${envPath[NODE_ENV] || '.env.development'}`) })

export const port = process.env.PORT ?? 3000
export const MONGO_URI = process.env.MONGO_URI ?? 'mongodb://127.0.0.1:27017/portfolio'
export const CLIENT_URL = process.env.CLIENT_URL ?? 'http://localhost:5173'

export const SALT_ROUND = parseInt(process.env.SALT_ROUND ?? '10')
