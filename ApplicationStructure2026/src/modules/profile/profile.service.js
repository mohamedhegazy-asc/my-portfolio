import { Profile } from '../../DB/model/index.js'
import { getDBStatus } from '../../DB/connection.db.js'
import { defaultProfile } from '../../DB/seed.js'
import { NODE_ENV } from '../../../config/config.service.js'

let inMemoryProfile = { ...defaultProfile }

export const getProfileService = async () => {
    if (getDBStatus()) {
        try {
            const profile = await Profile.findOne().lean()
            if (profile) return profile
        } catch (err) {
            console.error("Error fetching profile from MongoDB:", err.message)
            if (NODE_ENV === 'production') {
                throw err
            }
        }
    }
    if (NODE_ENV === 'production') {
        throw new Error('Database connection unavailable')
    }
    return inMemoryProfile
}

export const updateProfileService = async (data) => {
    if (getDBStatus()) {
        const updated = await Profile.findOneAndUpdate(
            {},
            { $set: data },
            { new: true, upsert: true }
        )
        return updated
    }
    if (NODE_ENV === 'production') {
        throw new Error('Database connection unavailable')
    }
    inMemoryProfile = { ...inMemoryProfile, ...data }
    return inMemoryProfile
}
