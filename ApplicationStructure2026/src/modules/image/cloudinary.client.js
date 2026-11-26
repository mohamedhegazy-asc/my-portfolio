import { v2 as cloudinary } from 'cloudinary'
import {
    CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET
} from '../../../config/config.service.js'

let mockSdkOverride = null

export function getCloudinaryCredentials() {
    const cloudName = (process.env.CLOUDINARY_CLOUD_NAME ?? CLOUDINARY_CLOUD_NAME ?? '').trim()
    const apiKey = (process.env.CLOUDINARY_API_KEY ?? CLOUDINARY_API_KEY ?? '').trim()
    const apiSecret = (process.env.CLOUDINARY_API_SECRET ?? CLOUDINARY_API_SECRET ?? '').trim()
    return { cloudName, apiKey, apiSecret }
}

export function isCloudinaryConfigured() {
    const { cloudName, apiKey, apiSecret } = getCloudinaryCredentials()
    return Boolean(cloudName && apiKey && apiSecret)
}

export function getCloudinarySdk() {
    if (mockSdkOverride) return mockSdkOverride
    const { cloudName, apiKey, apiSecret } = getCloudinaryCredentials()
    cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true
    })
    return cloudinary
}

export function setCloudinarySdkForTests(mockSdk) {
    mockSdkOverride = mockSdk || null
}
