import React, { lazy, Suspense } from 'react'
import {
  Eye,
  Calendar,
  TrendingUp,
  Users,
  MousePointerClick,
  FileDown,
  HardDriveDownload,
  MailWarning
} from 'lucide-react'
import StatCard from '../components/StatCard'
import StatusBadge from '../components/StatusBadge'
import { useLang } from '../../i18n/LanguageContext'
import { t } from '../../i18n/translations'

const TrafficChart = lazy(() => import('../components/TrafficChart'))

export default function Overview({ analytics, projects = [], articles = [], assets = [], messages = [], loading }) {
  const { lang } = useLang()

  const unreadFallback = messages.filter((m) => !m.isRead).length
  const fileDlFallback = assets.reduce((sum, a) => sum + (a.downloads || 0), 0)

  const kpis = [
    { label: t(lang, 'adminP5.visitsToday'), value: analytics?.visitsToday ?? 0, icon: Eye },
    { label: t(lang, 'adminP5.visits7d'), value: analytics?.visits7d ?? analytics?.totalPageViews ?? 0, icon: Calendar },
    { label: t(lang, 'adminP5.visits30d'), value: analytics?.visits30d ?? analytics?.totalPageViews ?? 0, icon: TrendingUp },
    { label: t(lang, 'adminP5.uniqueVisitors'), value: analytics?.uniqueVisitors ?? 0, icon: Users },
    { label: t(lang, 'adminP5.projectClicks'), value: analytics?.projectClicks ?? 0, icon: MousePointerClick },
    { label: t(lang, 'adminP5.cvDownloads'), value: analytics?.cvDownloads ?? 0, icon: FileDown },
    { label: t(lang, 'adminP5.fileDownloads'), value: analytics?.fileDownloads ?? fileDlFallback, icon: HardDriveDownload },
    { label: t(lang, 'adminP5.unreadMessages'), value: analytics?.unreadMessages ?? unreadFallback, icon: MailWarning },
  ]

  const topProjects = analytics?.topProjects?.length
    ? analytics.topProjects
    : [...projects].sort((a, b) => (b.clicks || 0) - (a.clicks || 0)).slice(0, 5)

  const topArticles = analytics?.topArticles?.length
    ? analytics.topArticles
    : [...articles].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5)

  const topFiles = analytics?.topFiles?.length
    ? analytics.topFiles
    : [...assets].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5)

  const chartData = analytics?.daily30Visits || analytics?.dailyVisits || []

  return (
    <div className="space-y-6">
      {/* 8 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <StatCard key={k.label} label={k.label} value={k.value} icon={k.icon} loading={loading} />
        ))}
      </div>

      {/* 30-Day Line Chart (Lazy-Loaded Recharts) */}
      <div className="rounded-2xl bg-white border border-gray-200/80 p-5 shadow-xs">
        <h2 className="text-sm font-bold text-[#222936] mb-4">
          {t(lang, 'adminP5.traffic30d')}
        </h2>
        <Suspense fallback={<div className="h-64 bg-gray-100 rounded-xl animate-pulse" />}>
          <TrafficChart data={chartData} />
        </Suspense>
      </div>

      {/* Top Content Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <TopListCard title={t(lang, 'adminP5.topProjects')} items={topProjects} metricKey="clicks" />
        <TopListCard title={t(lang, 'adminP5.topArticles')} items={topArticles} metricKey="views" />
        <TopListCard title={t(lang, 'adminP5.topFiles')} items={topFiles} metricKey="views" />
      </div>
    </div>
  )
}

function TopListCard({ title, items = [], metricKey }) {
  return (
    <div className="rounded-2xl bg-white border border-gray-200/80 p-5 shadow-xs space-y-3">
      <h3 className="text-sm font-bold text-[#222936]">{title}</h3>
      {items.length === 0 ? (
        <p className="text-xs text-gray-400 py-4 text-center">—</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {items.map((item) => (
            <li key={item._id || item.slug || item.title} className="py-2.5 flex items-center justify-between gap-2 text-xs">
              <span className="font-medium text-[#222936] truncate flex-1" dir="auto">{item.title}</span>
              <div className="flex items-center gap-2 shrink-0">
                <StatusBadge status={item.status || 'public'} />
                <span className="font-bold text-[#374159]">{item[metricKey] ?? 0}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
