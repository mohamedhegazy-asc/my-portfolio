import React from 'react'
import { ArrowUp } from 'lucide-react'
import { useLang } from '../i18n/LanguageContext'
import { t } from '../i18n/translations'

export default function Footer({ profile }) {
  const { lang, isRTL } = useLang()

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const displayName = isRTL ? 'محمد محمود حجازي' : (profile?.name || "Mohamed Mahmoud Hegazy")

  return (
    <footer className="w-full bg-[#222936] text-[#E0F6C4] border-t border-[#374159]/50 py-12 px-6 md:px-12 lg:px-20">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Brand */}
        <div className="flex items-center gap-3">
          <span className="text-2xl font-black text-[#B9D895] lowercase">
            {profile?.initials || 'mmh'}
          </span>
          <span className="text-sm text-[#E0F6C4]/60">
            • {displayName}
          </span>
        </div>

        {/* Center note */}
        <div className="text-xs text-[#E0F6C4]/60 text-center">
          {t(lang, 'footer.crafted')}
        </div>

        {/* Back to top */}
        <button
          onClick={scrollToTop}
          className="flex items-center gap-2 text-xs font-medium text-[#E0F6C4]/80 hover:text-[#B9D895] transition-colors cursor-pointer group"
        >
          <span>{t(lang, 'footer.backToTop')}</span>
          <div className="w-6 h-6 rounded-full bg-[#374159] flex items-center justify-center group-hover:-translate-y-0.5 transition-transform">
            <ArrowUp className="w-3.5 h-3.5 text-[#B9D895]" />
          </div>
        </button>

      </div>
    </footer>
  )
}
