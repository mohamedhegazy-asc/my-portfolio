import { Router } from 'express'
import { getProfileService, updateProfileService } from './profile.service.js'
import { requireAdmin } from '../../middleware/requireAdmin.js'
import { validateBody, profileUpdateSchema } from '../../utils/validation.js'

const router = Router()

// GET /api/profile — public, cached
router.get('/', async (req, res, next) => {
    try {
        const profile = await getProfileService()
        res.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120')
        return res.status(200).json({ success: true, data: profile })
    } catch (error) {
        next(error)
    }
})

// PUT /api/profile (Admin + strict Zod validation)
router.put('/', requireAdmin, validateBody(profileUpdateSchema), async (req, res, next) => {
    try {
        const updated = await updateProfileService(req.body)
        return res.status(200).json({ success: true, message: "Profile updated successfully", data: updated })
    } catch (error) {
        next(error)
    }
})

export default router
