import React, { useState, useEffect } from 'react'
import { Download, Presentation, Info, AlertCircle } from 'lucide-react'
import { useLang } from '../../i18n/LanguageContext'
import { t } from '../../i18n/translations'
import { triggerAssetDownload, formatBytes } from './assetDownload'

function isPublicHttpsUrl(rawUrl) {
  try {
    const parsed = new URL(rawUrl)
    if (parsed.protocol !== 'https:') return false
    const host = parsed.hostname.toLowerCase()
    if (host === 'localhost' || host === '127.0.0.1' || host.endsWith('.local')) return false
    return true
  } catch {
    return false
  }
}

export default function PptxViewer({ asset }) {
  const { lang } = useLang()
  const assetId = asset?.id || asset?._id
  const [showFallback, setShowFallback] = useState(false)

  useEffect(() => {
    if (!assetId) return
    fetch(`/api/assets/${assetId}/view`, { method: 'POST' }).catch(() => {})
  }, [assetId])

  const canEmbed = isPublicHttpsUrl(asset?.url)
  const embedSrc = canEmbed
    ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(asset.url)}`
    : ''

  return (
    <div className="rounded-2xl bg-[#222936] border border-[#374159] overflow-hidden shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-[#1a2130] border-b border-[#374159]">
        <div className="flex items-center gap-2.5 min-w-0">
          <Presentation className="w-4 h-4 text-[#B9D895] shrink-0" />
          <div className="min-w-0">
            <span className="text-sm font-bold text-white truncate block" dir="auto">
              {asset?.title || asset?.originalName}
            </span>
            {asset?.size ? (
              <span className="text-[11px] text-gray-400">{formatBytes(asset.size)} · PPTX</span>
            ) : null}
          </div>
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

      {canEmbed && !showFallback ? (
        <div className="w-full aspect-video bg-[#111722]">
          <iframe
            src={embedSrc}
            title={asset?.title || 'PowerPoint Presentation'}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setShowFallback(true)}
            className="w-full h-full border-0"
          />
        </div>
      ) : (
        <div className="p-6 text-center space-y-3 bg-[#1b2230]">
          <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
          <p className="text-xs sm:text-sm text-gray-200 max-w-lg mx-auto">
            {t(lang, 'viewer.pptxLocalFallback')}
          </p>
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

      <div className="px-4 py-2.5 bg-[#1a2130] border-t border-[#374159] flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-300">
        <div className="flex items-start gap-2 min-w-0 flex-1">
          <Info className="w-3.5 h-3.5 text-[#B9D895] shrink-0 mt-0.5" />
          <span>{t(lang, 'viewer.pptxPrivacyNotice')}</span>
        </div>
        {canEmbed && !showFallback && (
          <button
            type="button"
            onClick={() => setShowFallback(true)}
            className="text-[#B9D895] hover:underline font-medium shrink-0 cursor-pointer"
          >
            {t(lang, 'viewer.pptxFallbackBtn')}
          </button>
        )}
      </div>

      {asset?.description && (
        <div className="px-4 py-2 bg-[#161c29] border-t border-[#374159] text-xs text-gray-300" dir="auto">
          {asset.description}
        </div>
      )}
    </div>
  )
}
