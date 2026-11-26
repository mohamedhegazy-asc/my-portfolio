import React, { useEffect, useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Clock, Eye, Share2, ArrowLeft, ArrowRight, List, ChevronDown } from 'lucide-react'
import { fetchArticleBySlug } from '../services/api'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useLang } from '../i18n/LanguageContext'
import { t } from '../i18n/translations'
import { DarkSwal } from '../utils/alerts'
import { formatPublishDateTime } from '../utils/date'
import { resolveThumbnailSource } from '../utils/imageDisplay'
import CloudImage from '../components/media/CloudImage'
import Lightbox from '../components/media/Lightbox'
import AttachmentsSection from '../components/viewers/AttachmentsSection'
import RichContent, { extractHeadings, computeReadTime } from '../components/content/RichContent'

export default function ArticleDetailPage({ profile, onOpenContact }) {
  const { slug } = useParams()
  const { lang, isRTL } = useLang()
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [readProgress, setReadProgress] = useState(0)
  const [mobileTocOpen, setMobileTocOpen] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    let isMounted = true

    async function loadArticle() {
      setLoading(true)
      try {
        const data = await fetchArticleBySlug(slug)
        if (isMounted) setArticle(data)
      } catch (err) {
        console.error("Failed to load article:", err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadArticle()
    return () => { isMounted = false }
  }, [slug])

  useEffect(() => {
    const handleScroll = () => {
      const doc = document.documentElement
      const total = doc.scrollHeight - doc.clientHeight
      if (total <= 0) {
        setReadProgress(0)
        return
      }
      setReadProgress(Math.min(100, Math.max(0, (window.scrollY / total) * 100)))
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (article?.title) {
      document.title = `${article.title} | ${isRTL ? 'محمد حجازي' : (profile?.name || 'Mohamed Hegazy')}`
    }
  }, [article, profile, isRTL])

  const headings = useMemo(() => extractHeadings(article?.content || ''), [article?.content])
  const estimatedReadTime = useMemo(() => computeReadTime(article?.content || '', lang), [article?.content, lang])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#222936] flex items-center justify-center text-[#E0F6C4]">
        <div className="w-8 h-8 border-3 border-[#B9D895] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-[#222936] text-[#E0F6C4] flex flex-col items-center justify-center p-6 space-y-4">
        <h2 className="text-2xl font-bold">{isRTL ? 'المقال غير موجود' : 'Article Not Found'}</h2>
        <Link to="/" className="px-5 py-2.5 rounded-full bg-[#B9D895] text-[#222936] font-semibold text-sm">
          {isRTL ? 'العودة للرئيسية' : 'Return to Homepage'}
        </Link>
      </div>
    )
  }

  const authorName = isRTL ? 'محمد محمود حجازي' : (article.author || profile?.name || "Mohamed Hegazy")
  const hasToc = headings.length >= 2

  return (
    <div className="min-h-screen bg-[#222936] text-[#E0F6C4] flex flex-col justify-between selection:bg-[#B9D895] selection:text-[#222936]">
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-[#374159]/30 pointer-events-none">
        <div
          className="h-full bg-[#B9D895] transition-all duration-150"
          style={{ width: `${readProgress}%` }}
        />
      </div>

      <Navbar profile={profile} onOpenContact={onOpenContact} />

      <main className={`${hasToc ? 'max-w-6xl' : 'max-w-4xl'} mx-auto px-6 md:px-12 py-12 flex-1 w-full space-y-8`}>
        
        {/* Back Link */}
        <Link
          to="/#articles"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B9D895] hover:underline"
        >
          {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          <span>{t(lang, 'articleDetail.backBtn')}</span>
        </Link>

        {/* Header Block */}
        <div className="space-y-4 max-w-4xl">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="px-3 py-1 rounded-full font-bold bg-[#B9D895] text-[#222936]">
              {article.category}
            </span>
            <span className="text-[#E0F6C4]/70 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {estimatedReadTime}
            </span>
            <span className="text-[#E0F6C4]/70 flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" /> {article.views || 1} {isRTL ? 'مشاهدة' : 'views'}
            </span>
          </div>

          <h1 
            className="text-3xl sm:text-4xl md:text-5xl font-black font-serif text-white tracking-tight leading-tight"
            dir="auto"
          >
            {article.title}
          </h1>

          <p 
            className="text-base sm:text-lg text-[#E0F6C4]/80 leading-relaxed font-normal"
            dir="auto"
          >
            {article.excerpt}
          </p>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-2 text-xs text-[#E0F6C4]/70 border-t border-[#374159]/60">
            <span className="font-medium text-white">{isRTL ? `بواسطة: ${authorName}` : `By ${authorName}`}</span>
            <span>•</span>
            <span className="text-[#B9D895] font-semibold">{formatPublishDateTime(article.createdAt, lang)}</span>
          </div>
        </div>

        {/* Featured Cover Image */}
        {(() => {
          const cover = resolveThumbnailSource(article, 'coverImage', lang, 1280)
          if (cover.isPlaceholder) return null
          return (
            <>
              <div className="rounded-2xl overflow-hidden border border-white/10 shadow-xl max-h-[440px] bg-[#374159]">
                <CloudImage
                  publicId={cover.publicId}
                  fallbackUrl={cover.src}
                  preset="cover"
                  sizes="(max-width: 768px) 100vw, 896px"
                  width={cover.width}
                  height={cover.height}
                  alt={cover.alt}
                  altAr={cover.altAr}
                  priority={true}
                  onClick={() => setLightboxOpen(true)}
                  wrapperClassName="w-full h-full relative overflow-hidden bg-[#374159] cursor-zoom-in"
                  className="w-full h-full object-cover"
                />
              </div>
              {lightboxOpen && (
                <Lightbox
                  items={[cover]}
                  initialIndex={0}
                  onClose={() => setLightboxOpen(false)}
                />
              )}
            </>
          )
        })()}

        {/* Collapsible TOC for Mobile */}
        {hasToc && (
          <div className="lg:hidden rounded-xl bg-[#374159]/30 border border-white/10 overflow-hidden">
            <button
              type="button"
              onClick={() => setMobileTocOpen(v => !v)}
              aria-expanded={mobileTocOpen}
              className="w-full flex items-center justify-between px-4 py-3 text-xs font-bold text-[#B9D895] cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <List className="w-4 h-4" />
                {t(lang, 'content.tocTitle')}
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform ${mobileTocOpen ? 'rotate-180' : ''}`} />
            </button>
            {mobileTocOpen && (
              <nav aria-label={t(lang, 'content.tocTitle')} className="px-4 pb-3 space-y-1.5 border-t border-white/10 pt-2">
                {headings.map((h) => (
                  <a
                    key={h.id}
                    href={`#${h.id}`}
                    onClick={() => setMobileTocOpen(false)}
                    className={`block text-xs text-[#E0F6C4]/80 hover:text-[#B9D895] py-1 ${h.level === 3 ? 'ps-4 opacity-80' : 'font-semibold'}`}
                    dir="auto"
                  >
                    {h.text}
                  </a>
                ))}
              </nav>
            )}
          </div>
        )}

        {/* Main Content + Desktop Sticky TOC */}
        <div className={hasToc ? 'grid grid-cols-1 lg:grid-cols-12 gap-8 items-start' : ''}>
          <div className={`${hasToc ? 'lg:col-span-8' : ''} space-y-8 min-w-0`}>
            <div className="bg-[#374159]/25 border border-white/10 rounded-2xl p-6 sm:p-10">
              <RichContent content={article.content} theme="dark" />
            </div>

            {article.attachments && article.attachments.length > 0 && (
              <AttachmentsSection attachments={article.attachments} theme="dark" />
            )}
          </div>

          {hasToc && (
            <aside className="hidden lg:block lg:col-span-4 sticky top-24">
              <nav
                aria-label={t(lang, 'content.tocTitle')}
                className="rounded-2xl bg-[#374159]/25 border border-white/10 p-5 space-y-3"
              >
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#B9D895]">
                  <List className="w-4 h-4" />
                  <span>{t(lang, 'content.tocTitle')}</span>
                </div>
                <ul className="space-y-1.5 border-s border-[#374159] ps-3">
                  {headings.map((h) => (
                    <li key={h.id}>
                      <a
                        href={`#${h.id}`}
                        className={`block text-xs leading-relaxed text-[#E0F6C4]/75 hover:text-[#B9D895] transition-colors py-0.5 ${
                          h.level === 3 ? 'ps-3 text-[11px] opacity-80' : 'font-medium'
                        }`}
                        dir="auto"
                      >
                        {h.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="pt-8 border-t border-[#374159]/50 flex items-center justify-between">
          <Link
            to="/#articles"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#B9D895] hover:underline"
          >
            {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
            <span>{t(lang, 'articleDetail.backBtn')}</span>
          </Link>

          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: article.title, url: window.location.href })
              } else {
                navigator.clipboard.writeText(window.location.href)
                DarkSwal.fire({
                  icon: 'success',
                  title: isRTL ? 'تم نسخ الرابط' : 'Link Copied',
                  text: isRTL ? 'تم نسخ رابط المقال إلى الحافظة' : 'Article link copied to clipboard!',
                  timer: 1500,
                  showConfirmButton: false
                })
              }
            }}
            className="inline-flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-full border border-white/20 hover:border-[#B9D895] text-white hover:text-[#B9D895] transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{t(lang, 'articleDetail.share')}</span>
          </button>
        </div>

      </main>

      <Footer profile={profile} />
    </div>
  )
}
