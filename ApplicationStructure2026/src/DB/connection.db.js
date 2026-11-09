import mongoose from 'mongoose'
import { MONGO_URI } from '../../config/config.service.js'

let isConnected = false

export const connectDB = async () => {
    try {
        mongoose.set('strictQuery', false)
        const conn = await mongoose.connect(MONGO_URI, {
            serverSelectionTimeoutMS: 2500,
        })
        isConnected = true
        console.log(`[MongoDB Connected]: ${conn.connection.host}/${conn.connection.name}`)
        return conn
    } catch (error) {
        isConnected = false
        console.warn(`[MongoDB Warning]: Could not connect to MongoDB at ${MONGO_URI}.`)
        console.warn(`[Portfolio App]: Operating in memory/seed fallback mode. Set MONGO_URI in config/.env.development to connect your MongoDB database.`)
        return null
    }
}

export const getDBStatus = () => isConnected

