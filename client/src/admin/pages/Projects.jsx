import React, { useState, useEffect, useCallback } from 'react'
import { Plus, Edit3, Trash2, Save, X, CheckCircle2, AlertCircle } from 'lucide-react'
import DataTable from '../components/DataTable'
import StatusBadge from '../components/StatusBadge'
import ConfirmDialog from '../components/ConfirmDialog'
import EmptyState from '../components/EmptyState'
import FormField from '../components/FormField'
import MarkdownEditor from '../components/MarkdownEditor'
import ThumbnailUploader from '../components/ThumbnailUploader'
import GalleryManager from '../components/GalleryManager'
import AttachmentManager from '../components/AttachmentManager'
import { useToast } from '../components/Toast'
import { createProject, updateProject, deleteProject } from '../../services/api'
import { useLang } from '../../i18n/LanguageContext'
import { t } from '../../i18n/translations'

const toSlug = (val = '') =>
  String(val)
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')

const EMPTY_FORM = {
  title: '',
  slug: '',
  subtitle: '',
  description: '',
  category: 'Data Analysis',
  type: 'BI Dashboard',
  client: 'Client Studio',
  thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
  thumbnailImage: undefined,
  gallery: [],
  liveUrl: '',
  repoUrl: '',
  status: 'public',
  publishedAt: '',
  attachments: []
}

export default function Projects({ projects = [], setProjects, assets = [], setAssets, loading, onRefresh }) {
  const { lang, isRTL } = useLang()
  const { addToast } = useToast()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [dirty, setDirty] = useState(false)
  const [uploadingCount, setUploadingCount] = useState(0)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const updateForm = (patch) => {
    setForm((prev) => ({ ...prev, ...patch }))
    setDirty(true)
  }

  const handleUploadingChange = useCallback((isUp) => {
    setUploadingCount((c) => Math.max(0, c + (isUp ? 1 : -1)))
  }, [])

  useEffect(() => {
    if (!formOpen || (!dirty && uploadingCount === 0)) return
    const handleUnload = (e) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handleUnload)
    return () => window.removeEventListener('beforeunload', handleUnload)
  }, [formOpen, dirty, uploadingCount])

  const slugTaken = Boolean(
    form.slug &&
    projects.some((p) => p.slug === form.slug && p._id !== editing?._id)
  )

  const openNew = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setDirty(false)
    setFormOpen(true)
  }

  const openEdit = (p) => {
    setEditing(p)
    setForm({
      title: p.title || '',
      slug: p.slug || '',
      subtitle: p.subtitle || '',
      description: p.description || '',
      category: p.category || 'Data Analysis',
      type: p.type || 'BI Dashboard',
      client: p.client || 'Client Studio',
      thumbnail: p.thumbnail || '',
      thumbnailImage: p.thumbnailImage?.publicId ? p.thumbnailImage : undefined,
      gallery: Array.isArray(p.gallery) ? p.gallery : [],
      liveUrl: p.liveUrl || '',
      repoUrl: p.repoUrl || '',
      status: p.status || (p.published === false ? 'private' : 'public'),
      publishedAt: p.publishedAt ? String(p.publishedAt).slice(0, 16) : '',
      attachments: (p.attachments || []).map((a) => (typeof a === 'object' ? a._id : a))
    })
    setDirty(false)
    setFormOpen(true)
  }

  const handleSave = useCallback(async (e) => {
    e?.preventDefault()
    if (!form.title.trim()) {
      addToast(isRTL ? 'عنوان المشروع مطلوب' : 'Project title is required', 'error')
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
        await updateProject(editing._id || editing.slug, payload)
        addToast(isRTL ? 'تم تحديث المشروع' : 'Project updated')
      } else {
        await createProject(payload)
        addToast(isRTL ? 'تم إضافة المشروع' : 'Project created')
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
    const prev = [...projects]
    setProjects(projects.filter((p) => p._id !== target._id))
    try {
      await deleteProject(target._id || target.slug)
      addToast(isRTL ? 'تم حذف المشروع' : 'Project deleted')
    } catch (err) {
      setProjects(prev)
      addToast(err.message, 'error')
    }
  }

  const handleCoverUpload = async (file) => {
    if (!file) return
    try {
      const blob = await uploadBlobDirect(file)
      setForm((prev) => ({ ...prev, thumbnail: blob.url }))
      addToast(isRTL ? 'تم رفع الصورة' : 'Cover uploaded')
    } catch (err) {
      addToast(err.message, 'error')
    }
  }

  const columns = [
    {
      key: 'title',
      header: isRTL ? 'المشروع' : 'Project',
      render: (r) => (
        <div className="flex items-center gap-3">
          {r.thumbnail && <img src={r.thumbnail} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0" />}
          <div className="min-w-0">
            <p className="font-bold text-[#222936] truncate max-w-[220px]" dir="auto">{r.title}</p>
            <p className="text-[11px] text-gray-400">{r.category}</p>
          </div>
        </div>
      )
    },
    { key: 'status', header: isRTL ? 'الحالة' : 'Status', render: (r) => <StatusBadge status={r.status || (r.published === false ? 'private' : 'public')} /> },
    { key: 'clicks', header: isRTL ? 'النقرات' : 'Clicks', render: (r) => <span className="text-xs font-semibold">{r.clicks || 0}</span> },
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
        <button
          type="button"
          onClick={openNew}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#222936] text-[#B9D895] text-xs font-bold cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{isRTL ? 'مشروع جديد' : 'New Project'}</span>
        </button>
      </div>

      {formOpen && (
        <form onSubmit={handleSave} className="rounded-2xl bg-white border border-gray-200 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h2 className="text-sm font-bold text-[#222936]">
              {editing ? (isRTL ? 'تعديل المشروع' : 'Edit Project') : (isRTL ? 'إضافة مشروع' : 'Add Project')}
            </h2>
            <button type="button" onClick={() => setFormOpen(false)} className="p-1 text-gray-400 hover:text-gray-700 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label={isRTL ? 'العنوان' : 'Title'} required>
              <input
                value={form.title}
                onChange={(e) => {
                  const title = e.target.value
                  setForm((p) => ({ ...p, title, slug: editing ? p.slug : toSlug(title) }))
                }}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm"
              />
            </FormField>
            <FormField label="Slug">
              <div className="space-y-1">
                <input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: toSlug(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm"
                  dir="ltr"
                />
                {form.slug && (
                  <p className={`text-[11px] flex items-center gap-1 ${slugTaken ? 'text-red-600' : 'text-emerald-600'}`}>
                    {slugTaken ? <AlertCircle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                    <span>{slugTaken ? t(lang, 'adminP5.slugTaken') : t(lang, 'adminP5.slugUnique')}</span>
                  </p>
                )}
              </div>
            </FormField>
          </div>

          <FormField label={isRTL ? 'وصف مختصر' : 'Subtitle'} required>
            <input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" />
          </FormField>

          <FormField label={isRTL ? 'تفاصيل المشروع (Markdown)' : 'Full Description (Markdown)'}>
            <MarkdownEditor
              value={form.description}
              onChange={(description) => updateForm({ description })}
              assets={assets}
              maxLength={20000}
              onUploadingChange={handleUploadingChange}
            />
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

          <FormField label={isRTL ? 'الصورة المصغرة (16:9)' : 'Thumbnail Image (16:9)'}>
            <ThumbnailUploader
              thumbnailImage={form.thumbnailImage}
              legacyUrl={form.thumbnail}
              onChange={({ thumbnailImage, legacyUrl }) =>
                updateForm({ thumbnailImage, thumbnail: legacyUrl })
              }
              onUploadingChange={handleUploadingChange}
            />
          </FormField>

          <FormField label={isRTL ? 'معرض صور المشروع (حتى 20 صورة)' : 'Project Gallery (up to 20 images)'}>
            <GalleryManager
              gallery={form.gallery}
              onChange={(gallery) => updateForm({ gallery })}
              onUploadingChange={handleUploadingChange}
            />
          </FormField>

          <FormField label={t(lang, 'adminP5.attachments')}>
            <AttachmentManager
              attachments={form.attachments}
              onChange={(next) => setForm((prev) => ({ ...prev, attachments: next }))}
              assets={assets}
              onAssetCreated={(created) => setAssets?.((prev) => [created, ...prev])}
              onAssetUpdated={(updated) =>
                setAssets?.((prev) => prev.map((a) => (a._id === updated._id ? updated : a)))
              }
            />
          </FormField>

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
        rows={projects}
        loading={loading}
        emptyState={<EmptyState title={isRTL ? 'لا توجد مشاريع' : 'No projects yet'} />}
      />

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title={isRTL ? 'حذف المشروع' : 'Delete Project'}
        message={isRTL ? `حذف "${confirmDelete?.title}" نهائياً؟` : `Delete "${confirmDelete?.title}"?`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  )
}
