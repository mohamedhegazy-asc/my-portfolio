import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    message: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now }
})

export const Message = mongoose.models.Message || mongoose.model('Message', messageSchema)

