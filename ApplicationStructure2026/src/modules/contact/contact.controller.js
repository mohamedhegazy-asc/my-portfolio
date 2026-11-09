import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { createMessageService, getMessagesService, deleteMessageService } from './contact.service.js'

const router = Router()

// Rate limit for public submissions: maximum 5 requests per 15 minutes per IP
const contactLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { success: false, message: 'Too many contact requests from this IP, please try again in 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
})

// POST /api/contact
router.post('/', contactLimiter, async (req, res, next) => {
    try {
        const { name, email, message } = req.body
        const result = await createMessageService({ name, email, message })
        return res.status(201).json({
            success: true,
            message: 'Thank you for reaching out! Your message has been received.',
            data: result
        })
    } catch (error) {
        next(error)
    }
})

// GET /api/contact/messages (Admin)
router.get('/messages', async (req, res, next) => {
    try {
        const messages = await getMessagesService()
        return res.status(200).json({ success: true, count: messages.length, data: messages })
    } catch (error) {
        next(error)
    }
})

// DELETE /api/contact/messages/:id (Admin)
router.delete('/messages/:id', async (req, res, next) => {
    try {
        const success = await deleteMessageService(req.params.id)
        if (!success) return res.status(404).json({ success: false, message: "Message not found" })
        return res.status(200).json({ success: true, message: "Message deleted successfully" })
    } catch (error) {
        next(error)
    }
})

export default router
