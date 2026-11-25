import React, { useState, useMemo } from 'react'
import { Mail, MailOpen, Star, Trash2, Search, CheckCheck } from 'lucide-react'
import DataTable from '../components/DataTable'
import ConfirmDialog from '../components/ConfirmDialog'
import EmptyState from '../components/EmptyState'
import { useToast } from '../components/Toast'
import { deleteMessage, markMessageRead, starMessage } from '../../services/api'
import { useLang } from '../../i18n/LanguageContext'
import { t } from '../../i18n/translations'
import { formatCompactDateTime } from '../../utils/date'

const PAGE_SIZE = 10

export default function Messages({ messages = [], setMessages, loading }) {
  const { lang, isRTL } = useLang()
  const { addToast } = useToast()

  const [filter, setFilter] = useState('all') // all | unread | starred
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState([])
  const [page, setPage] = useState(1)
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false)
  const [confirmSingle, setConfirmSingle] = useState(null)

  const filtered = useMemo(() => {
    let list = messages
    if (filter === 'unread') list = list.filter((m) => !m.isRead)
    if (filter === 'starred') list = list.filter((m) => m.isStarred)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(
        (m) =>
          (m.name || '').toLowerCase().includes(q) ||
          (m.email || '').toLowerCase().includes(q) ||
          (m.message || '').toLowerCase().includes(q)
      )
    }
    return list
  }, [messages, filter, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pagedRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const toggleRead = async (msg) => {
    const nextRead = !msg.isRead
    const prev = [...messages]
    setMessages(messages.map((m) => (m._id === msg._id ? { ...m, isRead: nextRead } : m)))
    const res = await markMessageRead(msg._id, nextRead)
    if (!res) {
      setMessages(prev)
      addToast(isRTL ? 'تعذر تحديث الحالة' : 'Failed to update status', 'error')
    }
  }

  const toggleStar = async (msg) => {
    const nextStar = !msg.isStarred
    const prev = [...messages]
    setMessages(messages.map((m) => (m._id === msg._id ? { ...m, isStarred: nextStar } : m)))
    const res = await starMessage(msg._id, nextStar)
    if (!res) {
      setMessages(prev)
      addToast(isRTL ? 'تعذر التحديث' : 'Failed to update', 'error')
    }
  }

  const handleBulkMarkRead = async () => {
    if (!selectedIds.length) return
    const prev = [...messages]
    setMessages(messages.map((m) => (selectedIds.includes(m._id) ? { ...m, isRead: true } : m)))
    try {
      await Promise.all(selectedIds.map((id) => markMessageRead(id, true)))
      setSelectedIds([])
      addToast(isRTL ? 'تم تحديد الرسائل كمقروءة' : 'Marked selected as read')
    } catch {
      setMessages(prev)
      addToast('Bulk update failed', 'error')
    }
  }

  const handleBulkDelete = async () => {
    setConfirmBulkDelete(false)
    const ids = [...selectedIds]
    const prev = [...messages]
    setMessages(messages.filter((m) => !ids.includes(m._id)))
    setSelectedIds([])
    try {
      await Promise.all(ids.map((id) => deleteMessage(id)))
      addToast(isRTL ? 'تم حذف الرسائل المحددة' : 'Selected messages deleted')
    } catch (err) {
      setMessages(prev)
      addToast(err.message, 'error')
    }
  }

  const handleSingleDelete = async () => {
    if (!confirmSingle) return
    const target = confirmSingle
    setConfirmSingle(null)
    const prev = [...messages]
    setMessages(messages.filter((m) => m._id !== target._id))
    try {
      await deleteMessage(target._id)
      addToast(isRTL ? 'تم حذف الرسالة' : 'Message deleted')
    } catch (err) {
      setMessages(prev)
      addToast(err.message, 'error')
    }
  }

  const columns = [
    {
      key: 'sender',
      header: isRTL ? 'المرسل' : 'Sender',
      render: (row) => (
        <div className="min-w-0">
          <p className={`text-xs sm:text-sm truncate ${row.isRead ? 'text-gray-700' : 'font-bold text-[#222936]'}`}>
            {row.name}
          </p>
          <p className="text-[11px] text-gray-400 truncate" dir="ltr">{row.email}</p>
        </div>
      )
    },
    {
      key: 'message',
      header: isRTL ? 'الرسالة' : 'Message',
      render: (row) => (
        <p className="text-xs text-gray-600 line-clamp-2 max-w-md" dir="auto">{row.message}</p>
      )
    },
    {
      key: 'date',
      header: isRTL ? 'التاريخ' : 'Date',
      render: (row) => <span className="text-[11px] text-gray-400 whitespace-nowrap">{formatCompactDateTime(row.createdAt, lang)}</span>
    },
    {
      key: 'actions',
      header: isRTL ? 'إجراءات' : 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <button type="button" onClick={() => toggleRead(row)} className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 cursor-pointer" title="Read/Unread">
            {row.isRead ? <MailOpen className="w-3.5 h-3.5 text-gray-500" /> : <Mail className="w-3.5 h-3.5 text-[#222936]" />}
          </button>
          <button type="button" onClick={() => toggleStar(row)} className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 cursor-pointer" title="Star">
            <Star className={`w-3.5 h-3.5 ${row.isStarred ? 'fill-amber-400 text-amber-500' : 'text-gray-400'}`} />
          </button>
          <button type="button" onClick={() => setConfirmSingle(row)} className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 cursor-pointer" title="Delete">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-gray-200 text-xs">
          {['all', 'unread', 'starred'].map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => { setFilter(key); setPage(1) }}
              className={`px-3 py-1.5 rounded-lg font-semibold cursor-pointer ${
                filter === key ? 'bg-[#222936] text-[#B9D895]' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {key === 'all' && t(lang, 'adminP5.filterAll')}
              {key === 'unread' && t(lang, 'adminP5.filterUnread')}
              {key === 'starred' && t(lang, 'adminP5.filterStarred')}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute top-1/2 -translate-y-1/2 start-3" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              placeholder={t(lang, 'adminP5.searchPlaceholder')}
              className="ps-8 pe-3 py-2 rounded-xl border border-gray-200 bg-white text-xs outline-none focus:border-[#222936]"
            />
          </div>

          {selectedIds.length > 0 && (
            <>
              <button
                type="button"
                onClick={handleBulkMarkRead}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#222936] text-[#B9D895] text-xs font-bold cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>{t(lang, 'adminP5.bulkMarkRead')} ({selectedIds.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setConfirmBulkDelete(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-600 text-white text-xs font-bold cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t(lang, 'adminP5.bulkDelete')}</span>
              </button>
            </>
          )}
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={pagedRows}
        loading={loading}
        selectable
        selectedIds={selectedIds}
        onToggleSelect={(id) =>
          setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
        }
        onToggleAll={(checked) => setSelectedIds(checked ? pagedRows.map((r) => r._id) : [])}
        page={safePage}
        totalPages={totalPages}
        onPageChange={setPage}
        emptyState={<EmptyState title={isRTL ? 'لا توجد رسائل' : 'No messages found'} />}
      />

      <ConfirmDialog
        open={confirmBulkDelete}
        title={t(lang, 'adminP5.bulkDelete')}
        message={isRTL ? `حذف ${selectedIds.length} رسالة؟` : `Delete ${selectedIds.length} selected messages?`}
        onConfirm={handleBulkDelete}
        onCancel={() => setConfirmBulkDelete(false)}
      />

      <ConfirmDialog
        open={Boolean(confirmSingle)}
        title={isRTL ? 'حذف الرسالة' : 'Delete Message'}
        message={isRTL ? `حذف رسالة "${confirmSingle?.name}"؟` : `Delete message from "${confirmSingle?.name}"?`}
        onConfirm={handleSingleDelete}
        onCancel={() => setConfirmSingle(null)}
      />
    </div>
  )
}
