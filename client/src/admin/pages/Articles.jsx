import React, { useState, useEffect, useCallback } from 'react'
import { Plus, Edit3, Trash2, Save, X, Upload, CheckCircle2, AlertCircle } from 'lucide-react'
import DataTable from '../components/DataTable'
import StatusBadge from '../components/StatusBadge'
import ConfirmDialog from '../components/ConfirmDialog'
import EmptyState from '../components/EmptyState'
import FormField from '../components/FormField'
import MarkdownEditor from '../components/MarkdownEditor'
import { useToast } from '../components/Toast'
import { createArticle, updateArticle, deleteArticle, uploadBlobDirect } from '../../services/api'
import { useLang } from '../../i18n/LanguageContext'
import { t } from '../../i18n/translations'

const toSlug = (val = '') =>
  String(val)
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')

const EMPTY_ARTICLE = {
  title: '',
  slug: '',
  category: 'Data Analysis',
  excerpt: '',
  content: '',
  coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
  status: 'public',
  publishedAt: '',
  attachments: []
}

export default function Articles({ articles = [], setArticles, assets = [], loading, onRefresh }) {
  const { lang, isRTL } = useLang()
  const { addToast } = useToast()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_ARTICLE)
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const slugTaken = Boolean(
    form.slug &&
    articles.some((a) => a.slug === form.slug && a._id !== editing?._id)
  )

  const updateForm = (patch) => {
    setForm((prev) => ({ ...prev, ...patch }))
    setDirty(true)
  }

  // Warn before leaving browser tab with unsaved changes
  useEffect(() => {
    if (!formOpen || !dirty) return
    const handleUnload = (e) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handleUnload)
    return () => window.removeEventListener('beforeunload', handleUnload)
  }, [formOpen, dirty])

  // Autosave draft to server every 30s when editing or dirty with title & content
  useEffect(() => {
    if (!formOpen || !dirty || !form.title.trim() || !form.content.trim()) return
    const timer = setTimeout(async () => {
      try {
        if (editing?._id) {
          await updateArticle(editing._id, {
            ...form,
            slug: form.slug || toSlug(form.title),
            published: form.status === 'public'
          })
          setDirty(false)
          addToast(t(lang, 'adminP5.autosaved'), 'info', 2000)
        } else {
          const created = await createArticle({
            ...form,
            slug: form.slug || toSlug(form.title),
            status: 'draft',
            published: false
          })
          if (created?._id) {
            setEditing(created)
            setDirty(false)
            addToast(t(lang, 'adminP5.autosaved'), 'info', 2000)
          }
        }
      } catch {}
    }, 30000)
    return () => clearTimeout(timer)
  }, [formOpen, dirty, form, editing, addToast, lang])

  const openNew = () => {
    setEditing(null)
    setForm(EMPTY_ARTICLE)
    setDirty(false)
    setFormOpen(true)
  }

  const openEdit = (a) => {
    setEditing(a)
    setForm({
      title: a.title || '',
      slug: a.slug || '',
      category: a.category || 'Data Analysis',
      excerpt: a.excerpt || '',
      content: a.content || '',
      coverImage: a.coverImage || '',
      status: a.status || (a.published === false ? 'private' : 'public'),
      publishedAt: a.publishedAt ? String(a.publishedAt).slice(0, 16) : '',
      attachments: (a.attachments || []).map((att) => (typeof att === 'object' ? att._id : att))
    })
    setDirty(false)
    setFormOpen(true)
  }

  const handleSave = useCallback(async (e) => {
    e?.preventDefault()
    if (!form.title.trim() || !form.content.trim()) {
      addToast(isRTL ? 'العنوان والمحتوى مطلوبان' : 'Title and content are required', 'error')
      return
    }
    setSaving(true)
    const isPrivate = form.status !== 'public'
    const payload = {
      ...form,
      slug: form.slug || toSlug(form.title),
      published: !isPrivate,
      publishedAt: form.publishedAt || null
    }
    try {
      if (editing) {
        await updateArticle(editing._id || editing.slug, payload)
        addToast(isRTL ? 'تم تحديث المقال' : 'Article updated')
      } else {
        await createArticle(payload)
        addToast(isRTL ? 'تم حفظ المقال' : 'Article saved')
      }
      setDirty(false)
      setFormOpen(false)
      onRefresh?.()
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }, [form, editing, addToast, isRTL, onRefresh])

  useEffect(() => {
    if (!formOpen) return
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault()
        handleSave()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [formOpen, handleSave])

  const handleDelete = async () => {
    if (!confirmDelete) return
    const target = confirmDelete
    setConfirmDelete(null)
    const prev = [...articles]
    setArticles(articles.filter((a) => a._id !== target._id))
    try {
      await deleteArticle(target._id || target.slug)
      addToast(isRTL ? 'تم حذف المقال' : 'Article deleted')
    } catch (err) {
      setArticles(prev)
      addToast(err.message, 'error')
    }
  }

  const columns = [
    {
      key: 'title',
      header: isRTL ? 'المقال' : 'Article',
      render: (r) => (
        <div className="min-w-0">
          <p className="font-bold text-[#222936] truncate max-w-[260px]" dir="auto">{r.title}</p>
          <p className="text-[11px] text-gray-400">{r.category}</p>
        </div>
      )
    },
    { key: 'status', header: isRTL ? 'الحالة' : 'Status', render: (r) => <StatusBadge status={r.status || (r.published === false ? 'private' : 'public')} /> },
    { key: 'views', header: isRTL ? 'المشاهدات' : 'Views', render: (r) => <span className="text-xs font-semibold">{r.views || 0}</span> },
    {
      key: 'actions',
      header: isRTL ? 'إجراءات' : 'Actions',
      render: (r) => (
        <div className="flex items-center gap-1.5">
          <button type="button" onClick={() => openEdit(r)} className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 cursor-pointer">
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button type="button" onClick={() => setConfirmDelete(r)} className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 cursor-pointer">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button type="button" onClick={openNew} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#222936] text-[#B9D895] text-xs font-bold cursor-pointer">
          <Plus className="w-4 h-4" />
          <span>{isRTL ? 'مقال جديد' : 'New Article'}</span>
        </button>
      </div>

      {formOpen && (
        <form onSubmit={handleSave} className="rounded-2xl bg-white border border-gray-200 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h2 className="text-sm font-bold text-[#222936]">
              {editing ? (isRTL ? 'تعديل المقال' : 'Edit Article') : (isRTL ? 'مقال جديد' : 'New Article')}
            </h2>
            <button
              type="button"
              onClick={() => {
                if (!dirty || window.confirm(t(lang, 'adminP5.unsavedWarn'))) {
                  setFormOpen(false)
                  setDirty(false)
                }
              }}
              className="p-1 text-gray-400 hover:text-gray-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label={isRTL ? 'عنوان المقال' : 'Article Title'} required>
              <input
                value={form.title}
                onChange={(e) => {
                  const title = e.target.value
                  updateForm({ title, ...(editing ? {} : { slug: toSlug(title) }) })
                }}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm"
              />
            </FormField>
            <FormField label="Slug">
              <div className="space-y-1">
                <input value={form.slug} onChange={(e) => updateForm({ slug: toSlug(e.target.value) })} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" dir="ltr" />
                {form.slug && (
                  <p className={`text-[11px] flex items-center gap-1 ${slugTaken ? 'text-red-600' : 'text-emerald-600'}`}>
                    {slugTaken ? <AlertCircle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                    <span>{slugTaken ? t(lang, 'adminP5.slugTaken') : t(lang, 'adminP5.slugUnique')}</span>
                  </p>
                )}
              </div>
            </FormField>
          </div>

          <FormField label={isRTL ? 'ملخص المقال' : 'Excerpt'}>
            <input value={form.excerpt} onChange={(e) => updateForm({ excerpt: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" />
          </FormField>

          <FormField label={isRTL ? 'المحتوى (Markdown)' : 'Content (Markdown)'} required>
            <MarkdownEditor value={form.content} onChange={(content) => updateForm({ content })} assets={assets} />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField label={isRTL ? 'الفئة' : 'Category'}>
              <input value={form.category} onChange={(e) => updateForm({ category: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" />
            </FormField>
            <FormField label={isRTL ? 'الحالة' : 'Status'}>
              <select value={form.status} onChange={(e) => updateForm({ status: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm">
                <option value="public">public</option>
                <option value="private">private</option>
                <option value="draft">draft</option>
              </select>
            </FormField>
            <FormField label={t(lang, 'adminP5.scheduleAt')}>
              <input type="datetime-local" value={form.publishedAt} onChange={(e) => updateForm({ publishedAt: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" dir="ltr" />
            </FormField>
          </div>

          <FormField label={isRTL ? 'صورة الغلاف' : 'Cover Image'}>
            <div className="flex gap-2">
              <input value={form.coverImage} onChange={(e) => updateForm({ coverImage: e.target.value })} className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm" dir="ltr" />
              <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    try {
                      const blob = await uploadBlobDirect(file)
                      updateForm({ coverImage: blob.url })
                      addToast(isRTL ? 'تم رفع الصورة' : 'Cover uploaded')
                    } catch (err) {
                      addToast(err.message, 'error')
                    }
                  }}
                />
              </label>
            </div>
          </FormField>

          {assets.length > 0 && (
            <FormField label={t(lang, 'adminP5.attachments')}>
              <div className="flex flex-wrap gap-2">
                {assets.map((a) => {
                  const active = form.attachments.includes(a._id)
                  return (
                    <button
                      key={a._id}
                      type="button"
                      onClick={() => updateForm({
                        attachments: active ? form.attachments.filter((id) => id !== a._id) : [...form.attachments, a._id]
                      })}
                      className={`px-3 py-1 rounded-full text-xs font-medium border cursor-pointer ${
                        active ? 'bg-[#222936] text-[#B9D895] border-[#222936]' : 'bg-gray-50 text-gray-600 border-gray-200'
                      }`}
                    >
                      {a.title} ({a.kind})
                    </button>
                  )
                })}
              </div>
            </FormField>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setFormOpen(false)} className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold cursor-pointer">
              {t(lang, 'adminP5.cancel')}
            </button>
            <button type="submit" disabled={saving} className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#222936] text-[#B9D895] text-xs font-bold cursor-pointer">
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? '...' : (isRTL ? 'حفظ (Ctrl+S)' : 'Save (Ctrl+S)')}</span>
            </button>
          </div>
        </form>
      )}

      <DataTable
        columns={columns}
        rows={articles}
        loading={loading}
        emptyState={<EmptyState title={isRTL ? 'لا توجد مقالات' : 'No articles yet'} />}
      />

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title={isRTL ? 'حذف المقال' : 'Delete Article'}
        message={isRTL ? `حذف "${confirmDelete?.title}" نهائياً؟` : `Delete "${confirmDelete?.title}"?`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  )
}
