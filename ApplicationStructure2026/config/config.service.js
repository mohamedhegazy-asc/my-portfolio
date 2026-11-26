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

// In production, MONGO_URI must come exclusively from process.env — fail loudly if missing
if (NODE_ENV === 'production' && !process.env.MONGO_URI) {
    throw new Error('[FATAL]: MONGO_URI environment variable is required in production but was not provided.')
}

// Development fallback only; never used in production
export const MONGO_URI = process.env.MONGO_URI ?? (NODE_ENV === 'development' ? 'mongodb://127.0.0.1:27017/portfolio' : '')
export const CLIENT_URL = process.env.CLIENT_URL ?? 'http://localhost:5173'

export const SALT_ROUND = parseInt(process.env.SALT_ROUND ?? '10')
export const JWT_SECRET = process.env.JWT_SECRET ?? (NODE_ENV === 'development' ? 'dev-only-jwt-secret-change-in-production' : null)
export const ADMIN_CREDENTIAL_HASH = process.env.ADMIN_CREDENTIAL_HASH ?? null
export const ADMIN_EXTRA_SECRET_HASH = process.env.ADMIN_EXTRA_SECRET_HASH ?? null
export const ADMIN_PATH = process.env.ADMIN_PATH ?? null
export const ANALYTICS_SALT = process.env.ANALYTICS_SALT ?? 'dev-analytics-salt'
export const MAX_UPLOAD_MB = Math.max(1, parseInt(process.env.MAX_UPLOAD_MB ?? '15', 10) || 15)
export const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024

export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME ?? ''
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY ?? ''
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET ?? ''
