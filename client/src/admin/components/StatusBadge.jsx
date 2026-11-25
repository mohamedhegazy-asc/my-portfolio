import React from 'react'
import { useLang } from '../../i18n/LanguageContext'

const STYLES = {
  public: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  private: 'bg-amber-50 text-amber-700 border-amber-200',
  draft: 'bg-gray-100 text-gray-600 border-gray-200',
}

export default function StatusBadge({ status = 'public' }) {
  const { isRTL } = useLang()
  const norm = ['public', 'private', 'draft'].includes(status) ? status : 'public'

  const labels = {
    public: isRTL ? 'عام' : 'Public',
    private: isRTL ? 'خاص' : 'Private',
    draft: isRTL ? 'مسودة' : 'Draft',
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${STYLES[norm]}`}>
      {labels[norm]}
    </span>
  )
}
