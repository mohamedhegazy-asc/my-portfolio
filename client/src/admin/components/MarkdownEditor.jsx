import React, { useRef, useState } from 'react'
import { Heading2, Bold, List, Table, FileSpreadsheet, Database, Code2, Sigma, Image, Paperclip, Eye } from 'lucide-react'
import RichContent from '../../components/content/RichContent'
import { useLang } from '../../i18n/LanguageContext'
import { t } from '../../i18n/translations'

export default function MarkdownEditor({ value = '', onChange, assets = [] }) {
  const { lang } = useLang()
  const ref = useRef(null)
  const [showPreview, setShowPreview] = useState(true)
  const [assetMenuOpen, setAssetMenuOpen] = useState(false)

  const insertSnippet = (snippet) => {
    const el = ref.current
    if (!el) {
      onChange(`${value}\n${snippet}`)
      return
    }
    const start = el.selectionStart ?? value.length
    const end = el.selectionEnd ?? value.length
    const next = value.slice(0, start) + snippet + value.slice(end)
    onChange(next)
    setTimeout(() => {
      el.focus()
      el.setSelectionRange(start + snippet.length, start + snippet.length)
    }, 0)
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
    { icon: Image, label: 'Image', snippet: '\n![Image caption](https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80)\n' },
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

      {/* Split Editor / Live Preview */}
      <div className={`grid grid-cols-1 ${showPreview ? 'lg:grid-cols-2' : ''} divide-y lg:divide-y-0 lg:divide-x divide-gray-200`}>
        <textarea
          ref={ref}
          rows={14}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          dir="auto"
          className="w-full p-4 text-xs sm:text-sm font-mono text-[#222936] outline-none resize-y min-h-[320px]"
          placeholder="Write Markdown, ```excel formulas, ```sql queries, $math$, or ```asset embeds..."
        />
        {showPreview && (
          <div className="p-4 sm:p-6 bg-[#222936] text-[#E0F6C4] max-h-[460px] overflow-y-auto">
            <RichContent content={value} theme="dark" />
          </div>
        )}
      </div>
    </div>
  )
}
