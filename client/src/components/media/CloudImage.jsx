import React, { useState } from 'react'
import { Image as ImageIcon } from 'lucide-react'
import { useLang } from '../../i18n/LanguageContext'
import { cldUrl, buildCloudinarySrcSet } from '../../utils/cloudinary'

export default function CloudImage({
  publicId = '',
  fallbackUrl = '',
  preset = 'inline',
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  width,
  height,
  alt = '',
  altAr = '',
  priority = false,
  className = 'w-full h-full object-cover',
  wrapperClassName = 'relative overflow-hidden bg-slate-200/40',
  style,
  onClick,
  ariaLabel
}) {
  const { lang } = useLang()
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)

  const resolvedAlt = (lang === 'ar' ? altAr : alt) || alt || altAr || ''
  const cloudSrc = publicId ? cldUrl(publicId, { preset, width: width || 1280 }) : ''
  const cloudSrcSet = cloudSrc ? buildCloudinarySrcSet(publicId, preset) : ''
  const lqipSrc = cloudSrc ? cldUrl(publicId, { preset: 'lqip' }) : ''

  const finalSrc = cloudSrc || (fallbackUrl && typeof fallbackUrl === 'string' ? fallbackUrl.trim() : '')
  const explicitW = width || (preset === 'card' || preset === 'cover' ? 1280 : undefined)
  const explicitH = height || (preset === 'card' || preset === 'cover' ? 720 : undefined)

  const isInteractive = typeof onClick === 'function'

  const handleKeyDown = (e) => {
    if (!isInteractive) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onClick(e)
    }
  }

  if (!finalSrc || failed) {
    return (
      <div
        className={`${wrapperClassName} flex flex-col items-center justify-center gap-1.5 text-slate-400 select-none`}
        style={style}
        role={isInteractive ? 'button' : undefined}
        tabIndex={isInteractive ? 0 : undefined}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        aria-label={ariaLabel || resolvedAlt || 'Image placeholder'}
      >
        <ImageIcon className="w-6 h-6 opacity-60" />
        {resolvedAlt && (
          <span className="text-[11px] font-medium px-3 text-center line-clamp-1 opacity-75">
            {resolvedAlt}
          </span>
        )}
      </div>
    )
  }

  return (
    <div
      className={wrapperClassName}
      style={style}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      aria-label={isInteractive ? (ariaLabel || resolvedAlt || 'Open image') : undefined}
    >
      {lqipSrc && !loaded && (
        <img
          src={lqipSrc}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover scale-105 blur-md transition-opacity duration-300 pointer-events-none"
        />
      )}
      <img
        src={finalSrc}
        srcSet={cloudSrcSet || undefined}
        sizes={cloudSrcSet ? sizes : undefined}
        width={explicitW}
        height={explicitH}
        alt={resolvedAlt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        className={`${className} transition-opacity duration-300 ${
          lqipSrc && !loaded ? 'opacity-0' : 'opacity-100'
        }`}
      />
    </div>
  )
}
