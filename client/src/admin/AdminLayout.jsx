import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  LayoutDashboard,
  Layers,
  FileText,
  FolderOpen,
  Mail,
  BarChart3,
  Settings,
  ExternalLink,
  LogOut,
  Menu,
  X,
  Globe,
  Sparkles
} from 'lucide-react'
import { useLang } from '../i18n/LanguageContext'
import { t } from '../i18n/translations'

export default function AdminLayout({
  activeTab,
  onSelectTab,
  unreadCount = 0,
  profile,
  onLogout,
  children
}) {
  const { lang, setLang, isRTL } = useLang()
  const [mobileOpen, setMobileOpen] = useState(false)

  const navItems = [
    { id: 'overview', label: t(lang, 'adminP5.overview'), icon: LayoutDashboard },
    { id: 'projects', label: t(lang, 'adminP5.projects'), icon: Layers },
    { id: 'articles', label: t(lang, 'adminP5.articles'), icon: FileText },
    { id: 'files', label: t(lang, 'adminP5.files'), icon: FolderOpen },
    { id: 'messages', label: t(lang, 'adminP5.messages'), icon: Mail, badge: unreadCount },
    { id: 'analytics', label: t(lang, 'adminP5.analytics'), icon: BarChart3 },
    { id: 'settings', label: t(lang, 'adminP5.settings'), icon: Settings },
  ]

  const currentItem = navItems.find((i) => i.id === activeTab) || navItems[0]

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen bg-[#F5F7FA] text-[#222936] flex">
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Dark Ink/Slate Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 z-40 h-screen w-64 shrink-0 bg-[#222936] text-[#E0F6C4] border-e border-[#374159] flex flex-col justify-between transition-transform duration-200 ${
          mobileOpen
            ? 'translate-x-0'
            : (isRTL ? 'translate-x-full lg:translate-x-0' : '-translate-x-full lg:translate-x-0')
        }`}
      >
        <div className="overflow-y-auto">
          {/* Brand Header */}
          <div className="px-5 py-5 border-b border-[#374159]/60 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#374159] border border-[#B9D895]/30 text-[#B9D895] flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-extrabold text-white truncate">
                  {isRTL ? 'لوحة الإدارة' : 'Portfolio OS'}
                </p>
                <p className="text-[11px] text-[#B9D895]/80 truncate">
                  {profile?.shortName || 'Mohamed'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-[#E0F6C4]/70 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Nav Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = activeTab === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelectTab(item.id)
                    setMobileOpen(false)
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#B9D895] text-[#222936] font-bold shadow-xs'
                      : 'text-[#E0F6C4]/75 hover:bg-[#374159]/60 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="flex-1 text-start truncate">{item.label}</span>
                  {item.badge > 0 && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        active ? 'bg-[#222936] text-[#B9D895]' : 'bg-[#374159] text-[#B9D895]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-[#374159]/60 space-y-1.5">
          <Link
            to="/"
            target="_blank"
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-[#E0F6C4]/75 hover:bg-[#374159]/60 hover:text-white transition-colors"
          >
            <ExternalLink className="w-4 h-4 shrink-0" />
            <span>{t(lang, 'adminP5.liveSite')}</span>
          </Link>

          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-red-300 hover:bg-red-900/30 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>{t(lang, 'adminAuth.logoutBtn')}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-gray-200 px-4 sm:px-8 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Menu"
              className="lg:hidden p-2 rounded-xl border border-gray-200 text-[#222936] hover:bg-gray-50 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg sm:text-xl font-extrabold text-[#222936] truncate">
              {currentItem.label}
            </h1>
          </div>

          <div className="flex items-center gap-2 bg-gray-100 rounded-full p-1 text-xs shrink-0">
            <Globe className="w-3.5 h-3.5 text-[#374159] mx-1 hidden sm:block" />
            <button
              type="button"
              onClick={() => setLang('en')}
              className={`px-2.5 py-1 rounded-full font-semibold cursor-pointer ${
                lang === 'en' ? 'bg-[#222936] text-[#B9D895]' : 'text-gray-600'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLang('ar')}
              className={`px-2.5 py-1 rounded-full font-semibold cursor-pointer ${
                lang === 'ar' ? 'bg-[#222936] text-[#B9D895]' : 'text-gray-600'
              }`}
            >
              عربي
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
