import React, { useState, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import HomePage from './pages/HomePage'
import ProjectDetailPage from './pages/ProjectDetailPage'
import ArticleDetailPage from './pages/ArticleDetailPage'
import AdminDashboard from './pages/AdminDashboard'
import FloatingActionMenu from './components/FloatingActionMenu'
import ContactModal from './components/ContactModal'
import { 
  fetchProfile, 
  fetchProjects, 
  fetchArticles, 
  fallbackProfile, 
  fallbackProjects, 
  fallbackArticles,
  trackEvent
} from './services/api'

export default function App() {
  const [profile, setProfile] = useState(fallbackProfile)
  const [projects, setProjects] = useState(fallbackProjects)
  const [articles, setArticles] = useState(fallbackArticles)
  const [isContactOpen, setIsContactOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const location = useLocation()

  // Hide floating action menu on admin dashboard for clean dashboard experience
  const isAdminRoute = location.pathname.startsWith('/admin')

  // Real-time Analytics: track page views on route change
  useEffect(() => {
    trackEvent('page_view', location.pathname)
  }, [location.pathname])

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
      } finally {
        setLoading(false)
      }
    }
    initData()
  }, [])

  return (
    <div className="relative min-h-screen">
      {/* Routes */}
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
        <Route 
          path="/admin" 
          element={<AdminDashboard />} 
        />
      </Routes>

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
