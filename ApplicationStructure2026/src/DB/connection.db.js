import mongoose from 'mongoose'
import { MONGO_URI, NODE_ENV } from '../../config/config.service.js'

let isConnected = false

export const connectDB = async () => {
    // If already connected or connecting, reuse existing connection
    if (mongoose.connection.readyState === 1) {
        isConnected = true
        return mongoose.connection
    }

    if (!MONGO_URI) {
        if (NODE_ENV === 'production') {
            isConnected = false
            throw new Error('[FATAL]: MONGO_URI is missing in production environment.')
        }
        console.warn('[MongoDB Warning]: MONGO_URI not defined. Running in memory fallback mode (development only).')
        isConnected = false
        return null
    }

    try {
        mongoose.set('strictQuery', false)
        const conn = await mongoose.connect(MONGO_URI, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            connectTimeoutMS: 10000,
        })
        isConnected = true
        console.log(`[MongoDB Connected]: ${conn.connection.host}/${conn.connection.name}`)

        mongoose.connection.on('disconnected', () => {
            isConnected = false
            console.warn('[MongoDB]: Disconnected.')
        })
        mongoose.connection.on('reconnected', () => {
            isConnected = true
            console.log('[MongoDB]: Reconnected.')
        })
        mongoose.connection.on('error', (err) => {
            isConnected = false
            console.error('[MongoDB Error]:', err.message)
        })

        return conn
    } catch (error) {
        isConnected = false
        console.error(`[MongoDB Error]: Could not connect — ${error.message}`)
        if (NODE_ENV === 'production') {
            // Rethrow in production to fail cleanly and return HTTP 503 from the API
            throw error
        }
        console.warn('[Portfolio App]: Operating in memory/seed fallback mode (development only).')
        return null
    }
}

export const getDBStatus = () => isConnected || mongoose.connection.readyState === 1
