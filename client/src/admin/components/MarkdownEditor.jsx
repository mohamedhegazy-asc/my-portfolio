import React, { useRef, useState } from 'react'
import { Heading2, Bold, List, Table, FileSpreadsheet, Database, Code2, Sigma, Image, Paperclip, Eye } from 'lucide-react'
import RichContent from '../../components/content/RichContent'
import MediaLibraryModal from './MediaLibraryModal'
import { uploadToCloudinarySigned } from '../../services/api'
import { validateImageFile, compressImageFile } from '../../utils/imageCompression'
import { formatCldImageUrl } from '../../utils/cldMarkdown'
import { useLang } from '../../i18n/LanguageContext'
import { t } from '../../i18n/translations'
import { useToast } from './Toast'

export default function MarkdownEditor({
  value = '',
  onChange,
  assets = [],
  maxLength,
  onUploadingChange
}) {
  const { lang, isRTL } = useLang()
  const { addToast } = useToast()
  const ref = useRef(null)
  const latestValueRef = useRef(value)
  latestValueRef.current = value

  const [showPreview, setShowPreview] = useState(true)
  const [assetMenuOpen, setAssetMenuOpen] = useState(false)
  const [mediaOpen, setMediaOpen] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(null)
  const [draggingOver, setDraggingOver] = useState(false)

  const insertSnippet = (snippet) => {
    const el = ref.current
    const current = latestValueRef.current || ''
    if (!el) {
      onChange(`${current}\n${snippet}`)
      return
    }
    const start = el.selectionStart ?? current.length
    const end = el.selectionEnd ?? current.length
    const next = current.slice(0, start) + snippet + current.slice(end)
    onChange(next)
    setTimeout(() => {
      el.focus()
      el.setSelectionRange(start + snippet.length, start + snippet.length)
    }, 0)
  }

  const handleInlineImageFile = async (file) => {
    if (!file) return
    const check = validateImageFile(file)
    if (!check.valid) {
      addToast(check.error, 'error')
      return
    }

    const token = `uploading-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    const placeholder = `\n![Uploading ${file.name}...](${token})\n`
    insertSnippet(placeholder)

    setUploadProgress(5)
    onUploadingChange?.(true)

    try {
      const compressed = await compressImageFile(file)
      const registered = await uploadToCloudinarySigned(compressed, {
        purpose: 'inline',
        onProgress: setUploadProgress
      })
      const altText = registered.alt || file.name.replace(/\.[^.]+$/, '')
      const cldUrl = formatCldImageUrl(registered.publicId, { ar: '16:9', w: 100, align: 'center' })
      const cldMarkdown = `\n![${altText}](${cldUrl})\n`
      onChange((latestValueRef.current || '').replace(placeholder, cldMarkdown))
      addToast(isRTL ? 'تم رفع الصورة وإدراجها' : 'Image uploaded and inserted')
    } catch (err) {
      onChange((latestValueRef.current || '').replace(placeholder, ''))
      addToast(err.message, 'error')
    } finally {
      setUploadProgress(null)
      onUploadingChange?.(false)
    }
  }

  const handlePaste = (e) => {
    const files = Array.from(e.clipboardData?.files || [])
    const imgFile = files.find((f) => f.type?.startsWith('image/'))
    if (imgFile) {
      e.preventDefault()
      handleInlineImageFile(imgFile)
    }
  }

  const handleDrop = (e) => {
    const files = Array.from(e.dataTransfer?.files || [])
    const imgFile = files.find((f) => f.type?.startsWith('image/'))
    setDraggingOver(false)
    if (imgFile) {
      e.preventDefault()
      handleInlineImageFile(imgFile)
    }
  }

  const tools = [
    { icon: Heading2, label: 'Heading', snippet: '\n## Heading\n' },
    { icon: Bold, label: 'Bold', snippet: '**bold text**' },
    { icon: List, label: 'List', snippet: '\n- Item 1\n- Item 2\n' },
    { icon: Table, label: 'Table', snippet: '\n| Column 1 | Column 2 |\n|---|---|\n| Value 1 | Value 2 |\n' },
    { icon: FileSpreadsheet, label: 'Excel', snippet: '\n```excel title="Formula title"\n=SUM(B2:B20)\n```\n\n> شرح المعادلة هنا\n' },
    { icon: Database, label: 'SQL', snippet: '\n```sql title="Query title"\nSELECT * FROM table_name LIMIT 10;\n```\n' },
    { icon: Code2, label: 'Python', snippet: '\n```python title="Python snippet"\nimport pandas as pd\ndf.head()\n```\n' },
    { icon: Sigma, label: 'Math', snippet: '\n$$\n\\bar{x} = \\frac{1}{n}\\sum_{i=1}^{n} x_i\n$$\n' },
  ]

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-gray-50 border-b border-gray-200">
        <div className="flex flex-wrap items-center gap-1 relative">
          {tools.map((tool) => {
            const Icon = tool.icon
            return (
              <button
                key={tool.label}
                type="button"
                onClick={() => insertSnippet(tool.snippet)}
                title={tool.label}
                className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-semibold text-gray-700 hover:bg-gray-200/70 cursor-pointer"
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{tool.label}</span>
              </button>
            )
          })}

          <button
            type="button"
            onClick={() => setMediaOpen(true)}
            title={isRTL ? 'إدراج صورة من المكتبة' : 'Insert Image'}
            className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-semibold text-gray-700 hover:bg-gray-200/70 cursor-pointer"
          >
            <Image className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isRTL ? 'صورة' : 'Image'}</span>
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setAssetMenuOpen((v) => !v)}
              className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-semibold text-[#222936] bg-[#E0F6C4] hover:bg-[#B9D895] cursor-pointer"
            >
              <Paperclip className="w-3.5 h-3.5" />
              <span>Embed File</span>
            </button>
            {assetMenuOpen && (
              <div className="absolute top-full start-0 mt-1 z-30 w-56 bg-white border border-gray-200 rounded-xl shadow-xl p-1.5 max-h-48 overflow-y-auto">
                {assets.length === 0 ? (
                  <p className="text-[11px] text-gray-400 p-2">No uploaded files yet</p>
                ) : (
                  assets.map((a) => (
                    <button
                      key={a._id}
                      type="button"
                      onClick={() => {
                        insertSnippet(`\n\`\`\`asset\nid: ${a._id}\n\`\`\`\n`)
                        setAssetMenuOpen(false)
                      }}
                      className="w-full text-start px-2.5 py-1.5 rounded-lg text-xs hover:bg-gray-100 truncate cursor-pointer"
                    >
                      {a.title} ({a.kind})
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowPreview((v) => !v)}
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
            showPreview ? 'bg-[#222936] text-[#B9D895]' : 'border border-gray-200 text-gray-600'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>{t(lang, 'adminP5.splitPreview')}</span>
        </button>
      </div>

      {uploadProgress !== null && (
        <div className="px-3 py-1.5 bg-[#E0F6C4]/40 border-b border-gray-200">
          <div className="flex justify-between text-[11px] text-[#222936] font-medium mb-1">
            <span>{isRTL ? 'جارٍ رفع الصورة...' : 'Uploading inline image...'}</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="h-1 w-full rounded-full bg-gray-200 overflow-hidden">
            <div className="h-full bg-[#222936] transition-all" style={{ width: `${uploadProgress}%` }} />
          </div>
        </div>
      )}

      {/* Split Editor / Live Preview */}
      <div className={`grid grid-cols-1 ${showPreview ? 'lg:grid-cols-2' : ''} divide-y lg:divide-y-0 lg:divide-x divide-gray-200`}>
        <textarea
          ref={ref}
          rows={14}
          value={value}
          maxLength={maxLength}
          onChange={(e) => onChange(e.target.value)}
          onPaste={handlePaste}
          onDragOver={(e) => {
            if (Array.from(e.dataTransfer?.types || []).includes('Files')) {
              e.preventDefault()
              setDraggingOver(true)
            }
          }}
          onDragLeave={() => setDraggingOver(false)}
          onDrop={handleDrop}
          dir="auto"
          className={`w-full p-4 text-xs sm:text-sm font-mono text-[#222936] outline-none resize-y min-h-[320px] ${
            draggingOver ? 'bg-[#B9D895]/15' : ''
          }`}
          placeholder="Write Markdown, paste or drop images, ```excel formulas, ```sql queries, $math$, or ```asset embeds..."
        />
        {showPreview && (
          <div className="p-4 sm:p-6 bg-[#222936] text-[#E0F6C4] max-h-[460px] overflow-y-auto">
            <RichContent content={value} theme="dark" />
          </div>
        )}
      </div>

      {maxLength && (
        <div className="px-3 py-1.5 bg-gray-50 border-t border-gray-200 text-[11px] text-gray-500 text-end">
          {(value || '').length} / {maxLength}
        </div>
      )}

      <MediaLibraryModal
        open={mediaOpen}
        onClose={() => setMediaOpen(false)}
        mode="markdown"
        defaultPurpose="inline"
        onSelect={({ image, alt, caption, width, alignment, aspectRatio }) => {
          const safeTitle = caption ? ` "${caption.replace(/"/g, '\\"')}"` : ''
          const cldUrl = formatCldImageUrl(image.publicId, {
            ar: aspectRatio || '16:9',
            w: width || 100,
            align: alignment || 'center'
          })
          const snippet = `\n![${alt}](${cldUrl}${safeTitle})\n`
          insertSnippet(snippet)
        }}
      />
    </div>
  )
}
