import React, { useState, useEffect, useCallback } from 'react'
import {
  UploadCloud, FileSpreadsheet, FileText, Presentation,
  Image as ImageIcon, File, Trash2, Edit3, Copy, Eye, X, Check, AlertTriangle
} from 'lucide-react'
import DataTable from '../components/DataTable'
import StatusBadge from '../components/StatusBadge'
import ConfirmDialog from '../components/ConfirmDialog'
import EmptyState from '../components/EmptyState'
import { useToast } from '../components/Toast'
import {
  fetchAdminAssetConfig, fetchAdminAssets, uploadBlobDirect,
  registerAdminAsset, updateAdminAsset, deleteAdminAsset
} from '../../services/api'
import { useLang } from '../../i18n/LanguageContext'
import { t } from '../../i18n/translations'
import { AssetCard } from '../../components/viewers/AttachmentsSection'

const DEFAULT_EXTS = ['xlsx', 'xls', 'csv', 'docx', 'doc', 'pptx', 'ppt', 'pdf', 'png', 'jpg', 'jpeg', 'webp']
const KIND_OPTIONS = ['', 'xlsx', 'xls', 'csv', 'docx', 'doc', 'pptx', 'ppt', 'pdf', 'image']

function formatSize(bytes = 0) {
  if (!bytes) return '0 B'
  const u = ['B', 'KB', 'MB']
  const i = Math.min(u.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)))
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${u[i]}`
}

function KindIcon({ kind }) {
  if (['xlsx', 'xls', 'csv'].includes(kind)) return <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
  if (['docx', 'doc'].includes(kind)) return <FileText className="w-4 h-4 text-blue-600 shrink-0" />
  if (['pptx', 'ppt'].includes(kind)) return <Presentation className="w-4 h-4 text-orange-500 shrink-0" />
  if (kind === 'pdf') return <FileText className="w-4 h-4 text-red-500 shrink-0" />
  if (kind === 'image') return <ImageIcon className="w-4 h-4 text-sky-600 shrink-0" />
  return <File className="w-4 h-4 text-gray-500 shrink-0" />
}

export default function Files({ onAssetsChange }) {
  const { lang, isRTL } = useLang()
  const { addToast } = useToast()

  const [config, setConfig] = useState({ maxUploadMb: 15, maxUploadBytes: 15 * 1024 * 1024, allowedExtensions: DEFAULT_EXTS })
  const [assets, setAssets] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [kindFilter, setKindFilter] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [editDraft, setEditDraft] = useState({ title: '', status: 'draft' })
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [previewAsset, setPreviewAsset] = useState(null)

  useEffect(() => {
    fetchAdminAssetConfig()
      .then((cfg) => { if (cfg) setConfig(cfg) })
      .catch(() => {})
  }, [])

  const loadAssets = useCallback(async (p = page, kind = kindFilter) => {
    setLoading(true)
    try {
      const res = await fetchAdminAssets({ page: p, limit: 15, kind })
      setAssets(res.data || [])
      setTotalPages(res.totalPages || 1)
      onAssetsChange?.(res.data || [])
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }, [page, kindFilter, addToast, onAssetsChange])

  useEffect(() => {
    loadAssets(page, kindFilter)
  }, [page, kindFilter, loadAssets])

  const handleFiles = async (fileList) => {
    const file = fileList?.[0]
    if (!file) return

    const allowedSet = new Set(config.allowedExtensions || DEFAULT_EXTS)
    const ext = (file.name.split('.').pop() || '').toLowerCase()
    if (!allowedSet.has(ext)) {
      addToast(`.${ext} is not allowed`, 'error')
      return
    }
    if (file.size > config.maxUploadBytes) {
      addToast(`File exceeds ${config.maxUploadMb} MB limit`, 'error')
      return
    }

    try {
      setUploadProgress(5)
      const blob = await uploadBlobDirect(file, (pct) => setUploadProgress(pct))
      setUploadProgress(95)

      await registerAdminAsset({
        title: file.name.replace(/\.[^/.]+$/, ''),
        originalName: file.name,
        mimeType: file.type || 'application/octet-stream',
        size: file.size,
        url: blob.url,
        pathname: blob.pathname,
        status: 'public'
      })

      addToast(isRTL ? 'تم رفع الملف بنجاح' : 'File uploaded successfully')
      setUploadProgress(null)
      loadAssets(1, kindFilter)
    } catch (err) {
      setUploadProgress(null)
      addToast(err.message, 'error')
    }
  }

  const handleSaveEdit = async (id) => {
    const prev = [...assets]
    setAssets(assets.map((a) => (a._id === id ? { ...a, ...editDraft } : a)))
    setEditingId(null)
    try {
      await updateAdminAsset(id, editDraft)
      addToast(isRTL ? 'تم تحديث الملف' : 'Asset updated')
    } catch (err) {
      setAssets(prev)
      addToast(err.message, 'error')
    }
  }

  const handleDelete = async () => {
    if (!confirmDelete) return
    const target = confirmDelete
    setConfirmDelete(null)
    const prev = [...assets]
    setAssets(assets.filter((a) => a._id !== target._id))
    try {
      await deleteAdminAsset(target._id)
      addToast(isRTL ? 'تم حذف الملف' : 'Asset deleted')
    } catch (err) {
      setAssets(prev)
      addToast(err.message, 'error')
    }
  }

  const copyEmbedSnippet = (asset) => {
    const snippet = `\`\`\`asset\nid: ${asset._id}\n\`\`\``
    navigator.clipboard?.writeText(snippet).catch(() => {})
    addToast(t(lang, 'adminP5.snippetCopied'))
  }

  const columns = [
    {
      key: 'title',
      header: isRTL ? 'الملف' : 'File',
      render: (row) => editingId === row._id ? (
        <input
          value={editDraft.title}
          onChange={(e) => setEditDraft({ ...editDraft, title: e.target.value })}
          className="px-2 py-1 border rounded-lg text-xs w-44"
        />
      ) : (
        <div className="flex items-center gap-2.5 min-w-0">
          <KindIcon kind={row.kind} />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="font-semibold text-[#222936] truncate max-w-[180px]" dir="auto">{row.title}</p>
              {(row.isLegacy || ['doc', 'xls', 'ppt'].includes(row.kind)) && (
                <span title={t(lang, 'viewer.legacyRiskWarning')} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                  <AlertTriangle className="w-2.5 h-2.5" /> Legacy
                </span>
              )}
            </div>
            <p className="text-[10px] text-gray-400 truncate max-w-[200px]">{row.originalName}</p>
          </div>
        </div>
      )
    },
    { key: 'size', header: isRTL ? 'الحجم' : 'Size', render: (r) => <span className="text-xs text-gray-500">{formatSize(r.size)}</span> },
    {
      key: 'status',
      header: isRTL ? 'الحالة' : 'Status',
      render: (row) => editingId === row._id ? (
        <select value={editDraft.status} onChange={(e) => setEditDraft({ ...editDraft, status: e.target.value })} className="px-2 py-1 border rounded-lg text-xs">
          <option value="public">public</option>
          <option value="private">private</option>
          <option value="draft">draft</option>
        </select>
      ) : <StatusBadge status={row.status} />
    },
    { key: 'views', header: isRTL ? 'المشاهدات' : 'Views', render: (r) => <span className="text-xs">{r.views || 0}</span> },
    { key: 'downloads', header: isRTL ? 'التحميلات' : 'Downloads', render: (r) => <span className="text-xs">{r.downloads || 0}</span> },
    {
      key: 'actions',
      header: isRTL ? 'إجراءات' : 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          {editingId === row._id ? (
            <button type="button" onClick={() => handleSaveEdit(row._id)} className="p-1.5 rounded-lg bg-[#222936] text-[#B9D895] cursor-pointer">
              <Check className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button type="button" onClick={() => { setEditingId(row._id); setEditDraft({ title: row.title, status: row.status }) }} className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 cursor-pointer" title="Edit">
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          )}
          <button type="button" onClick={() => setPreviewAsset(row)} className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 cursor-pointer" title={t(lang, 'adminP5.preview')}>
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button type="button" onClick={() => copyEmbedSnippet(row)} className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 cursor-pointer" title={t(lang, 'adminP5.copySnippet')}>
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button type="button" onClick={() => setConfirmDelete(row)} className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 cursor-pointer" title="Delete">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )
    }
  ]

  const acceptAttr = (config.allowedExtensions || DEFAULT_EXTS).map((e) => `.${e}`).join(',')

  return (
    <div className="space-y-6">
      <label
        onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => { e.preventDefault(); setDragActive(false); handleFiles(e.dataTransfer.files) }}
        className={`block rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${
          dragActive ? 'border-[#222936] bg-[#E0F6C4]/40' : 'border-gray-300 bg-white hover:border-[#374159]'
        }`}
      >
        <input type="file" accept={acceptAttr} className="hidden" onChange={(e) => handleFiles(e.target.files)} />
        <UploadCloud className="w-9 h-9 text-[#374159] mx-auto mb-2" />
        <p className="text-sm font-bold text-[#222936]">{t(lang, 'adminP5.uploadDrop')}</p>
        <p className="text-xs text-gray-500 mt-1">
          {t(lang, 'adminP5.uploadHint')} ({config.maxUploadMb} MB max)
        </p>
        {uploadProgress !== null && (
          <div className="max-w-xs mx-auto mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-[#222936] transition-all" style={{ width: `${uploadProgress}%` }} />
          </div>
        )}
      </label>

      <div className="flex items-center justify-end">
        <select
          value={kindFilter}
          onChange={(e) => { setKindFilter(e.target.value); setPage(1) }}
          className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-[#222936]"
        >
          {KIND_OPTIONS.map((k) => (
            <option key={k || 'all'} value={k}>
              {k ? k.toUpperCase() : (isRTL ? 'كل الأنواع' : 'All Types')}
            </option>
          ))}
        </select>
      </div>

      <DataTable
        columns={columns}
        rows={assets}
        loading={loading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        emptyState={<EmptyState title={isRTL ? 'لا توجد ملفات مرفوعة' : 'No files uploaded yet'} />}
      />

      {previewAsset && (
        <div className="fixed inset-0 z-50 bg-black/70 p-4 sm:p-8 flex items-center justify-center" onClick={() => setPreviewAsset(null)}>
          <div className="w-full max-w-5xl max-h-[90vh] overflow-auto relative" onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={() => setPreviewAsset(null)} className="mb-2 ms-auto flex items-center gap-1 px-3 py-1.5 rounded-full bg-white text-[#222936] text-xs font-bold cursor-pointer">
              <X className="w-4 h-4" />
              <span>{t(lang, 'viewer.closePreview')}</span>
            </button>
            <AssetCard asset={previewAsset} />
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title={isRTL ? 'حذف الملف' : 'Delete File'}
        message={isRTL ? `هل تريد حذف "${confirmDelete?.title}" نهائياً؟` : `Permanently delete "${confirmDelete?.title}"?`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  )
}
