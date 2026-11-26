import React, { useState, useRef } from 'react'
import { Upload, FolderOpen, ArrowUp, ArrowDown, X } from 'lucide-react'
import { uploadToCloudinarySigned } from '../../services/api'
import { validateImageFile, compressImageFile } from '../../utils/imageCompression'
import CloudImage from '../../components/media/CloudImage'
import MediaLibraryModal from './MediaLibraryModal'
import { useLang } from '../../i18n/LanguageContext'
import { useToast } from './Toast'

export default function GalleryManager({ gallery = [], onChange, onUploadingChange }) {
  const { isRTL } = useLang()
  const { addToast } = useToast()
  const fileRef = useRef(null)

  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [libraryOpen, setLibraryOpen] = useState(false)

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList || [])
    if (files.length === 0) return

    if (gallery.length + files.length > 20) {
      addToast(isRTL ? 'الحد الأقصى للمعرض 20 صورة' : 'Gallery cannot exceed 20 images', 'error')
      return
    }

    setUploading(true)
    onUploadingChange?.(true)
    const added = []

    try {
      for (const file of files) {
        const check = validateImageFile(file)
        if (!check.valid) {
          addToast(`${file.name}: ${check.error}`, 'error')
          continue
        }
        setProgress(10)
        const compressed = await compressImageFile(file)
        const img = await uploadToCloudinarySigned(compressed, {
          purpose: 'gallery',
          onProgress: setProgress
        })
        added.push({
          publicId: img.publicId,
          width: img.width,
          height: img.height,
          alt: img.alt || '',
          altAr: img.altAr || '',
          caption: '',
          captionAr: ''
        })
      }
      if (added.length > 0) {
        onChange?.([...gallery, ...added])
        addToast(isRTL ? `تمت إضافة ${added.length} صورة للمعرض` : `Added ${added.length} image(s) to gallery`)
      }
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setUploading(false)
      onUploadingChange?.(false)
      setProgress(0)
    }
  }

  const move = (idx, dir) => {
    const target = idx + dir
    if (target < 0 || target >= gallery.length) return
    const next = [...gallery]
    ;[next[idx], next[target]] = [next[target], next[idx]]
    onChange?.(next)
  }

  const updateItem = (idx, patch) => {
    const next = gallery.map((item, i) => (i === idx ? { ...item, ...patch } : item))
    onChange?.(next)
  }

  const removeItem = (idx) => {
    onChange?.(gallery.filter((_, i) => i !== idx))
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={uploading || gallery.length >= 20}
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#222936] text-[#B9D895] text-xs font-bold cursor-pointer disabled:opacity-50"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>{uploading ? `${progress}%` : (isRTL ? 'رفع صور للمعرض' : 'Upload Gallery Images')}</span>
        </button>

        <button
          type="button"
          disabled={gallery.length >= 20}
          onClick={() => setLibraryOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-700 cursor-pointer disabled:opacity-50"
        >
          <FolderOpen className="w-3.5 h-3.5" />
          <span>{isRTL ? 'إضافة من المكتبة' : 'Add from Library'}</span>
        </button>

        <span className="text-[11px] text-gray-400">
          {gallery.length} / 20
        </span>
      </div>

      <input
        ref={fileRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files)
          e.target.value = ''
        }}
      />

      {gallery.length > 0 && (
        <div className="space-y-2.5">
          {gallery.map((item, idx) => (
            <div key={`${item.publicId}-${idx}`} className="rounded-xl border border-gray-200 bg-white p-3 space-y-2">
              <div className="flex items-start gap-3">
                <div className="w-24 aspect-video rounded-lg overflow-hidden bg-gray-100 shrink-0">
                  <CloudImage
                    publicId={item.publicId}
                    preset="card"
                    sizes="96px"
                    alt={item.alt}
                    altAr={item.altAr}
                    wrapperClassName="w-full h-full relative overflow-hidden"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  <input
                    value={item.alt || ''}
                    onChange={(e) => updateItem(idx, { alt: e.target.value })}
                    placeholder="Alt (English)"
                    dir="ltr"
                    className="px-2.5 py-1 rounded-lg border border-gray-200 text-xs"
                  />
                  <input
                    value={item.altAr || ''}
                    onChange={(e) => updateItem(idx, { altAr: e.target.value })}
                    placeholder="النص البديل (عربي)"
                    dir="rtl"
                    className="px-2.5 py-1 rounded-lg border border-gray-200 text-xs"
                  />
                  <input
                    value={item.caption || ''}
                    onChange={(e) => updateItem(idx, { caption: e.target.value })}
                    placeholder="Caption (English)"
                    dir="ltr"
                    className="px-2.5 py-1 rounded-lg border border-gray-200 text-xs"
                  />
                  <input
                    value={item.captionAr || ''}
                    onChange={(e) => updateItem(idx, { captionAr: e.target.value })}
                    placeholder="التعليق (عربي)"
                    dir="rtl"
                    className="px-2.5 py-1 rounded-lg border border-gray-200 text-xs"
                  />
                </div>

                <div className="flex flex-col gap-1 shrink-0">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => move(idx, -1)}
                    className="p-1 rounded-lg hover:bg-gray-100 text-gray-500 disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === gallery.length - 1}
                    onClick={() => move(idx, 1)}
                    className="p-1 rounded-lg hover:bg-gray-100 text-gray-500 disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    className="p-1 rounded-lg hover:bg-red-50 text-red-500 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <MediaLibraryModal
        open={libraryOpen}
        onClose={() => setLibraryOpen(false)}
        mode="picker"
        defaultPurpose="gallery"
        onSelect={(img) => {
          if (gallery.length >= 20) return
          onChange?.([
            ...gallery,
            {
              publicId: img.publicId,
              width: img.width,
              height: img.height,
              alt: img.alt || '',
              altAr: img.altAr || '',
              caption: '',
              captionAr: ''
            }
          ])
        }}
      />
    </div>
  )
}
