import { Router } from 'express'
import { getProfileService, updateProfileService } from './profile.service.js'

const router = Router()

// GET /api/profile
router.get('/', async (req, res, next) => {
    try {
        const profile = await getProfileService()
        return res.status(200).json({ success: true, data: profile })
    } catch (error) {
        next(error)
    }
})

// PUT /api/profile (Admin)
router.put('/', async (req, res, next) => {
    try {
        const updated = await updateProfileService(req.body)
        return res.status(200).json({ success: true, message: "Profile updated successfully", data: updated })
    } catch (error) {
        next(error)
    }
})

export default router
