import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Download, FileText, AlertCircle, Maximize2, Minimize2 } from 'lucide-react'
import { useLang } from '../../i18n/LanguageContext'
import { t } from '../../i18n/translations'
import { triggerAssetDownload, formatBytes } from './assetDownload'

const MAX_DOCX_PREVIEW_BYTES = 10 * 1024 * 1024 // 10 MB

export default function DocxViewer({ asset }) {
  const { lang } = useLang()
  const assetId = asset?.id || asset?._id

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tooLarge, setTooLarge] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [scale, setScale] = useState(1)
  const [scaledHeight, setScaledHeight] = useState(null)

  const viewportRef = useRef(null)
  const contentRef = useRef(null)

  // View counter tracking
  useEffect(() => {
    if (!assetId) return
    fetch(`/api/assets/${assetId}/view`, { method: 'POST' }).catch(() => {})
  }, [assetId])

  const updateScale = useCallback(() => {
    const viewport = viewportRef.current
    const content = contentRef.current
    if (!viewport || !content) return

    const pageEl = content.querySelector('.docx-wrapper > section.docx') || content.querySelector('.docx-wrapper') || content.firstElementChild
    if (!pageEl) {
      setScale(1)
      setScaledHeight(null)
      return
    }

    const availableWidth = Math.max(240, viewport.clientWidth - 16)
    const naturalWidth = pageEl.scrollWidth || pageEl.offsetWidth || 794
    const nextScale = naturalWidth > availableWidth ? Math.min(1, availableWidth / naturalWidth) : 1
    const naturalHeight = content.scrollHeight || content.offsetHeight || 0

    setScale(nextScale)
    setScaledHeight(nextScale < 1 && naturalHeight > 0 ? Math.ceil(naturalHeight * nextScale) + 16 : null)
  }, [])

  useEffect(() => {
    let active = true
    const controller = new AbortController()

    async function loadAndRender() {
      if (!asset?.url) {
        setError(t(lang, 'viewer.docxError'))
        setLoading(false)
        return
      }

      if (asset.size && asset.size > MAX_DOCX_PREVIEW_BYTES) {
        setTooLarge(true)
        setLoading(false)
        return
      }

      setLoading(true)
      setError('')
      setTooLarge(false)

      try {
        const res = await fetch(asset.url, { signal: controller.signal })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)

        const contentLen = Number(res.headers.get('content-length') || 0)
        if (contentLen > MAX_DOCX_PREVIEW_BYTES) {
          if (active) {
            setTooLarge(true)
            setLoading(false)
          }
          return
        }

        const buffer = await res.arrayBuffer()
        if (!active) return

        if (buffer.byteLength > MAX_DOCX_PREVIEW_BYTES) {
          setTooLarge(true)
          setLoading(false)
          return
        }

        const { renderAsync } = await import('docx-preview')
        if (!active || !contentRef.current) return

        contentRef.current.innerHTML = ''
        await renderAsync(buffer, contentRef.current, undefined, {
          className: 'docx',
          inWrapper: true,
          ignoreWidth: false,
          ignoreHeight: false,
          ignoreFonts: false,
          breakPages: true,
          useBase64URL: true,
          experimental: false,
        })

        if (!active) return
        setLoading(false)
        requestAnimationFrame(updateScale)
      } catch (err) {
        if (!active || err.name === 'AbortError') return
        setError(t(lang, 'viewer.docxError'))
        setLoading(false)
      }
    }

    loadAndRender()
    return () => {
      active = false
      controller.abort()
    }
  }, [asset?.url, asset?.size, lang, updateScale])

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(() => updateScale())
    ro.observe(viewport)
    return () => ro.disconnect()
  }, [updateScale])

  const headerBar = (
    <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-[#1a2130] border-b border-[#374159]">
      <div className="flex items-center gap-2.5 min-w-0">
        <FileText className="w-4 h-4 text-[#B9D895] shrink-0" />
        <div className="min-w-0">
          <span className="text-sm font-bold text-white truncate block" dir="auto">
            {asset?.title || asset?.originalName}
          </span>
          {asset?.size ? (
            <span className="text-[11px] text-gray-400">{formatBytes(asset.size)} · DOCX</span>
          ) : null}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {!tooLarge && !error && (
          <button
            type="button"
            onClick={() => setFullscreen((f) => !f)}
            aria-label={fullscreen ? t(lang, 'viewer.exitFullscreen') : t(lang, 'viewer.fullscreen')}
            className="p-2 rounded-lg border border-[#374159] text-gray-300 hover:text-white hover:border-[#B9D895]/50 transition-colors cursor-pointer"
          >
            {fullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        )}
        <button
          type="button"
          onClick={() => triggerAssetDownload(asset)}
          className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-lg bg-[#B9D895] hover:bg-[#a6ca7f] text-[#222936] transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{t(lang, 'viewer.downloadFile')}</span>
        </button>
      </div>
    </div>
  )

  if (tooLarge) {
    return (
      <div className="rounded-2xl bg-[#222936] border border-[#374159] overflow-hidden shadow-lg">
        {headerBar}
        <div className="p-6 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
          <p className="text-sm text-gray-200 max-w-md mx-auto">{t(lang, 'viewer.docxTooLarge')}</p>
          <button
            type="button"
            onClick={() => triggerAssetDownload(asset)}
            className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-lg bg-[#B9D895] text-[#222936] cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t(lang, 'viewer.downloadOriginal')}</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className={
        fullscreen
          ? 'fixed inset-0 z-50 bg-[#151b26] flex flex-col'
          : 'rounded-2xl bg-[#222936] border border-[#374159] overflow-hidden shadow-lg'
      }
    >
      {headerBar}

      {loading && (
        <div className="p-8 text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#B9D895] border-t-transparent animate-spin mx-auto" />
          <p className="text-xs text-gray-300">{t(lang, 'viewer.loadingDocx')}</p>
        </div>
      )}

      {error && (
        <div className="p-6 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
          <p className="text-sm text-gray-200 max-w-md mx-auto">{error}</p>
          <button
            type="button"
            onClick={() => triggerAssetDownload(asset)}
            className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-lg bg-[#B9D895] text-[#222936] cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t(lang, 'viewer.downloadOriginal')}</span>
          </button>
        </div>
      )}

      <div
        ref={viewportRef}
        className={`${loading || error ? 'hidden' : 'block'} bg-[#e5e7eb] overflow-y-auto overflow-x-hidden ${
          fullscreen ? 'flex-1 p-4' : 'max-h-[560px] p-2 sm:p-4'
        }`}
      >
        <div
          style={
            scaledHeight
              ? { height: `${scaledHeight}px`, overflow: 'hidden' }
              : undefined
          }
          className="w-full flex justify-center"
        >
          <div
            ref={contentRef}
            style={{
              transform: scale < 1 ? `scale(${scale})` : undefined,
              transformOrigin: 'top center',
            }}
            className="docx-preview-host"
          />
        </div>
      </div>

      {asset?.description && (
        <div className="px-4 py-2.5 bg-[#1a2130] border-t border-[#374159] text-xs text-gray-300" dir="auto">
          {asset.description}
        </div>
      )}
    </div>
  )
}
