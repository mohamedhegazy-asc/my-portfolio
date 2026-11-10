import mongoose from 'mongoose'
import { MONGO_URI } from '../../config/config.service.js'

let isConnected = false

export const connectDB = async () => {
    // If already connected or connecting, reuse existing connection
    if (mongoose.connection.readyState === 1) {
        isConnected = true
        return mongoose.connection
    }

    try {
        mongoose.set('strictQuery', false)
        const conn = await mongoose.connect(MONGO_URI, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            connectTimeoutMS: 10000,
        })
        isConnected = true
        console.log(`[MongoDB Atlas Connected]: ${conn.connection.host}/${conn.connection.name}`)

        mongoose.connection.on('disconnected', () => {
            isConnected = false
            console.warn('[MongoDB]: Disconnected from Atlas.')
        })
        mongoose.connection.on('reconnected', () => {
            isConnected = true
            console.log('[MongoDB]: Reconnected to Atlas.')
        })
        mongoose.connection.on('error', (err) => {
            isConnected = false
            console.error('[MongoDB Error]:', err.message)
        })

        return conn
    } catch (error) {
        isConnected = false
        console.warn(`[MongoDB Warning]: Could not connect to Atlas — ${error.message}`)
        console.warn('[Portfolio App]: Operating in memory/seed fallback mode.')
        return null
    }
}

export const getDBStatus = () => isConnected || mongoose.connection.readyState === 1
