import React from 'react'

export default function StatCard({ label, value, icon: Icon, hint, loading = false }) {
  if (loading) {
    return (
      <div className="rounded-2xl bg-white border border-gray-200/80 p-5 animate-pulse space-y-3">
        <div className="h-3.5 bg-gray-200 rounded w-1/2" />
        <div className="h-7 bg-gray-200 rounded w-1/3" />
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-white border border-gray-200/80 p-5 shadow-xs hover:shadow-md transition-shadow flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs font-semibold text-gray-500 truncate">{label}</p>
        <p className="text-2xl font-black text-[#222936] mt-1.5 tracking-tight">
          {value ?? 0}
        </p>
        {hint && <p className="text-[11px] text-gray-400 mt-1 truncate">{hint}</p>}
      </div>
      {Icon && (
        <div className="w-10 h-10 rounded-xl bg-[#222936] text-[#B9D895] flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5" />
        </div>
      )}
    </div>
  )
}
