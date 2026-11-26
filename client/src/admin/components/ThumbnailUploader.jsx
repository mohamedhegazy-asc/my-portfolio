import React, { useState, useRef } from 'react'
import { Upload, FolderOpen, RefreshCw, X, AlertTriangle } from 'lucide-react'
import { uploadToCloudinarySigned } from '../../services/api'
import { validateImageFile, compressImageFile } from '../../utils/imageCompression'
import CloudImage from '../../components/media/CloudImage'
import MediaLibraryModal from './MediaLibraryModal'
import { useLang } from '../../i18n/LanguageContext'
import { useToast } from './Toast'

export default function ThumbnailUploader({
  thumbnailImage,
  legacyUrl = '',
  onChange, // ({ thumbnailImage, legacyUrl }) => void
  onUploadingChange
}) {
  const { isRTL } = useLang()
  const { addToast } = useToast()
  const fileRef = useRef(null)

  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [compress, setCompress] = useState(true)
  const [libraryOpen, setLibraryOpen] = useState(false)

  const hasImage = Boolean(thumbnailImage?.publicId || (legacyUrl && legacyUrl.trim()))
  const missingAlt = hasImage && !thumbnailImage?.alt?.trim() && !thumbnailImage?.altAr?.trim()

  const handleFile = async (file) => {
    if (!file) return
    const check = validateImageFile(file)
    if (!check.valid) {
      addToast(check.error, 'error')
      return
    }

    setUploading(true)
    onUploadingChange?.(true)
    setProgress(5)

    try {
      const targetFile = compress ? await compressImageFile(file) : file
      const registered = await uploadToCloudinarySigned(targetFile, {
        purpose: 'thumbnail',
        alt: thumbnailImage?.alt || '',
        altAr: thumbnailImage?.altAr || '',
        onProgress: setProgress
      })

      onChange?.({
        thumbnailImage: {
          publicId: registered.publicId,
          width: registered.width,
          height: registered.height,
          alt: registered.alt || thumbnailImage?.alt || '',
          altAr: registered.altAr || thumbnailImage?.altAr || ''
        },
        legacyUrl: registered.secureUrl || legacyUrl
      })
      addToast(isRTL ? 'تم رفع الصورة المصغرة' : 'Thumbnail uploaded')
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setUploading(false)
      onUploadingChange?.(false)
      setProgress(0)
    }
  }

  const handleRemove = () => {
    // Detach only — never delete original Cloudinary/DB image automatically
    onChange?.({
      thumbnailImage: undefined,
      legacyUrl: ''
    })
  }

  return (
    <div className="space-y-3">
      {/* Live 16:9 Preview or Dropzone */}
      {hasImage ? (
        <div className="rounded-xl border border-gray-200 overflow-hidden bg-gray-50">
          <div className="aspect-video w-full max-w-md mx-auto bg-gray-100">
            <CloudImage
              publicId={thumbnailImage?.publicId}
              fallbackUrl={legacyUrl}
              preset="card"
              sizes="448px"
              width={thumbnailImage?.width}
              height={thumbnailImage?.height}
              alt={thumbnailImage?.alt || 'Thumbnail'}
              altAr={thumbnailImage?.altAr || 'صورة مصغرة'}
              wrapperClassName="w-full h-full relative overflow-hidden"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-white border-t border-gray-200">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#222936] text-[#B9D895] text-xs font-bold cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{isRTL ? 'استبدال' : 'Replace'}</span>
              </button>
              <button
                type="button"
                onClick={() => setLibraryOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                <FolderOpen className="w-3.5 h-3.5" />
                <span>{isRTL ? 'من المكتبة' : 'Library'}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleRemove}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>{isRTL ? 'إزالة' : 'Remove'}</span>
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            handleFile(e.dataTransfer.files?.[0])
          }}
          className={`rounded-xl border-2 border-dashed p-5 text-center transition-colors ${
            dragging ? 'border-[#222936] bg-[#B9D895]/20' : 'border-gray-200 bg-gray-50/70'
          }`}
        >
          <Upload className="w-6 h-6 mx-auto text-[#222936] mb-2" />
          <p className="text-xs font-semibold text-[#222936] mb-2">
            {isRTL ? 'اسحب الصورة هنا أو اختر من جهازك / الكاميرا' : 'Drag & drop an image, or upload from device / camera'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
              className="px-3.5 py-1.5 rounded-lg bg-[#222936] text-[#B9D895] text-xs font-bold cursor-pointer"
            >
              {isRTL ? 'رفع صورة' : 'Upload Image'}
            </button>
            <button
              type="button"
              onClick={() => setLibraryOpen(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-700 cursor-pointer"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>{isRTL ? 'مكتبة الصور' : 'Media Library'}</span>
            </button>
          </div>
          <p className="text-[11px] text-gray-400 mt-2">
            JPG, PNG, WebP, AVIF, GIF (max 10 MB)
          </p>
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files?.[0])
          e.target.value = ''
        }}
      />

      {/* Upload Progress */}
      {uploading && (
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-gray-600">
            <span>{isRTL ? 'جارٍ الرفع إلى Cloudinary...' : 'Uploading to Cloudinary...'}</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
            <div className="h-full bg-[#222936] transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {/* Optional Compression + Legacy URL */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="inline-flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            checked={compress}
            onChange={(e) => setCompress(e.target.checked)}
            className="rounded border-gray-300"
          />
          <span>{isRTL ? 'ضغط الصورة تلقائياً قبل الرفع' : 'Compress image before upload'}</span>
        </label>
      </div>

      {/* Bilingual Alt Text */}
      {hasImage && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <input
            value={thumbnailImage?.alt || ''}
            onChange={(e) =>
              onChange?.({
                thumbnailImage: { ...(thumbnailImage || { publicId: '' }), alt: e.target.value },
                legacyUrl
              })
            }
            placeholder="Alt text (English)"
            dir="ltr"
            className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs"
          />
          <input
            value={thumbnailImage?.altAr || ''}
            onChange={(e) =>
              onChange?.({
                thumbnailImage: { ...(thumbnailImage || { publicId: '' }), altAr: e.target.value },
                legacyUrl
              })
            }
            placeholder="النص البديل (بالعربية)"
            dir="rtl"
            className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs"
          />
        </div>
      )}

      {missingAlt && (
        <div className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
          <span>
            {isRTL
              ? 'تنبيه: يُفضّل إضافة نص بديل (Alt) بالعربية أو الإنجليزية لتحسين الوصول ومحركات البحث.'
              : 'Warning: Please add English or Arabic alt text for accessibility and SEO.'}
          </span>
        </div>
      )}

      <MediaLibraryModal
        open={libraryOpen}
        onClose={() => setLibraryOpen(false)}
        mode="picker"
        defaultPurpose="thumbnail"
        onSelect={(img) => {
          onChange?.({
            thumbnailImage: {
              publicId: img.publicId,
              width: img.width,
              height: img.height,
              alt: img.alt || '',
              altAr: img.altAr || ''
            },
            legacyUrl: img.secureUrl || legacyUrl
          })
        }}
      />
    </div>
  )
}
