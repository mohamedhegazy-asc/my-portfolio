import React, { useState, useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import rehypeHighlight from 'rehype-highlight'
import 'katex/dist/katex.min.css'

import excel from 'highlight.js/lib/languages/excel'
import sql from 'highlight.js/lib/languages/sql'
import python from 'highlight.js/lib/languages/python'
import javascript from 'highlight.js/lib/languages/javascript'
import json from 'highlight.js/lib/languages/json'
import bash from 'highlight.js/lib/languages/bash'
import plaintext from 'highlight.js/lib/languages/plaintext'

import CodeBlock from './CodeBlock'
import { InlineAssetEmbed } from '../viewers/AttachmentsSection'
import CloudImage from '../media/CloudImage'
import Lightbox from '../media/Lightbox'
import {
  safeMarkdownUrlTransform,
  parseCldImageUrl,
  extractInlineImageGroups
} from '../../utils/cldMarkdown'
import { useLang } from '../../i18n/LanguageContext'
import { t } from '../../i18n/translations'

const SUPPORTED_LANGUAGES = {
  excel,
  formula: excel,
  dax: excel,
  sql,
  python,
  javascript,
  js: javascript,
  json,
  bash,
  sh: bash,
  plaintext,
  text: plaintext,
}

// Extract plain text recursively from React children or hast nodes
function extractPlainText(node) {
  if (node == null) return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(extractPlainText).join('')
  if (node.type === 'text') return node.value || ''
  if (node.props?.children !== undefined) return extractPlainText(node.props.children)
  if (node.children) return extractPlainText(node.children)
  return ''
}

export function slugifyHeading(text = '') {
  return String(text)
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export function extractHeadings(markdown = '') {
  const headings = []
  const lines = String(markdown).split(/\r?\n/)
  let inFence = false
  for (const line of lines) {
    if (/^```/.test(line.trim())) {
      inFence = !inFence
      continue
    }
    if (inFence) continue
    const match = /^(#{2,3})\s+(.+)$/.exec(line.trim())
    if (match) {
      const level = match[1].length
      const text = match[2].replace(/[*_`~]/g, '').trim()
      if (text) {
        headings.push({ level, text, id: slugifyHeading(text) })
      }
    }
  }
  return headings
}

export function computeReadTime(markdown = '', lang = 'en') {
  const plain = String(markdown)
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[#*_`>\[\]()!$-]/g, ' ')
    .trim()
  const words = plain ? plain.split(/\s+/).length : 0
  const mins = Math.max(1, Math.ceil(words / 200))
  return lang === 'ar' ? `${mins} دقائق قراءة` : `${mins} min read`
}

// Remark plugin: marks a blockquote immediately following a fenced code block as an explanation note
function remarkCodeExplanation() {
  return (tree) => {
    if (!tree?.children) return
    for (let i = 1; i < tree.children.length; i++) {
      const prev = tree.children[i - 1]
      const curr = tree.children[i]
      if (prev.type === 'code' && curr.type === 'blockquote') {
        curr.data = curr.data || {}
        curr.data.hProperties = {
          ...(curr.data.hProperties || {}),
          'data-explanation': 'true'
        }
      }
    }
  }
}

function InlineCodePill({ children }) {
  const { lang } = useLang()
  const [copied, setCopied] = useState(false)
  const text = extractPlainText(children)

  const handleCopy = () => {
    if (!text) return
    navigator.clipboard?.writeText(text).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }

  return (
    <code
      onClick={handleCopy}
      title={copied ? t(lang, 'content.copiedCode') : t(lang, 'content.copyInlineHint')}
      className="inline-block px-1.5 py-0.5 mx-0.5 rounded-md bg-[#374159] text-[#B9D895] font-mono text-[0.85em] border border-[#B9D895]/20 hover:border-[#B9D895]/60 cursor-pointer transition-colors"
      dir="ltr"
    >
      {copied ? '✓ ' : ''}
      {children}
    </code>
  )
}

export default function RichContent({ content = '', theme = 'dark' }) {
  const { lang } = useLang()
  const isLight = theme === 'light'
  const [lightboxState, setLightboxState] = useState(null)

  const imageGroups = useMemo(() => extractInlineImageGroups(content), [content])
  let renderImageCounter = 0
  const flatImageLocations = useMemo(() => {
    const locs = []
    for (let g = 0; g < imageGroups.length; g++) {
      for (let idx = 0; idx < imageGroups[g].length; idx++) {
        locs.push({ group: imageGroups[g], index: idx })
      }
    }
    return locs
  }, [imageGroups])

  const textColor = isLight ? 'text-[#222936]/90' : 'text-[#E0F6C4]/90'
  const headingColor = isLight ? 'text-[#222936]' : 'text-white'
  const subHeadingColor = isLight ? 'text-[#374159]' : 'text-[#B9D895]'

  return (
    <div className="rich-content space-y-2" dir="auto">
      <ReactMarkdown
        urlTransform={safeMarkdownUrlTransform}
        remarkPlugins={[remarkGfm, remarkMath, remarkCodeExplanation]}
        rehypePlugins={[
          rehypeKatex,
          [rehypeHighlight, { languages: SUPPORTED_LANGUAGES, ignoreMissing: true }]
        ]}
        components={{
          h1: ({ children }) => (
            <h1 className={`text-2xl sm:text-3xl font-black font-serif ${headingColor} mt-8 mb-4 leading-tight`} dir="auto">
              {children}
            </h1>
          ),
          h2: ({ children }) => {
            const id = slugifyHeading(extractPlainText(children))
            return (
              <h2
                id={id}
                className={`scroll-mt-24 text-xl sm:text-2xl font-bold font-serif ${headingColor} mt-8 mb-3 pb-2 border-b ${isLight ? 'border-[#222936]/15' : 'border-[#374159]/70'}`}
                dir="auto"
              >
                {children}
              </h2>
            )
          },
          h3: ({ children }) => {
            const id = slugifyHeading(extractPlainText(children))
            return (
              <h3
                id={id}
                className={`scroll-mt-24 text-lg sm:text-xl font-bold ${subHeadingColor} mt-6 mb-2`}
                dir="auto"
              >
                {children}
              </h3>
            )
          },
          h4: ({ children }) => (
            <h4 className={`text-base sm:text-lg font-semibold ${headingColor} mt-5 mb-2`} dir="auto">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className={`${textColor} leading-[1.85] mb-4 text-sm sm:text-base`} dir="auto">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className={`list-disc list-inside space-y-1.5 mb-4 ps-3 ${textColor} text-sm sm:text-base`} dir="auto">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className={`list-decimal list-inside space-y-1.5 mb-4 ps-3 ${textColor} text-sm sm:text-base`} dir="auto">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed">{children}</li>
          ),
          blockquote: ({ node, children }) => {
            const isExplanation = node?.properties?.['data-explanation'] === 'true'
            if (isExplanation) {
              return (
                <blockquote
                  className="border-s-4 border-[#B9D895] bg-[#B9D895]/10 rounded-e-xl px-4 py-3 mb-5 text-sm text-[#E0F6C4]/95"
                  dir="auto"
                >
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-[#B9D895] mb-1">
                    {t(lang, 'content.explanationLabel')}
                  </span>
                  <div className="[&>p]:mb-0">{children}</div>
                </blockquote>
              )
            }
            return (
              <blockquote
                className={`border-s-4 border-[#B9D895] ${isLight ? 'bg-[#222936]/5 text-[#222936]/85' : 'bg-[#374159]/35 text-[#E0F6C4]/85'} rounded-e-xl px-5 py-3.5 my-5 italic`}
                dir="auto"
              >
                {children}
              </blockquote>
            )
          },
          table: ({ children }) => (
            <div className="overflow-x-auto my-6 rounded-xl border border-[#374159]">
              <table className="w-full text-xs sm:text-sm text-[#E0F6C4]/90 bg-[#222936]">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-[#1a2130] text-[#B9D895] font-bold">{children}</thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-[#374159]/60">{children}</tbody>
          ),
          tr: ({ children }) => (
            <tr className="even:bg-[#374159]/20">{children}</tr>
          ),
          th: ({ children }) => (
            <th className="px-4 py-2.5 text-start font-semibold whitespace-nowrap">{children}</th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-2.5">{children}</td>
          ),
          hr: () => (
            <hr className={`my-8 ${isLight ? 'border-[#222936]/15' : 'border-[#374159]/70'}`} />
          ),
          pre: ({ children }) => {
            const child = Array.isArray(children) ? children[0] : children
            const childProps = child?.props || {}
            const className = childProps.className || ''
            const langMatch = /language-([a-zA-Z0-9_-]+)/.exec(className)
            const language = langMatch ? langMatch[1] : 'plaintext'
            const rawText = extractPlainText(childProps.children)

            // Support ```asset id: <assetId>``` inline embed
            if (language.toLowerCase() === 'asset') {
              const idMatch = /\bid:\s*([a-zA-Z0-9_-]+)/.exec(rawText)
              if (idMatch) {
                return <InlineAssetEmbed assetId={idMatch[1]} />
              }
            }

            // Extract optional title="..." from fence meta
            const meta = childProps?.node?.data?.meta || ''
            const titleMatch = /title="([^"]+)"/.exec(meta)
            const title = titleMatch ? titleMatch[1] : ''

            return (
              <CodeBlock language={language} title={title} rawCode={rawText}>
                {childProps.children}
              </CodeBlock>
            )
          },
          code: ({ className, children }) => {
            const isBlock = Boolean(className && className.includes('language-'))
            if (isBlock) {
              return <code className={className}>{children}</code>
            }
            return <InlineCodePill>{children}</InlineCodePill>
          },
          img: ({ src, alt, title }) => {
            const loc = flatImageLocations[renderImageCounter++]
            const openGalleryLightbox = () => {
              if (loc) {
                setLightboxState({ items: loc.group, index: loc.index })
              } else if (src) {
                const cld = parseCldImageUrl(src)
                setLightboxState({
                  items: [{ publicId: cld?.publicId || '', src, alt: alt || '', caption: title || '' }],
                  index: 0
                })
              }
            }

            const cld = typeof src === 'string' ? parseCldImageUrl(src) : null
            if (cld) {
              const widthClass =
                cld.widthPct === 50
                  ? 'w-full md:w-1/2'
                  : cld.widthPct === 75
                    ? 'w-full md:w-3/4'
                    : 'w-full'
              const alignClass =
                cld.align === 'start'
                  ? 'me-auto'
                  : cld.align === 'end'
                    ? 'ms-auto'
                    : 'mx-auto'
              const caption = title || ''

              return (
                <figure className={`my-6 ${widthClass} ${alignClass}`}>
                  <CloudImage
                    publicId={cld.publicId}
                    preset="inline"
                    sizes={
                      cld.widthPct === 50
                        ? '(max-width: 767px) 100vw, 50vw'
                        : cld.widthPct === 75
                          ? '(max-width: 767px) 100vw, 75vw'
                          : '(max-width: 767px) 100vw, 896px'
                    }
                    alt={alt || ''}
                    onClick={openGalleryLightbox}
                    style={{ aspectRatio: cld.aspectRatio }}
                    wrapperClassName="w-full rounded-xl border border-[#374159]/60 shadow-lg overflow-hidden bg-[#1b2230] cursor-zoom-in"
                    className="w-full h-full object-cover"
                  />
                  {caption && (
                    <figcaption className={`text-center text-xs mt-2 ${isLight ? 'text-[#222936]/70' : 'text-[#E0F6C4]/55'}`}>
                      {caption}
                    </figcaption>
                  )}
                </figure>
              )
            }

            return (
              <figure className="my-6 w-full mx-auto">
                <CloudImage
                  fallbackUrl={src || ''}
                  preset="inline"
                  sizes="(max-width: 767px) 100vw, 896px"
                  alt={alt || ''}
                  onClick={src ? openGalleryLightbox : undefined}
                  wrapperClassName={`w-full rounded-xl border border-[#374159]/60 shadow-lg overflow-hidden bg-[#1b2230] ${src ? 'cursor-zoom-in' : ''}`}
                  className="w-full h-auto max-h-[520px] object-cover"
                />
                {(title || alt) && (
                  <figcaption className={`text-center text-xs mt-2 ${isLight ? 'text-[#222936]/70' : 'text-[#E0F6C4]/55'}`}>
                    {title || alt}
                  </figcaption>
                )}
              </figure>
            )
          },
          a: ({ href, children }) => {
            const isExternal = /^https?:\/\//i.test(href || '')
            return (
              <a
                href={href}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer nofollow' : undefined}
                className={`${isLight ? 'text-[#222936] font-semibold' : 'text-[#B9D895]'} underline hover:opacity-80`}
              >
                {children}
              </a>
            )
          },
          strong: ({ children }) => (
            <strong className={`font-bold ${headingColor}`}>{children}</strong>
          ),
        }}
      >
        {content}
      </ReactMarkdown>

      {lightboxState && (
        <Lightbox
          items={lightboxState.items}
          initialIndex={lightboxState.index}
          onClose={() => setLightboxState(null)}
        />
      )}
    </div>
  )
}
