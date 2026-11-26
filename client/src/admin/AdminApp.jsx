import React, { useState, useEffect, useCallback } from 'react'
import AdminLayout from './AdminLayout'
import { ToastProvider } from './components/Toast'
import Overview from './pages/Overview'
import Projects from './pages/Projects'
import Articles from './pages/Articles'
import Files from './pages/Files'
import Messages from './pages/Messages'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
import {
  fetchProjects,
  fetchArticles,
  fetchMessages,
  fetchProfile,
  fetchAnalytics,
  fetchAdminAssets
} from '../services/api'

export default function AdminApp({ onLogout }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [projects, setProjects] = useState([])
  const [articles, setArticles] = useState([])
  const [messages, setMessages] = useState([])
  const [assets, setAssets] = useState([])
  const [profile, setProfile] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let meta = document.querySelector('meta[name="robots"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = 'robots'
      document.head.appendChild(meta)
    }
    meta.content = 'noindex,nofollow'
    return () => meta?.remove()
  }, [])

  const loadAll = useCallback(async () => {
    setLoading(true)
    try {
      const [projList, artList, msgList, profData, analyticsData, assetRes] = await Promise.all([
        fetchProjects('All', { all: true }),
        fetchArticles('All', { all: true }),
        fetchMessages(),
        fetchProfile(),
        fetchAnalytics(),
        fetchAdminAssets({ page: 1, limit: 50 }).catch(() => ({ data: [] }))
      ])
      setProjects(projList || [])
      setArticles(artList || [])
      setMessages(msgList || [])
      setProfile(profData || null)
      setAnalytics(analyticsData || null)
      setAssets(assetRes?.data || [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  const unreadCount = messages.filter((m) => !m.isRead).length

  return (
    <ToastProvider>
      <AdminLayout
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        unreadCount={unreadCount}
        profile={profile}
        onLogout={onLogout}
      >
        {activeTab === 'overview' && (
          <Overview
            analytics={analytics}
            projects={projects}
            articles={articles}
            assets={assets}
            messages={messages}
            loading={loading}
          />
        )}
        {activeTab === 'projects' && (
          <Projects
            projects={projects}
            setProjects={setProjects}
            assets={assets}
            setAssets={setAssets}
            loading={loading}
            onRefresh={loadAll}
          />
        )}
        {activeTab === 'articles' && (
          <Articles
            articles={articles}
            setArticles={setArticles}
            assets={assets}
            setAssets={setAssets}
            loading={loading}
            onRefresh={loadAll}
          />
        )}
        {activeTab === 'files' && <Files onAssetsChange={setAssets} />}
        {activeTab === 'messages' && (
          <Messages messages={messages} setMessages={setMessages} loading={loading} />
        )}
        {activeTab === 'analytics' && <Analytics analytics={analytics} loading={loading} />}
        {activeTab === 'settings' && (
          <Settings profile={profile} onSaved={loadAll} onLogout={onLogout} />
        )}
      </AdminLayout>
    </ToastProvider>
  )
}
