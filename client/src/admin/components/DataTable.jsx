import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useLang } from '../../i18n/LanguageContext'

export default function DataTable({
  columns = [],
  rows = [],
  loading = false,
  selectable = false,
  selectedIds = [],
  onToggleSelect,
  onToggleAll,
  page = 1,
  totalPages = 1,
  onPageChange,
  emptyState
}) {
  const { isRTL } = useLang()

  if (loading) {
    return (
      <div className="rounded-2xl bg-white border border-gray-200 p-4 space-y-3 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-10 bg-gray-100 rounded-xl w-full" />
        ))}
      </div>
    )
  }

  if (!rows.length && emptyState) {
    return emptyState
  }

  const allSelected = rows.length > 0 && rows.every((r) => selectedIds.includes(r._id || r.id))

  return (
    <div className="rounded-2xl bg-white border border-gray-200/80 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs sm:text-sm text-start">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
            <tr>
              {selectable && (
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={(e) => onToggleAll?.(e.target.checked)}
                    className="rounded border-gray-300 cursor-pointer"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th key={col.key} className={`px-4 py-3 font-semibold text-start whitespace-nowrap ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((row) => {
              const id = row._id || row.id
              return (
                <tr key={id} className="hover:bg-gray-50/80 transition-colors">
                  {selectable && (
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(id)}
                        onChange={() => onToggleSelect?.(id)}
                        className="rounded border-gray-300 cursor-pointer"
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col.key} className={`px-4 py-3 align-middle ${col.cellClassName || ''}`}>
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && onPageChange && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-xs text-gray-500">
          <span>{page} / {totalPages}</span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 cursor-pointer"
            >
              {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 cursor-pointer"
            >
              {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
