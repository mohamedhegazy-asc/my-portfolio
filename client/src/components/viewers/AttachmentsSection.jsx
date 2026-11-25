import React, { useState, useEffect, lazy, Suspense } from 'react'
import { Download, FileText, Image as ImageIcon, X, FolderOpen } from 'lucide-react'
import { useLang } from '../../i18n/LanguageContext'
import { t } from '../../i18n/translations'

const ExcelViewer = lazy(() => import('./ExcelViewer'))

function ViewerFallback() {
  return (
    <div className="rounded-2xl bg-[#222936] border border-[#374159] p-8 animate-pulse space-y-3">
      <div className="h-6 bg-[#374159]/60 rounded w-1/3" />
      <div className="h-48 bg-[#374159]/30 rounded w-full" />
    </div>
  )
}

async function triggerAssetDownload(asset) {
  const id = asset?.id || asset?._id
  let url = asset?.url
  if (id) {
    try {
      const res = await fetch(`/api/assets/${id}/download`, { method: 'POST' })
      if (res.ok) {
        const json = await res.json()
        if (json?.data?.url) url = json.data.url
      }
    } catch {}
  }
  if (url) {
    const a = document.createElement('a')
    a.href = url
    a.download = asset?.originalName || asset?.title || 'file'
    a.target = '_blank'
    a.rel = 'noopener noreferrer'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }
}

function AssetCard({ asset, onOpenLightbox }) {
  const { lang } = useLang()
  const id = asset?.id || asset?._id
  const kind = (asset?.kind || '').toLowerCase()

  useEffect(() => {
    if (!id || ['xlsx', 'xls', 'csv'].includes(kind)) return
    fetch(`/api/assets/${id}/view`, { method: 'POST' }).catch(() => {})
  }, [id, kind])

  if (['xlsx', 'xls', 'csv'].includes(kind)) {
    return (
      <Suspense fallback={<ViewerFallback />}>
        <ExcelViewer asset={asset} />
      </Suspense>
    )
  }

  if (kind === 'pdf') {
    return (
      <div className="rounded-2xl bg-[#222936] border border-[#374159] overflow-hidden shadow-lg">
        <div className="flex items-center justify-between gap-3 px-4 py-3 bg-[#1a2130] border-b border-[#374159]">
          <div className="flex items-center gap-2.5 min-w-0">
            <FileText className="w-4 h-4 text-[#B9D895] shrink-0" />
            <span className="text-sm font-bold text-white truncate" dir="auto">
              {asset.title || asset.originalName}
            </span>
          </div>
          <button
            type="button"
            onClick={() => triggerAssetDownload(asset)}
            className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-lg bg-[#B9D895] hover:bg-[#a6ca7f] text-[#222936] transition-colors cursor-pointer shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t(lang, 'viewer.downloadFile')}</span>
          </button>
        </div>
        <iframe
          src={asset.url}
          title={asset.title || 'PDF Document'}
          className="w-full h-[480px] bg-white"
        />
      </div>
    )
  }

  if (kind === 'image') {
    return (
      <div className="rounded-2xl bg-[#222936] border border-[#374159] overflow-hidden shadow-lg">
        <div className="flex items-center justify-between gap-3 px-4 py-3 bg-[#1a2130] border-b border-[#374159]">
          <div className="flex items-center gap-2.5 min-w-0">
            <ImageIcon className="w-4 h-4 text-[#B9D895] shrink-0" />
            <span className="text-sm font-bold text-white truncate" dir="auto">
              {asset.title || asset.originalName}
            </span>
          </div>
          <button
            type="button"
            onClick={() => triggerAssetDownload(asset)}
            className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-lg bg-[#B9D895] hover:bg-[#a6ca7f] text-[#222936] transition-colors cursor-pointer shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t(lang, 'viewer.downloadFile')}</span>
          </button>
        </div>
        <button
          type="button"
          onClick={() => onOpenLightbox?.(asset)}
          className="w-full block cursor-zoom-in bg-[#1e2635]"
        >
          <img
            src={asset.url}
            alt={asset.title || 'Attachment'}
            loading="lazy"
            className="w-full max-h-[420px] object-contain mx-auto"
          />
        </button>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-[#222936] border border-[#374159] px-4 py-3 flex items-center justify-between gap-3">
      <span className="text-sm font-semibold text-white truncate" dir="auto">
        {asset.title || asset.originalName}
      </span>
      <button
        type="button"
        onClick={() => triggerAssetDownload(asset)}
        className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-lg bg-[#B9D895] text-[#222936] cursor-pointer shrink-0"
      >
        <Download className="w-3.5 h-3.5" />
        <span>{t(lang, 'viewer.downloadFile')}</span>
      </button>
    </div>
  )
}

/**
 * Inline ```asset id: <assetId>``` embed for ArticleDetailPage
 */
export function InlineAssetEmbed({ assetId }) {
  const [asset, setAsset] = useState(null)
  const [lightboxAsset, setLightboxAsset] = useState(null)

  useEffect(() => {
    let active = true
    if (!assetId) return
    fetch(`/api/assets/${encodeURIComponent(assetId)}`)
      .then(r => (r.ok ? r.json() : null))
      .then(json => {
        if (active && json?.data) setAsset(json.data)
      })
      .catch(() => {})
    return () => { active = false }
  }, [assetId])

  if (!asset) return null

  return (
    <div className="my-6">
      <AssetCard asset={asset} onOpenLightbox={setLightboxAsset} />
      {lightboxAsset && (
        <ImageLightbox asset={lightboxAsset} onClose={() => setLightboxAsset(null)} />
      )}
    </div>
  )
}

function ImageLightbox({ asset, onClose }) {
  const { lang } = useLang()
  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label={t(lang, 'viewer.closePreview')}
        className="absolute top-5 right-5 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 cursor-pointer"
      >
        <X className="w-5 h-5" />
      </button>
      <img
        src={asset.url}
        alt={asset.title || 'Preview'}
        onClick={(e) => e.stopPropagation()}
        className="max-w-full max-h-[88vh] rounded-xl shadow-2xl object-contain"
      />
    </div>
  )
}

export default function AttachmentsSection({ attachments = [], theme = 'dark' }) {
  const { lang } = useLang()
  const [lightboxAsset, setLightboxAsset] = useState(null)

  const validAttachments = (attachments || []).filter(a => a && typeof a === 'object' && a.url)
  if (validAttachments.length === 0) return null

  const headingColor = theme === 'light' ? 'text-[#222936]' : 'text-white'

  return (
    <section className="space-y-5 mt-12">
      <div className="flex items-center gap-2.5">
        <FolderOpen className={`w-5 h-5 ${theme === 'light' ? 'text-[#222936]' : 'text-[#B9D895]'}`} />
        <h2 className={`text-xl font-extrabold font-serif ${headingColor}`}>
          {t(lang, 'viewer.filesAndData')}
        </h2>
      </div>

      <div className="space-y-6">
        {validAttachments.map((asset) => (
          <AssetCard
            key={asset._id || asset.id}
            asset={asset}
            onOpenLightbox={setLightboxAsset}
          />
        ))}
      </div>

      {lightboxAsset && (
        <ImageLightbox asset={lightboxAsset} onClose={() => setLightboxAsset(null)} />
      )}
    </section>
  )
}
