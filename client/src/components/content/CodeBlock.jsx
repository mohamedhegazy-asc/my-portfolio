import React, { useState } from 'react'
import { Copy, Check, Hash } from 'lucide-react'
import { useLang } from '../../i18n/LanguageContext'
import { t } from '../../i18n/translations'

const LANGUAGE_LABELS = {
  excel: 'Excel Formula',
  formula: 'Excel Formula',
  dax: 'DAX Formula',
  sql: 'SQL',
  python: 'Python',
  javascript: 'JavaScript',
  js: 'JavaScript',
  json: 'JSON',
  bash: 'Bash',
  sh: 'Bash',
  plaintext: 'Plaintext',
  text: 'Plaintext',
}

export default function CodeBlock({
  language = '',
  title = '',
  rawCode = '',
  children,
  defaultLineNumbers = false
}) {
  const { lang } = useLang()
  const [copied, setCopied] = useState(false)
  const [showLineNumbers, setShowLineNumbers] = useState(defaultLineNumbers)

  const normLang = String(language || '').toLowerCase()
  const isFormula = ['excel', 'formula', 'dax'].includes(normLang)
  const langLabel = LANGUAGE_LABELS[normLang] || (normLang ? normLang.toUpperCase() : 'Code')

  const codeToCopy = rawCode || (typeof children === 'string' ? children : '')
  const lines = codeToCopy.replace(/\n$/, '').split('\n')

  const handleCopy = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(codeToCopy)
      } else {
        const ta = document.createElement('textarea')
        ta.value = codeToCopy
        ta.setAttribute('readonly', '')
        ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0'
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  return (
    <div
      className="my-5 rounded-xl overflow-hidden border border-[#374159] bg-[#181f2c] shadow-lg"
      dir="ltr"
    >
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-[#1a2130] border-b border-[#374159]">
        <div className="flex items-center gap-2 min-w-0">
          {isFormula && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#B9D895]/20 text-[#B9D895] border border-[#B9D895]/40 shrink-0">
              fx
            </span>
          )}
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#B9D895] shrink-0">
            {langLabel}
          </span>
          {title && (
            <>
              <span className="text-[#374159]">•</span>
              <span className="text-xs font-medium text-[#E0F6C4]/85 truncate" dir="auto">
                {title}
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowLineNumbers(v => !v)}
            title={t(lang, 'content.lineNumbers')}
            aria-label={t(lang, 'content.lineNumbers')}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] border transition-colors cursor-pointer ${
              showLineNumbers
                ? 'border-[#B9D895]/60 text-[#B9D895] bg-[#B9D895]/10'
                : 'border-[#374159] text-[#E0F6C4]/60 hover:text-white'
            }`}
          >
            <Hash className="w-3 h-3" />
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md border border-[#374159] hover:border-[#B9D895] text-xs font-semibold text-[#E0F6C4]/85 hover:text-[#B9D895] transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#B9D895]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? t(lang, 'content.copiedCode') : t(lang, 'content.copyCode')}</span>
          </button>
          <span className="sr-only" aria-live="polite">
            {copied ? t(lang, 'content.copiedCode') : ''}
          </span>
        </div>
      </div>

      {/* Code Body */}
      <div className="overflow-x-auto p-4 text-sm font-mono leading-relaxed text-[#E0F6C4]/95">
        <div className="flex min-w-max">
          {showLineNumbers && (
            <div
              aria-hidden="true"
              className="select-none pr-4 mr-4 border-r border-[#374159]/60 text-right text-[#E0F6C4]/35 text-xs leading-relaxed"
            >
              {lines.map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
          )}
          <pre className="m-0 p-0 bg-transparent flex-1">
            <code className={`language-${normLang || 'plaintext'} block`}>
              {children ?? codeToCopy}
            </code>
          </pre>
        </div>
      </div>
    </div>
  )
}
