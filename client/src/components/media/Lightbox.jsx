import React, { useState, useEffect, useRef, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react'
import { useLang } from '../../i18n/LanguageContext'
import { cldUrl } from '../../utils/cloudinary'

export default function Lightbox({ items = [], initialIndex = 0, onClose }) {
  const { lang, isRTL } = useLang()
  const [index, setIndex] = useState(initialIndex)
  const [zoomed, setZoomed] = useState(false)

  const dialogRef = useRef(null)
  const closeBtnRef = useRef(null)
  const touchStartRef = useRef(null)
  const previousFocusRef = useRef(null)

  const total = items.length
  const current = items[index] || null

  const goPrev = useCallback(() => {
    setZoomed(false)
    setIndex((i) => (i - 1 + total) % total)
  }, [total])

  const goNext = useCallback(() => {
    setZoomed(false)
    setIndex((i) => (i + 1) % total)
  }, [total])

  // Focus management: store trigger focus, focus close button, restore on unmount
  useEffect(() => {
    previousFocusRef.current = document.activeElement
    closeBtnRef.current?.focus()
    return () => {
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
        previousFocusRef.current.focus()
      }
    }
  }, [])

  // Keyboard navigation + Escape + focus trap
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose?.()
        return
      }
      if (total > 1) {
        if (e.key === 'ArrowRight') {
          e.preventDefault()
          isRTL ? goPrev() : goNext()
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault()
          isRTL ? goNext() : goPrev()
        }
      }
      if (e.key === 'Tab' && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll(
          'button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
        if (focusables.length === 0) return
        const first = focusables[0]
        const last = focusables[focusables.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose, total, isRTL, goNext, goPrev])

  if (!current) return null

  const alt =
    (lang === 'ar' ? current.altAr : current.alt) ||
    current.alt ||
    current.altAr ||
    'Image preview'
  const caption =
    (lang === 'ar' ? current.captionAr : current.caption) ||
    current.caption ||
    ''
  const src = current.publicId
    ? cldUrl(current.publicId, { preset: 'inline', width: 1600 }) || current.src
    : current.src

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }
  }

  const handleTouchEnd = (e) => {
    if (!touchStartRef.current || total <= 1 || zoomed) return
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y
    touchStartRef.current = null
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) {
        isRTL ? goPrev() : goNext()
      } else {
        isRTL ? goNext() : goPrev()
      }
    }
  }

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      dir={isRTL ? 'rtl' : 'ltr'}
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xs flex flex-col items-center justify-center p-3 sm:p-6 select-none"
    >
      {/* Top toolbar */}
      <div
        className="w-full max-w-5xl flex items-center justify-between gap-3 mb-3 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-xs font-semibold text-white/75">
          {total > 1 ? `${index + 1} / ${total}` : ''}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setZoomed((z) => !z)}
            aria-label={zoomed ? (isRTL ? 'تصغير' : 'Zoom out') : (isRTL ? 'تكبير' : 'Zoom in')}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
          >
            {zoomed ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
          </button>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            aria-label={isRTL ? 'إغلاق' : 'Close'}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main image stage */}
      <div
        className="relative w-full max-w-5xl flex-1 flex items-center justify-center overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {total > 1 && (
          <button
            type="button"
            onClick={isRTL ? goNext : goPrev}
            aria-label={isRTL ? 'السابق' : 'Previous'}
            className="absolute start-2 sm:start-4 z-10 p-2.5 rounded-full bg-black/50 hover:bg-black/75 text-white cursor-pointer"
          >
            {isRTL ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        )}

        <img
          src={src}
          alt={alt}
          onClick={() => setZoomed((z) => !z)}
          className={`rounded-xl shadow-2xl transition-transform duration-200 touch-pinch-zoom ${
            zoomed
              ? 'max-w-none max-h-none scale-150 cursor-zoom-out'
              : 'max-w-full max-h-[78vh] object-contain cursor-zoom-in'
          }`}
        />

        {total > 1 && (
          <button
            type="button"
            onClick={isRTL ? goPrev : goNext}
            aria-label={isRTL ? 'التالي' : 'Next'}
            className="absolute end-2 sm:end-4 z-10 p-2.5 rounded-full bg-black/50 hover:bg-black/75 text-white cursor-pointer"
          >
            {isRTL ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        )}
      </div>

      {caption && (
        <p
          className="mt-3 text-xs sm:text-sm text-white/85 text-center max-w-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {caption}
        </p>
      )}
    </div>
  )
}
