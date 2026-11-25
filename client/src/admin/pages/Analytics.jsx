import React, { lazy, Suspense } from 'react'
import { BarChart3, Users, MousePointerClick, FileDown } from 'lucide-react'
import StatCard from '../components/StatCard'
import { useLang } from '../../i18n/LanguageContext'
import { t } from '../../i18n/translations'

const TrafficChart = lazy(() => import('../components/TrafficChart'))

export default function Analytics({ analytics, loading }) {
  const { lang } = useLang()
  const chartData = analytics?.daily30Visits || analytics?.dailyVisits || []

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label={t(lang, 'adminP5.visits30d')} value={analytics?.visits30d ?? analytics?.totalPageViews ?? 0} icon={BarChart3} loading={loading} />
        <StatCard label={t(lang, 'adminP5.uniqueVisitors')} value={analytics?.uniqueVisitors ?? 0} icon={Users} loading={loading} />
        <StatCard label={t(lang, 'adminP5.projectClicks')} value={analytics?.projectClicks ?? 0} icon={MousePointerClick} loading={loading} />
        <StatCard label={t(lang, 'adminP5.cvDownloads')} value={analytics?.cvDownloads ?? 0} icon={FileDown} loading={loading} />
      </div>

      <div className="rounded-2xl bg-white border border-gray-200/80 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#222936]">{t(lang, 'adminP5.traffic30d')}</h2>
          <span className="text-xs font-semibold text-gray-500">
            Engagement: {analytics?.engagementRate || '0.00%'}
          </span>
        </div>
        <Suspense fallback={<div className="h-64 bg-gray-100 rounded-xl animate-pulse" />}>
          <TrafficChart data={chartData} />
        </Suspense>
      </div>
    </div>
  )
}
