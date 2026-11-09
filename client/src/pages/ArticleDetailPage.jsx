import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Clock, Eye, Share2, ArrowLeft, ArrowRight } from 'lucide-react'
import { fetchArticleBySlug } from '../services/api'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useLang } from '../i18n/LanguageContext'
import { t } from '../i18n/translations'
import { DarkSwal } from '../utils/alerts'
import { formatPublishDateTime } from '../utils/date'

export default function ArticleDetailPage({ profile, onOpenContact }) {
  const { slug } = useParams()
  const { lang, isRTL } = useLang()
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)

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
    if (article?.title) {
      document.title = `${article.title} | ${isRTL ? 'محمد حجازي' : (profile?.name || 'Mohamed Hegazy')}`
    }
  }, [article, profile, isRTL])

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

  return (
    <div className="min-h-screen bg-[#222936] text-[#E0F6C4] flex flex-col justify-between selection:bg-[#B9D895] selection:text-[#222936]">
      <Navbar profile={profile} onOpenContact={onOpenContact} />

      <main className="max-w-4xl mx-auto px-6 md:px-12 py-12 flex-1 w-full space-y-8">
        
        {/* Back Link */}
        <Link
          to="/#articles"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B9D895] hover:underline"
        >
          {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          <span>{t(lang, 'articleDetail.backBtn')}</span>
        </Link>

        {/* Header Block */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-xs">
            <span className="px-3 py-1 rounded-full font-bold bg-[#B9D895] text-[#222936]">
              {article.category}
            </span>
            <span className="text-[#E0F6C4]/60 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {article.readTime || (isRTL ? '5 دقائق قراءة' : '5 min read')}
            </span>
            <span className="text-[#E0F6C4]/60 flex items-center gap-1">
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
        {article.coverImage && (
          <div className="rounded-2xl overflow-hidden border border-white/10 shadow-xl max-h-[440px] bg-[#374159]">
            <img
              src={article.coverImage}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Full Article Content */}
        <div 
          className="bg-[#374159]/25 border border-white/10 rounded-2xl p-6 sm:p-10 space-y-6 text-sm sm:text-base leading-relaxed text-[#E0F6C4]/90 whitespace-pre-line font-sans"
          dir="auto"
        >
          {article.content}
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
