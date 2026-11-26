import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  X,
  Search,
  Upload,
  Trash2,
  Edit3,
  Check,
  Info,
  AlertTriangle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import {
  fetchAdminImages,
  uploadToCloudinarySigned,
  updateAdminImage,
  fetchAdminImageUsage,
  deleteAdminImage
} from '../../services/api'
import { validateImageFile, compressImageFile } from '../../utils/imageCompression'
import CloudImage from '../../components/media/CloudImage'
import { useLang } from '../../i18n/LanguageContext'
import { useToast } from './Toast'

export default function MediaLibraryModal({
  open,
  onClose,
  onSelect,
  mode = 'picker', // 'picker' | 'markdown'
  defaultPurpose = 'inline'
}) {
  const { isRTL } = useLang()
  const { addToast } = useToast()
  const fileRef = useRef(null)

  const [images, setImages] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [selected, setSelected] = useState(null)

  // Inline alt editing
  const [editingAlt, setEditingAlt] = useState(false)
  const [altDraft, setAltDraft] = useState('')
  const [altArDraft, setAltArDraft] = useState('')

  // Usage & delete state
  const [usage, setUsage] = useState(null)
  const [usageLoading, setUsageLoading] = useState(false)

  // Markdown options
  const [mdAlt, setMdAlt] = useState('')
  const [mdCaption, setMdCaption] = useState('')
  const [mdWidth, setMdWidth] = useState(100)
  const [mdAlign, setMdAlign] = useState('center')
  const [mdAspectRatio, setMdAspectRatio] = useState('16:9')

  const loadImages = useCallback(async (p = page, q = search) => {
    setLoading(true)
    try {
      const res = await fetchAdminImages({ page: p, limit: 9, q })
      setImages(res.data || [])
      setTotalPages(res.pagination?.totalPages || 1)
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }, [page, search, addToast])

  useEffect(() => {
    if (!open) return
    loadImages(page, search)
  }, [open, page, search, loadImages])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const inspectImage = async (img) => {
    setSelected(img)
    setEditingAlt(false)
    setAltDraft(img.alt || '')
    setAltArDraft(img.altAr || '')
    setMdAlt((isRTL ? img.altAr : img.alt) || img.alt || '')
    setUsage(null)
    setUsageLoading(true)
    try {
      const u = await fetchAdminImageUsage(img._id)
      setUsage(u)
    } catch {
      setUsage(null)
    } finally {
      setUsageLoading(false)
    }
  }

  const handleUpload = async (file) => {
    if (!file) return
    const check = validateImageFile(file)
    if (!check.valid) {
      addToast(check.error, 'error')
      return
    }
    setUploading(true)
    setProgress(10)
    try {
      const compressed = await compressImageFile(file)
      const created = await uploadToCloudinarySigned(compressed, {
        purpose: defaultPurpose,
        onProgress: setProgress
      })
      addToast(isRTL ? 'تم رفع الصورة بنجاح' : 'Image uploaded')
      setPage(1)
      await loadImages(1, search)
      if (created) inspectImage(created)
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  const handleSaveAlt = async () => {
    if (!selected) return
    try {
      const updated = await updateAdminImage(selected._id, {
        alt: altDraft.trim(),
        altAr: altArDraft.trim()
      })
      setSelected(updated)
      setImages((prev) => prev.map((it) => (it._id === updated._id ? updated : it)))
      setEditingAlt(false)
      addToast(isRTL ? 'تم تحديث النص البديل' : 'Alt text updated')
    } catch (err) {
      addToast(err.message, 'error')
    }
  }

  const handleDelete = async () => {
    if (!selected) return
    if (usage?.inUse) {
      addToast(isRTL ? 'لا يمكن حذف صورة مستخدمة' : 'Cannot delete an image that is still in use', 'error')
      return
    }
    try {
      await deleteAdminImage(selected._id)
      addToast(isRTL ? 'تم حذف الصورة' : 'Image deleted')
      setSelected(null)
      setUsage(null)
      loadImages(page, search)
    } catch (err) {
      if (err.status === 409 && err.usage) {
        setUsage(err.usage)
      }
      addToast(err.message, 'error')
    }
  }

  const handleConfirmSelect = () => {
    if (!selected) return
    if (mode === 'markdown') {
      onSelect?.({
        image: selected,
        alt: mdAlt.trim() || selected.alt || '',
        caption: mdCaption.trim(),
        width: mdWidth,
        alignment: mdAlign,
        aspectRatio: mdAspectRatio
      })
    } else {
      onSelect?.(selected)
    }
    onClose?.()
  }

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      dir={isRTL ? 'rtl' : 'ltr'}
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl max-h-[92vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-2 px-4 py-3 bg-[#222936] text-white">
          <h3 className="text-sm font-bold">
            {isRTL ? 'مكتبة الصور (Cloudinary)' : 'Media Library (Cloudinary)'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label={isRTL ? 'إغلاق' : 'Close'}
            className="p-1.5 rounded-lg hover:bg-white/10 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Upload Bar */}
        <div className="p-3 border-b border-gray-200 flex flex-col sm:flex-row gap-2 bg-gray-50">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute start-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => {
                setPage(1)
                setSearch(e.target.value)
              }}
              placeholder={isRTL ? 'ابحث بالنص البديل أو المعرف...' : 'Search by alt text or publicId...'}
              className="w-full ps-9 pe-3 py-2 rounded-xl border border-gray-200 text-xs bg-white"
            />
          </div>

          <button
            type="button"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#222936] text-[#B9D895] text-xs font-bold cursor-pointer shrink-0"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{uploading ? `${progress}%` : (isRTL ? 'رفع صورة جديدة' : 'Upload Image')}</span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
            className="hidden"
            onChange={(e) => {
              handleUpload(e.target.files?.[0])
              e.target.value = ''
            }}
          />
        </div>

        {/* Body: Grid + Inspector */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-200">
          {/* Paginated Grid */}
          <div className="md:col-span-2 p-3 space-y-3">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="aspect-video rounded-xl bg-gray-100 animate-pulse" />
                ))}
              </div>
            ) : images.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-12">
                {isRTL ? 'لا توجد صور مطابقة' : 'No images found'}
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {images.map((img) => {
                  const active = selected?._id === img._id
                  return (
                    <button
                      key={img._id}
                      type="button"
                      onClick={() => inspectImage(img)}
                      className={`group rounded-xl overflow-hidden border-2 text-start transition-all cursor-pointer ${
                        active ? 'border-[#222936] ring-2 ring-[#B9D895]' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="aspect-video w-full bg-gray-100">
                        <CloudImage
                          publicId={img.publicId}
                          preset="card"
                          sizes="240px"
                          alt={img.alt}
                          altAr={img.altAr}
                          wrapperClassName="w-full h-full relative overflow-hidden bg-gray-100"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="px-2 py-1 text-[10px] text-gray-600 truncate bg-white">
                        {(isRTL ? img.altAr : img.alt) || img.alt || img.publicId}
                      </p>
                    </button>
                  )
                })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-medium text-gray-600">
                  {page} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Inspector & Selection Panel */}
          <div className="p-3 space-y-3 bg-gray-50/60">
            {!selected ? (
              <p className="text-xs text-gray-400 text-center py-8">
                {isRTL ? 'اختر صورة لعرض التفاصيل أو الإدراج' : 'Select an image to inspect or insert'}
              </p>
            ) : (
              <>
                <div className="aspect-video rounded-xl overflow-hidden border border-gray-200 bg-white">
                  <CloudImage
                    publicId={selected.publicId}
                    preset="card"
                    alt={selected.alt}
                    altAr={selected.altAr}
                    wrapperClassName="w-full h-full relative overflow-hidden"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="text-[11px] text-gray-500 space-y-0.5">
                  <p className="truncate font-mono" dir="ltr">{selected.publicId}</p>
                  <p>{selected.width}×{selected.height} · {selected.format?.toUpperCase()} · {Math.round((selected.bytes || 0) / 1024)} KB</p>
                </div>

                {/* Edit Alt Text */}
                <div className="space-y-1.5 border-t border-gray-200 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#222936]">
                      {isRTL ? 'النص البديل (Alt)' : 'Alt Text'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setEditingAlt((v) => !v)}
                      className="text-[11px] text-blue-600 hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>{isRTL ? 'تعديل' : 'Edit'}</span>
                    </button>
                  </div>

                  {editingAlt ? (
                    <div className="space-y-1.5">
                      <input
                        value={altDraft}
                        onChange={(e) => setAltDraft(e.target.value)}
                        placeholder="English alt text"
                        dir="ltr"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs bg-white"
                      />
                      <input
                        value={altArDraft}
                        onChange={(e) => setAltArDraft(e.target.value)}
                        placeholder="النص البديل بالعربية"
                        dir="rtl"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs bg-white"
                      />
                      <button
                        type="button"
                        onClick={handleSaveAlt}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#222936] text-[#B9D895] text-xs font-bold cursor-pointer"
                      >
                        <Check className="w-3 h-3" />
                        <span>{isRTL ? 'حفظ' : 'Save'}</span>
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-600">
                      {(isRTL ? selected.altAr : selected.alt) || selected.alt || (
                        <span className="text-amber-600 inline-flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          {isRTL ? 'لا يوجد نص بديل' : 'Missing alt text'}
                        </span>
                      )}
                    </p>
                  )}
                </div>

                {/* Usage Check */}
                <div className="border-t border-gray-200 pt-2 text-xs">
                  <div className="flex items-center gap-1.5 font-semibold text-[#222936] mb-1">
                    <Info className="w-3.5 h-3.5" />
                    <span>{isRTL ? 'الاستخدام في الموقع' : 'Image Usage'}</span>
                  </div>
                  {usageLoading ? (
                    <p className="text-[11px] text-gray-400">...</p>
                  ) : usage?.inUse ? (
                    <div className="rounded-lg bg-amber-50 border border-amber-200 p-2 text-[11px] text-amber-800 space-y-0.5">
                      <p className="font-semibold">
                        {isRTL ? `مستخدمة في ${usage.count} عنصر` : `Used in ${usage.count} item(s)`}
                      </p>
                      {usage.projects?.map((p) => (
                        <p key={p._id} className="truncate">• Project: {p.title}</p>
                      ))}
                      {usage.articles?.map((a) => (
                        <p key={a._id} className="truncate">• Article: {a.title}</p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-gray-500">
                      {isRTL ? 'غير مستخدمة حالياً' : 'Not currently referenced'}
                    </p>
                  )}
                </div>

                {/* Markdown Insert Options */}
                {mode === 'markdown' && (
                  <div className="border-t border-gray-200 pt-2 space-y-2">
                    <input
                      value={mdAlt}
                      onChange={(e) => setMdAlt(e.target.value)}
                      placeholder={isRTL ? 'النص البديل (Alt)' : 'Alt text'}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs bg-white"
                    />
                    <input
                      value={mdCaption}
                      onChange={(e) => setMdCaption(e.target.value)}
                      placeholder={isRTL ? 'التعليق أسفل الصورة (اختياري)' : 'Caption (optional)'}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs bg-white"
                    />
                    <div className="grid grid-cols-3 gap-1.5">
                      <select
                        value={mdWidth}
                        onChange={(e) => setMdWidth(Number(e.target.value))}
                        className="px-2 py-1.5 rounded-lg border border-gray-200 text-xs bg-white"
                      >
                        <option value={100}>100%</option>
                        <option value={75}>75%</option>
                        <option value={50}>50%</option>
                      </select>
                      <select
                        value={mdAlign}
                        onChange={(e) => setMdAlign(e.target.value)}
                        className="px-2 py-1.5 rounded-lg border border-gray-200 text-xs bg-white"
                      >
                        <option value="center">{isRTL ? 'توسيط' : 'Center'}</option>
                        <option value="start">{isRTL ? 'البداية' : 'Start'}</option>
                        <option value="end">{isRTL ? 'النهاية' : 'End'}</option>
                      </select>
                      <select
                        value={mdAspectRatio}
                        onChange={(e) => setMdAspectRatio(e.target.value)}
                        className="px-2 py-1.5 rounded-lg border border-gray-200 text-xs bg-white"
                      >
                        <option value="16:9">16:9</option>
                        <option value="4:3">4:3</option>
                        <option value="1:1">1:1</option>
                        <option value="3:2">3:2</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleConfirmSelect}
                    className="flex-1 py-2 rounded-xl bg-[#222936] text-[#B9D895] text-xs font-bold cursor-pointer"
                  >
                    {mode === 'markdown'
                      ? (isRTL ? 'إدراج في المقال' : 'Insert Image')
                      : (isRTL ? 'اختيار الصورة' : 'Select Image')}
                  </button>
                  <button
                    type="button"
                    disabled={Boolean(usage?.inUse)}
                    onClick={handleDelete}
                    title={usage?.inUse ? (isRTL ? 'مستخدمة ولا يمكن حذفها' : 'In use — cannot delete') : (isRTL ? 'حذف' : 'Delete')}
                    className="p-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-40 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
