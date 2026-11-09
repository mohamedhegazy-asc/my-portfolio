import React, { createContext, useContext, useState, useEffect } from 'react'

const LanguageContext = createContext()

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('portfolio_lang') || 'en')
  const isRTL = lang === 'ar'

  useEffect(() => {
    localStorage.setItem('portfolio_lang', lang)
    document.documentElement.lang = lang
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr'
    // Font switch: Arabic uses Cairo, English uses existing fonts
    if (isRTL) {
      document.documentElement.classList.add('font-arabic')
    } else {
      document.documentElement.classList.remove('font-arabic')
    }
  }, [lang, isRTL])

  const toggleLang = () => setLang(prev => prev === 'en' ? 'ar' : 'en')

  return (
    <LanguageContext.Provider value={{ lang, isRTL, toggleLang, setLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLang() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLang must be used within LanguageProvider')
  return ctx
}

