import React, { useState, useEffect, lazy, Suspense } from 'react'
import { Routes, Route, useLocation, Link } from 'react-router-dom'
import HomePage from './pages/HomePage'
import ProjectDetailPage from './pages/ProjectDetailPage'
import ArticleDetailPage from './pages/ArticleDetailPage'
import AdminLoginPage from './pages/AdminLoginPage'
import FloatingActionMenu from './components/FloatingActionMenu'
import ContactModal from './components/ContactModal'
import { useLang } from './i18n/LanguageContext'
import { t } from './i18n/translations'
import {
  fetchProfile,
  fetchProjects,
  fetchArticles,
  fallbackProfile,
  fallbackProjects,
  fallbackArticles,
  trackEvent,
  fetchAdminSession,
  adminLogout
} from './services/api'

// Lazy-load admin dashboard so public visitors never download its bundle
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))

// Secret admin path from env (must start with /); if missing, do not register route
const rawAdminPath = import.meta.env.VITE_ADMIN_PATH
const ADMIN_PATH = rawAdminPath && rawAdminPath.startsWith('/') ? rawAdminPath : null

function NotFoundPage() {
  const { lang, isRTL } = useLang()
  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="min-h-screen bg-[#222936] flex items-center justify-center text-center px-6"
    >
      <div className="max-w-md space-y-4">
        <h1 className="text-7xl font-black font-serif text-[#B9D895]">404</h1>
        <h2 className="text-2xl font-bold text-white">{t(lang, 'adminAuth.notFoundTitle')}</h2>
        <p className="text-sm text-[#E0F6C4]/70">{t(lang, 'adminAuth.notFoundDesc')}</p>
        <div className="pt-2">
          <Link
            to="/"
            className="inline-block px-6 py-2.5 rounded-full bg-[#B9D895] hover:bg-[#a6ca7f] text-[#222936] font-bold text-sm transition-colors"
          >
            {t(lang, 'adminAuth.backHome')}
          </Link>
        </div>
      </div>
    </div>
  )
}

function AdminGate({ session, onLoginSuccess, onLogout }) {
  if (session.loading) {
    return (
      <div className="min-h-screen bg-[#222936] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#B9D895] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!session.authenticated) {
    return (
      <AdminLoginPage
        requiresExtraSecret={session.requiresExtraSecret}
        onSuccess={onLoginSuccess}
      />
    )
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#222936] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#B9D895] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <AdminDashboard onLogout={onLogout} />
    </Suspense>
  )
}

export default function App() {
  const { lang } = useLang()
  const [profile, setProfile] = useState(fallbackProfile)
  const [projects, setProjects] = useState(fallbackProjects)
  const [articles, setArticles] = useState(fallbackArticles)
  const [isContactOpen, setIsContactOpen] = useState(false)
  const [adminSession, setAdminSession] = useState({
    loading: true,
    authenticated: false,
    requiresExtraSecret: false
  })
  const location = useLocation()

  const isAdminRoute = Boolean(ADMIN_PATH && location.pathname.startsWith(ADMIN_PATH))

  const refreshAdminSession = async () => {
    const data = await fetchAdminSession()
    setAdminSession({
      loading: false,
      authenticated: Boolean(data.authenticated),
      requiresExtraSecret: Boolean(data.requiresExtraSecret)
    })
  }

  useEffect(() => {
    refreshAdminSession()

    const handleUnauthorized = () => {
      setAdminSession((prev) => ({ ...prev, loading: false, authenticated: false }))
    }
    window.addEventListener('admin:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('admin:unauthorized', handleUnauthorized)
  }, [])

  const handleLogout = async () => {
    try {
      await adminLogout()
    } finally {
      setAdminSession((prev) => ({ ...prev, authenticated: false }))
    }
  }

  // Real-time Analytics: track page views on public route change
  useEffect(() => {
    if (!isAdminRoute) {
      trackEvent('page_view', location.pathname)
    }
  }, [location.pathname, isAdminRoute])

  useEffect(() => {
    async function initData() {
      try {
        const [profData, projData, artData] = await Promise.all([
          fetchProfile(),
          fetchProjects(),
          fetchArticles()
        ])
        if (profData) setProfile(profData)
        if (projData && projData.length > 0) setProjects(projData)
        if (artData && artData.length > 0) setArticles(artData)
      } catch (err) {
        console.warn("Failed to load initial data, using fallbacks:", err)
      }
    }
    initData()
  }, [])

  return (
    <div className="relative min-h-screen">
      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              profile={profile}
              projects={projects}
              articles={articles}
              onOpenContact={() => setIsContactOpen(true)}
            />
          }
        />
        <Route
          path="/projects/:slug"
          element={
            <ProjectDetailPage
              profile={profile}
              onOpenContact={() => setIsContactOpen(true)}
            />
          }
        />
        <Route
          path="/articles/:slug"
          element={
            <ArticleDetailPage
              profile={profile}
              onOpenContact={() => setIsContactOpen(true)}
            />
          }
        />

        {/* Secret admin route — only registered when VITE_ADMIN_PATH is configured */}
        {ADMIN_PATH && (
          <Route
            path={`${ADMIN_PATH}/*`}
            element={
              <AdminGate
                session={adminSession}
                onLoginSuccess={refreshAdminSession}
                onLogout={handleLogout}
              />
            }
          />
        )}

        {/* /admin always renders normal 404 */}
        <Route path="/admin" element={<NotFoundPage />} />
        <Route path="/admin/*" element={<NotFoundPage />} />

        {/* Catch-all 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      {/* Floating Admin Pill — visible ONLY for authenticated admin sessions on public pages */}
      {!isAdminRoute && ADMIN_PATH && adminSession.authenticated && (
        <Link
          to={ADMIN_PATH}
          className="fixed bottom-6 start-6 z-50 px-4 py-2 rounded-full bg-[#222936] text-[#B9D895] border border-[#B9D895]/40 shadow-xl text-xs font-bold hover:bg-[#374159] transition-colors"
        >
          {t(lang, 'adminAuth.floatingPill')}
        </Link>
      )}

      {/* Floating Action Menu (3D) - Appears on public pages */}
      {!isAdminRoute && (
        <FloatingActionMenu
          profile={profile}
          onOpenContact={() => setIsContactOpen(true)}
        />
      )}

      {/* Contact Modal */}
      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />
    </div>
  )
}
