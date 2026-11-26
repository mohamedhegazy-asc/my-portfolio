export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']
export const ALLOWED_IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'webp', 'avif', 'gif']
export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB

export function validateImageFile(file) {
  if (!file) return { valid: false, error: 'No file selected.' }
  const ext = file.name.split('.').pop()?.toLowerCase() || ''
  if (!ALLOWED_IMAGE_EXTS.includes(ext)) {
    return { valid: false, error: `Unsupported format '.${ext}'. Allowed: ${ALLOWED_IMAGE_EXTS.join(', ')}` }
  }
  if (file.type && !ALLOWED_IMAGE_TYPES.includes(file.type.toLowerCase())) {
    return { valid: false, error: `Unsupported MIME type '${file.type}'.` }
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return { valid: false, error: 'Image exceeds maximum allowed size of 10 MB.' }
  }
  return { valid: true }
}

export async function compressImageFile(file, { maxDimension = 1920, quality = 0.85 } = {}) {
  if (!file || file.type === 'image/gif') return file
  if (typeof document === 'undefined') return file

  return new Promise((resolve) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      let { width, height } = img
      if (width <= maxDimension && height <= maxDimension && file.size < 800 * 1024) {
        resolve(file)
        return
      }
      if (width > maxDimension || height > maxDimension) {
        if (width >= height) {
          height = Math.round((height * maxDimension) / width)
          width = maxDimension
        } else {
          width = Math.round((width * maxDimension) / height)
          height = maxDimension
        }
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        resolve(file)
        return
      }
      ctx.drawImage(img, 0, 0, width, height)
      const outType = file.type === 'image/png' ? 'image/png' : 'image/webp'
      canvas.toBlob(
        (blob) => {
          if (!blob || blob.size >= file.size) {
            resolve(file)
            return
          }
          const newName = file.name.replace(/\.[^.]+$/, outType === 'image/png' ? '.png' : '.webp')
          resolve(new File([blob], newName, { type: outType, lastModified: Date.now() }))
        },
        outType,
        quality
      )
    }
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(file)
    }
    img.src = objectUrl
  })
}
