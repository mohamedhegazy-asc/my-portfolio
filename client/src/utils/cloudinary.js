export const SUPPORTED_WIDTHS = [320, 480, 640, 800, 1024, 1280, 1600]

export const CLOUDINARY_PRESETS = {
  card: 'c_fill,g_auto,ar_16:9',
  cover: 'c_fill,g_auto,ar_16:9',
  inline: 'c_limit',
  lqip: 'w_48,c_limit,e_blur:800,q_auto:eco,f_auto'
}

const DEFAULT_CLOUD_NAME =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_CLOUDINARY_CLOUD_NAME) || ''

/**
 * Snap any requested width to the nearest allowed Cloudinary breakpoint width:
 * [320, 480, 640, 800, 1024, 1280, 1600].
 */
export function snapWidth(width = 800) {
  const num = Number(width)
  if (!Number.isFinite(num) || num <= 0) return 800
  for (const w of SUPPORTED_WIDTHS) {
    if (w >= num) return w
  }
  return SUPPORTED_WIDTHS[SUPPORTED_WIDTHS.length - 1]
}

/**
 * Pure Cloudinary URL builder using official transformation parameters.
 * @param {string} publicId
 * @param {object} [options]
 * @param {'card'|'cover'|'inline'|'lqip'} [options.preset='inline']
 * @param {number} [options.width=800]
 * @param {string} [options.cloudName]
 * @returns {string}
 */
export function cldUrl(publicId, options = {}) {
  if (!publicId) return ''
  const cloudName = String(options.cloudName ?? DEFAULT_CLOUD_NAME).trim()
  if (!cloudName) return ''

  const cleanId = String(publicId).replace(/^\/+/, '')
  const preset = options.preset || 'inline'

  if (preset === 'lqip') {
    return `https://res.cloudinary.com/${cloudName}/image/upload/${CLOUDINARY_PRESETS.lqip}/${cleanId}`
  }

  const w = snapWidth(options.width ?? 800)
  const cropTransform = CLOUDINARY_PRESETS[preset] || CLOUDINARY_PRESETS.inline
  const transform = `f_auto,q_auto,${cropTransform},w_${w}`

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transform}/${cleanId}`
}

export function buildCloudinarySrcSet(publicId, preset = 'inline', cloudName) {
  if (!publicId) return ''
  return SUPPORTED_WIDTHS
    .map((w) => {
      const url = cldUrl(publicId, { preset, width: w, cloudName })
      return url ? `${url} ${w}w` : ''
    })
    .filter(Boolean)
    .join(', ')
}
