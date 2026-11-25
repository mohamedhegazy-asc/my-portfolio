import React from 'react'
import { AlertTriangle } from 'lucide-react'
import { useLang } from '../../i18n/LanguageContext'
import { t } from '../../i18n/translations'

export default function ConfirmDialog({ open, title, message, onConfirm, onCancel, danger = true }) {
  const { lang, isRTL } = useLang()
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <div
        dir={isRTL ? 'rtl' : 'ltr'}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl bg-white border border-gray-200 shadow-2xl p-6 space-y-4"
      >
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${danger ? 'bg-red-50 text-red-600' : 'bg-[#E0F6C4] text-[#222936]'}`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#222936]">{title}</h3>
            {message && <p className="text-xs text-gray-600 mt-1 leading-relaxed">{message}</p>}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
          >
            {t(lang, 'adminP5.cancel')}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 rounded-xl text-xs font-bold text-white cursor-pointer ${danger ? 'bg-red-600 hover:bg-red-700' : 'bg-[#222936] hover:bg-[#374159]'}`}
          >
            {t(lang, 'adminP5.confirm')}
          </button>
        </div>
      </div>
    </div>
  )
}
