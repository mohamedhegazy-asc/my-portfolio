import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowUpRight, Clock, Eye, Calendar } from 'lucide-react'
import { useLang } from '../i18n/LanguageContext'
import { t } from '../i18n/translations'
import { formatCompactDateTime } from '../utils/date'

export default function ArticlesSection({ articles = [] }) {
  const { lang, isRTL } = useLang()

  if (!articles || articles.length === 0) return null

  return (
    <section id="articles" className="w-full bg-[#222936] text-[#E0F6C4] px-6 md:px-12 lg:px-20 py-20 border-t border-[#374159]/40 scroll-mt-12">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#B9D895] font-semibold">
              {t(lang, 'articles.sectionTag')}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold font-serif text-white mt-1">
              {t(lang, 'articles.sectionTitle')}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#E0F6C4]/70 max-w-md">
            {t(lang, 'articles.sectionDesc')}
          </p>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {articles.map((art, idx) => (
            <motion.div
              key={art.slug || art._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="group bg-[#374159]/30 hover:bg-[#374159]/60 border border-white/10 hover:border-[#B9D895]/50 rounded-2xl overflow-hidden p-5 flex flex-col justify-between transition-all hover:-translate-y-1"
            >
              <div className="space-y-4">
                {/* Cover thumbnail */}
                <div className="aspect-[16/10] w-full rounded-xl overflow-hidden bg-[#222936] relative">
                  <img
                    src={art.coverImage}
                    alt={art.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2.5 start-2.5">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#222936]/80 backdrop-blur-md text-[#B9D895] border border-white/10">
                      {art.category}
                    </span>
                  </div>
                </div>

                {/* Meta details with Real Day, Date & Time */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#E0F6C4]/70">
                  <span className="flex items-center gap-1 font-medium">
                    <Calendar className="w-3 h-3 text-[#B9D895]" />
                    <span>{formatCompactDateTime(art.createdAt, lang)}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#E0F6C4]/60" /> {art.readTime || (isRTL ? "5 دقائق قراءة" : "5 min read")}
                  </span>
                </div>

                {/* Title */}
                <h3 
                  className="text-lg font-bold text-white group-hover:text-[#B9D895] transition-colors leading-snug line-clamp-2"
                  dir="auto"
                >
                  {art.title}
                </h3>

                {/* Excerpt */}
                <p 
                  className="text-xs text-[#E0F6C4]/75 line-clamp-3 leading-relaxed"
                  dir="auto"
                >
                  {art.excerpt}
                </p>
              </div>

              {/* Read Link */}
              <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between">
                <Link
                  to={`/articles/${art.slug}`}
                  className="text-xs font-semibold text-[#B9D895] flex items-center gap-1 group-hover:underline"
                >
                  <span>{t(lang, 'articles.readFull')}</span>
                  <ArrowUpRight className={`w-3.5 h-3.5 ${isRTL ? '-scale-x-100' : ''}`} />
                </Link>
                <span className="text-[11px] text-[#E0F6C4]/40 flex items-center gap-1">
                  <Eye className="w-3 h-3" /> {art.views || 0}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}
