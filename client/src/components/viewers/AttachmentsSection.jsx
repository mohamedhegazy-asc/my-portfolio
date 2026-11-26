import React, { useState, useEffect, lazy, Suspense } from 'react'
import {
  Download,
  FileText,
  Image as ImageIcon,
  X,
  FolderOpen,
  AlertTriangle,
  Presentation,
  ExternalLink
} from 'lucide-react'
import { useLang } from '../../i18n/LanguageContext'
import { t } from '../../i18n/translations'
import { triggerAssetDownload } from './assetDownload'

const ExcelViewer = lazy(() => import('./ExcelViewer'))
const DocxViewer = lazy(() => import('./DocxViewer'))
const PptxViewer = lazy(() => import('./PptxViewer'))

function ViewerFallback() {
  return (
    <div className="rounded-2xl bg-[#222936] border border-[#374159] p-8 animate-pulse space-y-3">
      <div className="h-6 bg-[#374159]/60 rounded w-1/3" />
      <div className="h-48 bg-[#374159]/30 rounded w-full" />
    </div>
  )
}

export function AssetCard({ asset, onOpenLightbox }) {
  const { lang } = useLang()
  const id = asset?.id || asset?._id
  const kind = (asset?.kind || '').toLowerCase()
  const isLegacy = Boolean(asset?.isLegacy || ['doc', 'xls', 'ppt'].includes(kind))
  const isExcelPreviewable = !isLegacy && ['xlsx', 'csv'].includes(kind)
  const isDocxPreviewable = !isLegacy && kind === 'docx'
  const isPptxPreviewable = !isLegacy && kind === 'pptx'
  const hasSelfViewTracking = isExcelPreviewable || isDocxPreviewable || isPptxPreviewable

  useEffect(() => {
    if (!id || hasSelfViewTracking) return
    fetch(`/api/assets/${id}/view`, { method: 'POST' }).catch(() => {})
  }, [id, hasSelfViewTracking])

  if (isExcelPreviewable) {
    return (
      <Suspense fallback={<ViewerFallback />}>
        <ExcelViewer asset={asset} />
      </Suspense>
    )
  }

  if (isDocxPreviewable) {
    return (
      <Suspense fallback={<ViewerFallback />}>
        <DocxViewer asset={asset} />
      </Suspense>
    )
  }

  if (isPptxPreviewable) {
    return (
      <Suspense fallback={<ViewerFallback />}>
        <PptxViewer asset={asset} />
      </Suspense>
    )
  }

  if (kind === 'pdf') {
    return (
      <div className="rounded-2xl bg-[#222936] border border-[#374159] overflow-hidden shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-[#1a2130] border-b border-[#374159]">
          <div className="flex items-center gap-2.5 min-w-0">
            <FileText className="w-4 h-4 text-[#B9D895] shrink-0" />
            <span className="text-sm font-bold text-white truncate" dir="auto">
              {asset.title || asset.originalName}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={asset.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg border border-[#374159] text-gray-200 hover:text-white hover:border-[#B9D895]/50 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>{t(lang, 'viewer.openPdf')}</span>
            </a>
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
        <iframe
          src={asset.url}
          title={asset.title || 'PDF Document'}
          loading="lazy"
          className="hidden sm:block w-full h-[480px] bg-white"
        />
        <div className="sm:hidden p-5 bg-[#1b2230] text-center space-y-3">
          <FileText className="w-8 h-8 text-[#B9D895] mx-auto" />
          <p className="text-xs text-gray-300">{t(lang, 'viewer.pdfMobileHint')}</p>
          <div className="flex items-center justify-center gap-2">
            <a
              href={asset.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-lg border border-[#374159] text-white"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>{t(lang, 'viewer.openPdf')}</span>
            </a>
            <button
              type="button"
              onClick={() => triggerAssetDownload(asset)}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-lg bg-[#B9D895] text-[#222936] cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t(lang, 'viewer.downloadFile')}</span>
            </button>
          </div>
        </div>
        {asset.description && (
          <div className="px-4 py-2.5 bg-[#1a2130] border-t border-[#374159] text-xs text-gray-300" dir="auto">
            {asset.description}
          </div>
        )}
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
        {asset.description && (
          <div className="px-4 py-2.5 bg-[#1a2130] border-t border-[#374159] text-xs text-gray-300" dir="auto">
            {asset.description}
          </div>
        )}
      </div>
    )
  }

  const DocIcon = ['ppt', 'pptx'].includes(kind) ? Presentation : FileText

  return (
    <div className="rounded-2xl bg-[#222936] border border-[#374159] p-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <DocIcon className="w-4 h-4 text-[#B9D895] shrink-0" />
          <div className="min-w-0">
            <span className="text-sm font-semibold text-white truncate block" dir="auto">
              {asset.title || asset.originalName}
            </span>
            {asset.description && (
              <span className="text-xs text-gray-400 block truncate" dir="auto">
                {asset.description}
              </span>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => triggerAssetDownload(asset)}
          className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-lg bg-[#B9D895] text-[#222936] cursor-pointer shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{t(lang, 'viewer.downloadFile')}</span>
        </button>
      </div>

      {isLegacy && (
        <div className="flex items-start gap-2 rounded-xl bg-amber-500/10 border border-amber-400/30 px-3 py-2 text-xs text-amber-200">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>{t(lang, 'viewer.legacyRiskWarning')}</span>
        </div>
      )}
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
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
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

  const validAttachments = (attachments || []).filter((a) => a && typeof a === 'object' && a.url)
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
