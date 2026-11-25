import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../../config/config.service.js'

export const ADMIN_COOKIE_NAME = 'admin_session'

/**
 * Verify admin_session cookie using HS256 and return decoded payload or null.
 */
export const verifyAdminToken = (req) => {
    const token = req.cookies?.[ADMIN_COOKIE_NAME]
    if (!token || !JWT_SECRET) return null
    try {
        const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] })
        if (decoded?.role !== 'admin') return null
        return decoded
    } catch {
        return null
    }
}

/**
 * Middleware: require valid httpOnly admin_session JWT cookie.
 */
export const requireAdmin = (req, res, next) => {
    const decoded = verifyAdminToken(req)
    if (!decoded) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required.'
        })
    }
    req.admin = decoded
    next()
}
