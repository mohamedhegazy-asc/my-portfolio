import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { existsSync } from 'node:fs'
import { config } from 'dotenv'

const __dirname = dirname(fileURLToPath(import.meta.url))

export const NODE_ENV = process.env.NODE_ENV || 'development'

// Attempt to load .env from config folder if file exists
const envFile = NODE_ENV === 'production' ? '.env.production' : '.env.development'
const targetPath = resolve(__dirname, envFile)

if (existsSync(targetPath)) {
    config({ path: targetPath })
} else {
    // Try root .env if exists
    config()
}

export const port = process.env.PORT ?? 3000

// Default to the Atlas connection string if not explicitly defined in process.env
export const MONGO_URI = process.env.MONGO_URI ?? 'mongodb+srv://quiz:hegazy2003@cluster0.hv6iycd.mongodb.net/portfolio'
export const CLIENT_URL = process.env.CLIENT_URL ?? 'http://localhost:5173'

export const SALT_ROUND = parseInt(process.env.SALT_ROUND ?? '10')
