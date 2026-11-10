import { Message } from '../../DB/model/index.js'
import { getDBStatus } from '../../DB/connection.db.js'
import { defaultMessages } from '../../DB/seed.js'

let inMemoryMessages = [...defaultMessages]

export const createMessageService = async ({ name, email, subject = '', message, ip = '' }) => {
    if (!name || !email || !message) {
        const error = new Error('Please provide name, email, and message')
        error.cause = { status: 400 }
        throw error
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
        const error = new Error('Invalid email format')
        error.cause = { status: 400 }
        throw error
    }

    if (getDBStatus()) {
        const newMessage = await Message.create({ name, email, subject, message, ip })
        return newMessage
    }

    const mockMessage = {
        _id: `msg_${Date.now()}`,
        name,
        email,
        subject,
        message,
        isRead: false,
        isStarred: false,
        ip,
        createdAt: new Date()
    }
    inMemoryMessages.unshift(mockMessage)
    return mockMessage
}

export const getMessagesService = async () => {
    if (getDBStatus()) {
        try {
            const list = await Message.find().sort({ createdAt: -1 }).lean()
            if (list && list.length > 0) return list
        } catch (err) {
            console.error("Error fetching messages from MongoDB:", err.message)
        }
    }
    return inMemoryMessages
}

export const markMessageReadService = async (id, isRead = true) => {
    if (getDBStatus()) {
        const updated = await Message.findByIdAndUpdate(id, { isRead }, { new: true })
        return updated
    }
    const msg = inMemoryMessages.find(m => m._id === id)
    if (msg) msg.isRead = isRead
    return msg || null
}

export const starMessageService = async (id, isStarred = true) => {
    if (getDBStatus()) {
        const updated = await Message.findByIdAndUpdate(id, { isStarred }, { new: true })
        return updated
    }
    const msg = inMemoryMessages.find(m => m._id === id)
    if (msg) msg.isStarred = isStarred
    return msg || null
}

export const deleteMessageService = async (id) => {
    if (getDBStatus()) {
        const deleted = await Message.findByIdAndDelete(id)
        return !!deleted
    }
    const idx = inMemoryMessages.findIndex(m => m._id === id)
    if (idx !== -1) {
        inMemoryMessages.splice(idx, 1)
        return true
    }
    return false
}
