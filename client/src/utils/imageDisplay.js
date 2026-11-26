import { cldUrl } from './cloudinary'

export function resolveThumbnailSource(doc, legacyField = 'thumbnail', lang = 'en', width = 800) {
  const thumbImg = doc?.thumbnailImage
  const alt = (lang === 'ar' ? thumbImg?.altAr : thumbImg?.alt) || thumbImg?.alt || doc?.title || ''

  if (thumbImg?.publicId) {
    const cloudUrl = cldUrl(thumbImg.publicId, { preset: 'card', width })
    if (cloudUrl) {
      return {
        publicId: thumbImg.publicId,
        src: cloudUrl,
        alt: thumbImg.alt || doc?.title || '',
        altAr: thumbImg.altAr || doc?.title || '',
        width: thumbImg.width,
        height: thumbImg.height,
        isPlaceholder: false
      }
    }
  }

  const legacyUrl = doc?.[legacyField]
  if (legacyUrl && typeof legacyUrl === 'string' && legacyUrl.trim()) {
    return {
      publicId: '',
      src: legacyUrl.trim(),
      alt,
      altAr: alt,
      width: undefined,
      height: undefined,
      isPlaceholder: false
    }
  }

  return {
    publicId: '',
    src: '',
    alt,
    altAr: alt,
    width: undefined,
    height: undefined,
    isPlaceholder: true
  }
}

export function resolveGalleryItems(project, lang = 'en') {
  if (Array.isArray(project?.gallery) && project.gallery.length > 0) {
    const mapped = project.gallery
      .map((item) => {
        if (!item?.publicId) return null
        const src = cldUrl(item.publicId, { preset: 'inline', width: 1280 })
        return {
          publicId: item.publicId,
          src,
          alt: item.alt || project?.title || '',
          altAr: item.altAr || item.alt || project?.title || '',
          caption: item.caption || '',
          captionAr: item.captionAr || item.caption || '',
          width: item.width,
          height: item.height
        }
      })
      .filter(Boolean)
    if (mapped.length > 0) return mapped
  }

  if (Array.isArray(project?.images) && project.images.length > 0) {
    return project.images.filter(Boolean).map((url, idx) => ({
      publicId: '',
      src: url,
      alt: `${project?.title || 'Project'} screenshot ${idx + 1}`,
      altAr: `${project?.title || 'Project'} ${idx + 1}`,
      caption: '',
      captionAr: ''
    }))
  }

  const thumb = resolveThumbnailSource(project, 'thumbnail', lang, 1280)
  return [{ ...thumb, caption: '', captionAr: '' }]
}
