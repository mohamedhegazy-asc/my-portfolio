export const ALLOWED_INLINE_WIDTHS = [50, 75, 100]
export const ALLOWED_INLINE_ALIGNMENTS = ['center', 'start', 'end']

const SAFE_PUBLIC_ID_RE = /^[a-zA-Z0-9/_-]+$/
const ASPECT_RATIO_RE = /^(\d{1,3})[:/](\d{1,3})$/

/**
 * Custom react-markdown urlTransform:
 * Allows safe cld: URLs, https/http, relative /, and # anchors.
 * Blocks javascript:, data:, vbscript:, file:, and all other unsafe schemes.
 */
export function safeMarkdownUrlTransform(url = '') {
  const trimmed = String(url || '').trim()
  if (!trimmed) return ''

  if (/^cld:/i.test(trimmed)) {
    const parsed = parseCldImageUrl(trimmed)
    return parsed ? trimmed : ''
  }

  if (trimmed.startsWith('/') || trimmed.startsWith('#')) {
    return trimmed
  }

  try {
    const u = new URL(trimmed)
    if (u.protocol === 'https:' || u.protocol === 'http:') {
      return trimmed
    }
    return ''
  } catch {
    return ''
  }
}

/**
 * Parse and validate `cld:<publicId>#ar=<ratio>&w=<width>&align=<alignment>`.
 * Returns null if publicId is missing or unsafe.
 */
export function parseCldImageUrl(rawUrl = '') {
  const str = String(rawUrl || '').trim()
  if (!/^cld:/i.test(str)) return null

  const withoutScheme = str.slice(4)
  const [rawId, fragmentPart = ''] = withoutScheme.split('#')
  const [publicIdPart, queryPart = ''] = rawId.split('?')
  const publicId = publicIdPart.replace(/^\/+/, '').trim()

  if (!publicId || publicId.includes('..') || !SAFE_PUBLIC_ID_RE.test(publicId)) {
    return null
  }

  const params = new URLSearchParams(fragmentPart || queryPart)

  const rawW = parseInt(params.get('w') || '100', 10)
  const widthPct = ALLOWED_INLINE_WIDTHS.includes(rawW) ? rawW : 100

  const rawAlign = String(params.get('align') || 'center').toLowerCase()
  const align = ALLOWED_INLINE_ALIGNMENTS.includes(rawAlign) ? rawAlign : 'center'

  let aspectRatio = '16 / 9'
  let rawAr = String(params.get('ar') || '16:9').trim()
  const arMatch = ASPECT_RATIO_RE.exec(rawAr)
  if (arMatch) {
    const num = Math.max(1, Number(arMatch[1]))
    const den = Math.max(1, Number(arMatch[2]))
    aspectRatio = `${num} / ${den}`
  }

  return {
    publicId,
    widthPct,
    align,
    aspectRatio
  }
}

export function formatCldImageUrl(publicId, { ar = '16:9', w = 100, align = 'center' } = {}) {
  const cleanId = String(publicId || '').replace(/^\/+/, '').trim()
  const widthPct = ALLOWED_INLINE_WIDTHS.includes(Number(w)) ? Number(w) : 100
  const safeAlign = ALLOWED_INLINE_ALIGNMENTS.includes(align) ? align : 'center'
  const safeAr = ASPECT_RATIO_RE.test(String(ar)) ? String(ar).replace('/', ':') : '16:9'
  return `cld:${cleanId}#ar=${safeAr}&w=${widthPct}&align=${safeAlign}`
}

/**
 * Extract consecutive inline image groups from Markdown so adjacent images
 * can be navigated together as a single Lightbox gallery.
 */
export function extractInlineImageGroups(markdown = '') {
  const lines = String(markdown).split(/\r?\n/)
  const groups = []
  let currentGroup = []
  let inFence = false

  const imgLineRe = /^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)\s*$/

  for (const line of lines) {
    const trimmed = line.trim()
    if (/^```/.test(trimmed)) {
      inFence = !inFence
      if (currentGroup.length > 0) {
        groups.push(currentGroup)
        currentGroup = []
      }
      continue
    }
    if (inFence) continue

    const match = imgLineRe.exec(trimmed)
    if (match) {
      const [, alt, src, title] = match
      const cld = parseCldImageUrl(src)
      currentGroup.push({
        alt: alt || '',
        caption: title || '',
        src,
        publicId: cld?.publicId || ''
      })
    } else if (trimmed !== '') {
      if (currentGroup.length > 0) {
        groups.push(currentGroup)
        currentGroup = []
      }
    }
  }

  if (currentGroup.length > 0) {
    groups.push(currentGroup)
  }

  return groups
}
