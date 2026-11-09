import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Shield, Globe } from 'lucide-react'
import { useLang } from '../i18n/LanguageContext'
import { t } from '../i18n/translations'

export default function Navbar({ profile, onOpenContact }) {
  const { lang, setLang, isRTL } = useLang()
  const location = useLocation()
  const isHomePage = location.pathname === '/'
  const [activeSection, setActiveSection] = useState('home')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (!isHomePage) return

    const handleScroll = () => {
      const scrollPos = window.scrollY + 120
      const sections = ['home', 'projects', 'articles', 'services', 'about']
      
      for (const section of sections) {
        const el = document.getElementById(section)
        if (el) {
          const top = el.offsetTop
          const height = el.offsetHeight
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(section)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isHomePage])

  const scrollTo = (id) => {
    setMobileMenuOpen(false)
    if (!isHomePage) return
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const navLinks = [
    { label: t(lang, 'nav.home'), id: 'home' },
    { label: t(lang, 'nav.projects'), id: 'projects' },
    { label: t(lang, 'nav.articles'), id: 'articles' },
    { label: t(lang, 'nav.services'), id: 'services' },
    { label: t(lang, 'nav.about'), id: 'about' },
  ]

  return (
    <nav className="w-full bg-[#222936] text-[#E0F6C4] px-6 md:px-12 py-5 flex items-center justify-between border-b border-[#374159]/40 sticky top-0 z-40">
      {/* Left: Wordmark Logo */}
      <Link 
        to="/" 
        className="text-2xl font-black tracking-tight text-white hover:text-[#B9D895] transition-colors lowercase"
        aria-label="Home"
      >
        {profile?.initials || 'mmh'}
      </Link>

      {/* Center: Navigation Links */}
      <div className="hidden md:flex items-center gap-8">
        {navLinks.map((item) => {
          const isActive = isHomePage && activeSection === item.id
          return isHomePage ? (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className={`relative py-1 text-sm font-medium transition-colors cursor-pointer ${
                isActive
                  ? 'text-white font-semibold'
                  : 'text-[#E0F6C4]/60 hover:text-white'
              }`}
            >
              {item.label}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#B9D895] rounded-full" />
              )}
            </button>
          ) : (
            <Link
              key={item.id}
              to={`/#${item.id}`}
              className="py-1 text-sm font-medium text-[#E0F6C4]/60 hover:text-white transition-colors"
            >
              {item.label}
            </Link>
          )
        })}
      </div>

      {/* Right: Language Switcher, Admin Dashboard Link, & Contact Button */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Language Switcher Selector */}
        <div className="flex items-center bg-[#374159]/40 border border-[#374159]/70 rounded-full p-1 text-xs shadow-inner">
          <Globe className="w-3.5 h-3.5 text-[#B9D895] mx-1.5 hidden sm:block" />
          <button
            type="button"
            onClick={() => setLang('en')}
            className={`px-2.5 py-1 rounded-full font-medium transition-all cursor-pointer ${
              lang === 'en'
                ? 'bg-[#B9D895] text-[#222936] font-bold shadow-xs'
                : 'text-[#E0F6C4]/70 hover:text-white'
            }`}
            title="English"
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => setLang('ar')}
            className={`px-2.5 py-1 rounded-full font-medium transition-all cursor-pointer ${
              lang === 'ar'
                ? 'bg-[#B9D895] text-[#222936] font-bold shadow-xs'
                : 'text-[#E0F6C4]/70 hover:text-white'
            }`}
            title="العربية"
          >
            عربي
          </button>
        </div>

        {/* Discreet Dashboard Portal Link */}
        <Link
          to="/admin"
          className="p-2 rounded-full text-[#E0F6C4]/50 hover:text-[#B9D895] hover:bg-[#374159]/40 transition-colors"
          title={t(lang, 'nav.adminLabel')}
          aria-label="Admin Dashboard"
        >
          <Shield className="w-4 h-4" />
        </Link>

        {/* Contact Us button */}
        <button
          onClick={onOpenContact}
          className="bg-[#B9D895] hover:bg-[#a6ca7f] text-[#222936] font-semibold text-xs md:text-sm px-5 py-2 rounded-full transition-transform active:scale-95 shadow-sm cursor-pointer"
        >
          {t(lang, 'nav.contactBtn')}
        </button>

        {/* Mobile menu hamburger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-[#E0F6C4] hover:text-white p-1"
          aria-label="Toggle Navigation Menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 w-full bg-[#222936] border-b border-[#374159] p-6 flex flex-col gap-4 shadow-xl z-50">
          {/* Mobile Language Switcher */}
          <div className="flex items-center justify-between pb-3 border-b border-[#374159]/40">
            <span className="text-xs text-[#E0F6C4]/70 font-medium">
              {lang === 'ar' ? 'اختر اللغة' : 'Select Language'}
            </span>
            <div className="flex items-center bg-[#374159]/50 border border-[#374159] rounded-full p-1 text-xs">
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`px-3 py-1 rounded-full font-medium ${
                  lang === 'en' ? 'bg-[#B9D895] text-[#222936] font-bold' : 'text-[#E0F6C4]/70'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLang('ar')}
                className={`px-3 py-1 rounded-full font-medium ${
                  lang === 'ar' ? 'bg-[#B9D895] text-[#222936] font-bold' : 'text-[#E0F6C4]/70'
                }`}
              >
                العربية
              </button>
            </div>
          </div>

          {navLinks.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className="text-start text-base font-medium text-[#E0F6C4] hover:text-[#B9D895] py-2 border-b border-[#374159]/30"
            >
              {item.label}
            </button>
          ))}
          <Link
            to="/admin"
            onClick={() => setMobileMenuOpen(false)}
            className="text-start text-sm font-semibold text-[#B9D895] pt-2 flex items-center gap-2"
          >
            <Shield className="w-4 h-4" />
            <span>{t(lang, 'nav.openAdmin')}</span>
          </Link>
        </div>
      )}
    </nav>
  )
}
