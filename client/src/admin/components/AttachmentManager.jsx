import React, { useState, useEffect, useRef } from 'react'
import {
  Upload,
  ArrowUp,
  ArrowDown,
  Eye,
  X,
  Edit3,
  Check,
  FileSpreadsheet,
  FileText,
  Presentation,
  Image as ImageIcon,
  File,
  Plus
} from 'lucide-react'
import {
  fetchAdminAssetConfig,
  uploadBlobDirect,
  registerAdminAsset,
  updateAdminAsset
} from '../../services/api'
import { useLang } from '../../i18n/LanguageContext'
import { t } from '../../i18n/translations'
import { useToast } from './Toast'
import { AssetCard } from '../../components/viewers/AttachmentsSection'

const DEFAULT_EXTS = ['xlsx', 'xls', 'csv', 'docx', 'doc', 'pptx', 'ppt', 'pdf', 'png', 'jpg', 'jpeg', 'webp']
const DEFAULT_MAX_BYTES = 15 * 1024 * 1024

function KindIcon({ kind }) {
  const k = (kind || '').toLowerCase()
  if (['xlsx', 'xls', 'csv'].includes(k)) return <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
  if (['pptx', 'ppt'].includes(k)) return <Presentation className="w-4 h-4 text-amber-600 shrink-0" />
  if (['docx', 'doc', 'pdf'].includes(k)) return <FileText className="w-4 h-4 text-blue-600 shrink-0" />
  if (k === 'image') return <ImageIcon className="w-4 h-4 text-purple-600 shrink-0" />
  return <File className="w-4 h-4 text-gray-500 shrink-0" />
}

async function computeSha256(file) {
  try {
    if (!window.crypto?.subtle) return ''
    const buf = await file.arrayBuffer()
    const hashBuf = await window.crypto.subtle.digest('SHA-256', buf)
    return Array.from(new Uint8Array(hashBuf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  } catch {
    return ''
  }
}

export default function AttachmentManager({
  attachments = [],
  onChange,
  assets = [],
  onAssetCreated,
  onAssetUpdated
}) {
  const { lang, isRTL } = useLang()
  const { addToast } = useToast()
  const fileInputRef = useRef(null)

  const [config, setConfig] = useState({
    allowedExtensions: DEFAULT_EXTS,
    maxUploadMb: 15,
    maxUploadBytes: DEFAULT_MAX_BYTES
  })
  const [dragging, setDragging] = useState(false)
  const [uploads, setUploads] = useState([]) // [{ key, name, progress, status, error }]
  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editCaption, setEditCaption] = useState('')
  const [savingMeta, setSavingMeta] = useState(false)
  const [previewAsset, setPreviewAsset] = useState(null)
  const [showLibrary, setShowLibrary] = useState(false)

  useEffect(() => {
    fetchAdminAssetConfig()
      .then((cfg) => {
        if (cfg) setConfig(cfg)
      })
      .catch(() => {})
  }, [])

  const assetMap = new Map((assets || []).map((a) => [a._id, a]))
  const attachedItems = attachments
    .map((id) => ({ id, asset: assetMap.get(id) }))
    .filter((item) => Boolean(item.id))

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList || [])
    if (files.length === 0) return

    const newAttachedIds = []
    for (const file of files) {
      const ext = file.name.split('.').pop()?.toLowerCase() || ''
      const key = `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

      if (!config.allowedExtensions.includes(ext)) {
        addToast(
          isRTL ? `الامتداد .${ext} غير مسموح به` : `Extension .${ext} is not allowed`,
          'error'
        )
        continue
      }

      if (file.size > config.maxUploadBytes) {
        addToast(
          isRTL
            ? `${file.name}: يتجاوز الحد الأقصى (${config.maxUploadMb} ميجابايت)`
            : `${file.name}: exceeds ${config.maxUploadMb} MB limit`,
          'error'
        )
        continue
      }

      setUploads((prev) => [...prev, { key, name: file.name, progress: 5, status: 'uploading' }])

      try {
        const checksum = await computeSha256(file)
        const blob = await uploadBlobDirect(file, (pct) => {
          setUploads((prev) =>
            prev.map((u) => (u.key === key ? { ...u, progress: Math.max(5, pct) } : u))
          )
        })

        setUploads((prev) =>
          prev.map((u) => (u.key === key ? { ...u, progress: 95, status: 'registering' } : u))
        )

        const created = await registerAdminAsset({
          title: file.name.replace(/\.[^.]+$/, ''),
          originalName: file.name,
          mimeType: blob.contentType || file.type || 'application/octet-stream',
          size: file.size,
          url: blob.url,
          pathname: blob.pathname || file.name,
          status: 'public',
          checksum: checksum || undefined
        })

        if (created?._id) {
          onAssetCreated?.(created)
          newAttachedIds.push(created._id)
        }

        setUploads((prev) =>
          prev.map((u) => (u.key === key ? { ...u, progress: 100, status: 'done' } : u))
        )
      } catch (err) {
        setUploads((prev) =>
          prev.map((u) => (u.key === key ? { ...u, status: 'error', error: err.message } : u))
        )
        addToast(`${file.name}: ${err.message}`, 'error')
      }
    }

    if (newAttachedIds.length > 0) {
      const merged = [...attachments]
      for (const id of newAttachedIds) {
        if (!merged.includes(id)) merged.push(id)
      }
      onChange?.(merged)
      addToast(
        isRTL
          ? `تم رفع وإرفاق ${newAttachedIds.length} ملف`
          : `Uploaded & attached ${newAttachedIds.length} file(s)`
      )
    }

    setTimeout(() => {
      setUploads((prev) => prev.filter((u) => u.status === 'uploading' || u.status === 'registering'))
    }, 2500)
  }

  const moveAttachment = (idx, dir) => {
    const target = idx + dir
    if (target < 0 || target >= attachments.length) return
    const next = [...attachments]
    ;[next[idx], next[target]] = [next[target], next[idx]]
    onChange?.(next)
  }

  const removeAttachment = (assetId) => {
    onChange?.(attachments.filter((id) => id !== assetId))
  }

  const startEdit = (asset) => {
    setEditingId(asset._id)
    setEditTitle(asset.title || '')
    setEditCaption(asset.description || '')
  }

  const saveEdit = async (assetId) => {
    if (!editTitle.trim()) return
    setSavingMeta(true)
    try {
      const updated = await updateAdminAsset(assetId, {
        title: editTitle.trim(),
        description: editCaption.trim()
      })
      onAssetUpdated?.(updated)
      setEditingId(null)
      addToast(isRTL ? 'تم تحديث بيانات المرفق' : 'Attachment updated')
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setSavingMeta(false)
    }
  }

  const acceptAttr = config.allowedExtensions.map((e) => `.${e}`).join(',')
  const availableLibrary = (assets || []).filter((a) => !attachments.includes(a._id))

  return (
    <div className="space-y-3">
      {/* Multi-file Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          handleFiles(e.dataTransfer.files)
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`rounded-xl border-2 border-dashed p-4 text-center cursor-pointer transition-colors ${
          dragging ? 'border-[#222936] bg-[#B9D895]/20' : 'border-gray-200 hover:border-gray-300 bg-gray-50/70'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptAttr}
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files)
            e.target.value = ''
          }}
        />
        <Upload className="w-5 h-5 mx-auto text-[#222936] mb-1.5" />
        <p className="text-xs font-semibold text-[#222936]">
          {t(lang, 'adminP5.uploadDrop')}
        </p>
        <p className="text-[11px] text-gray-400 mt-0.5">
          {config.allowedExtensions.join(', ')} (max {config.maxUploadMb} MB)
        </p>
      </div>

      {/* Per-file Upload Progress */}
      {uploads.length > 0 && (
        <div className="space-y-2">
          {uploads.map((u) => (
            <div key={u.key} className="rounded-lg border border-gray-200 bg-white px-3 py-2">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-[#222936] truncate max-w-[70%]">{u.name}</span>
                <span className={u.status === 'error' ? 'text-red-600' : 'text-gray-500'}>
                  {u.status === 'error' ? u.error : `${u.progress}%`}
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    u.status === 'error' ? 'bg-red-500' : 'bg-[#222936]'
                  }`}
                  style={{ width: `${u.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Attached Files List (Reorder, Edit Title/Caption, Preview, Detach) */}
      {attachedItems.length > 0 && (
        <div className="space-y-2">
          {attachedItems.map(({ id, asset }, idx) => {
            const isEditing = editingId === id
            return (
              <div
                key={id}
                className="rounded-xl border border-gray-200 bg-white p-3 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <KindIcon kind={asset?.kind} />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#222936] truncate" dir="auto">
                        {asset ? asset.title : id}
                      </p>
                      {asset?.description && !isEditing && (
                        <p className="text-[11px] text-gray-400 truncate" dir="auto">
                          {asset.description}
                        </p>
                      )}
                    </div>
                    {asset?.kind && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-600 uppercase shrink-0">
                        {asset.kind}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveAttachment(idx, -1)}
                      title={isRTL ? 'تحريك لأعلى' : 'Move up'}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === attachedItems.length - 1}
                      onClick={() => moveAttachment(idx, 1)}
                      title={isRTL ? 'تحريك لأسفل' : 'Move down'}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    {asset && (
                      <>
                        <button
                          type="button"
                          onClick={() => setPreviewAsset(asset)}
                          title={t(lang, 'adminP5.preview')}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => (isEditing ? setEditingId(null) : startEdit(asset))}
                          title={isRTL ? 'تعديل العنوان والوصف' : 'Edit title & caption'}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={() => removeAttachment(id)}
                      title={isRTL ? 'إزالة من المرفقات (دون حذف الملف)' : 'Detach (keeps original asset)'}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {isEditing && asset && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-gray-100">
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder={isRTL ? 'عنوان الملف' : 'Title'}
                      className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs"
                    />
                    <div className="flex gap-1.5">
                      <input
                        value={editCaption}
                        onChange={(e) => setEditCaption(e.target.value)}
                        placeholder={isRTL ? 'وصف / تعليق' : 'Caption'}
                        className="flex-1 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs"
                      />
                      <button
                        type="button"
                        disabled={savingMeta}
                        onClick={() => saveEdit(id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#222936] text-[#B9D895] text-xs font-bold cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Existing Library Picker */}
      {availableLibrary.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setShowLibrary((v) => !v)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#222936] hover:underline cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>
              {showLibrary
                ? (isRTL ? 'إخفاء مكتبة الملفات' : 'Hide Existing Files')
                : (isRTL ? `إرفاق من المكتبة (${availableLibrary.length})` : `Attach from Library (${availableLibrary.length})`)}
            </span>
          </button>

          {showLibrary && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {availableLibrary.map((a) => (
                <button
                  key={a._id}
                  type="button"
                  onClick={() => onChange?.([...attachments, a._id])}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>{a.title}</span>
                  <span className="text-[10px] text-gray-400">({a.kind})</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Preview Modal */}
      {previewAsset && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-3 sm:p-6"
          onClick={() => setPreviewAsset(null)}
        >
          <div
            className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#1a2130] p-3 sm:p-4 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between text-white">
              <span className="text-sm font-bold truncate">{previewAsset.title}</span>
              <button
                type="button"
                onClick={() => setPreviewAsset(null)}
                className="p-1.5 rounded-lg hover:bg-white/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <AssetCard asset={previewAsset} />
          </div>
        </div>
      )}
    </div>
  )
}
