import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, ArrowUpRight } from 'lucide-react'
import { useLang } from '../i18n/LanguageContext'
import { t } from '../i18n/translations'
import { trackEvent } from '../services/api'

export default function WorksSection({ profile, projects }) {
  const { lang, isRTL } = useLang()
  const [selectedCategory, setSelectedCategory] = useState('All')

  // Generate category pills dynamically from projects
  const categories = useMemo(() => {
    const set = new Set()
    projects.forEach((p) => {
      if (p.category) set.add(p.category)
    })
    return ['All', ...Array.from(set)]
  }, [projects])

  // Filter projects based on active pill
  const filteredProjects = useMemo(() => {
    if (selectedCategory === 'All') return projects
    return projects.filter(
      (p) => p.category.toLowerCase() === selectedCategory.toLowerCase()
    )
  }, [projects, selectedCategory])

  const avatarSrc = profile?.avatarUrl || "/assets/avatar.jpg"
  const displayName = isRTL ? 'محمد محمود حجازي' : (profile?.name || "Mohamed Mahmoud Hegazy")
  const displayBio = isRTL 
    ? 'محلل بيانات وخريج نظم معلومات الأعمال (BIS) متخصص في تحليل البيانات والذكاء الاصطناعي وتقنيات الويب الحديثة.'
    : (profile?.bio || "Data Analyst and Business Information Systems graduate specializing in Data Analysis, AI, Vibe Coding, and web technologies.")

  return (
    <section 
      id="projects" 
      className="w-full bg-[#E0F6C4] text-[#222936] scroll-mt-10 transition-colors"
    >
      {/* 1. Works Top Bar (as in design_home_page.webp, left) */}
      <div className="w-full border-b border-[#222936]/15 px-6 md:px-12 py-4 flex items-center justify-between">
        <Link 
          to="/" 
          className="text-xl font-bold tracking-tight text-[#222936] lowercase"
        >
          {profile?.initials || 'mmh'}
        </Link>

        <a
          href={profile?.cvUrl || "/Mohamed_Hegazy_CV.pdf"}
          download="Mohamed_Hegazy_CV.pdf"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent('cv_download')}
          className="inline-flex items-center gap-2 bg-[#222936] text-[#E0F6C4] px-4 py-2 rounded-full text-[13px] font-medium hover:bg-[#374159] transition-colors shadow-sm cursor-pointer"
        >
          <span>{t(lang, 'works.downloadCV')}</span>
          <Download className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* 2. Intro Block */}
      <div className="w-full bg-[#d6edb7]/50 border-b border-[#222936]/10 px-6 md:px-12 lg:px-20 py-12">
        <div className="max-w-7xl mx-auto flex flex-col items-start space-y-4">
          
          {/* Circular avatar (user's photo) */}
          <div className="w-16 h-16 rounded-full overflow-hidden bg-[#222936] shadow-md border-2 border-white flex items-center justify-center">
            <img
              src={avatarSrc}
              alt={displayName}
              className="w-full h-full object-cover object-top"
              onError={(e) => {
                e.target.style.display = 'none'
                e.target.parentElement.innerHTML = `<span class="text-white font-bold text-lg">${profile?.initials?.toUpperCase() || 'MH'}</span>`
              }}
            />
          </div>

          {/* Heading and Subtitle (NO EMOJIS) */}
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#222936] tracking-tight">
              {t(lang, 'works.hiPrefix')} {displayName}
            </h1>
            <p className="text-sm sm:text-base text-[#374159] font-normal mt-1 max-w-2xl leading-relaxed">
              {displayBio}
            </p>
          </div>
        </div>
      </div>

      {/* 3. "My works" Title and Category Filter Pills */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 pt-12 pb-24">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#222936]">
            {t(lang, 'works.myWorks')}
          </h2>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((category) => {
              const isActive = selectedCategory === category
              const label = category === 'All' ? t(lang, 'works.all') : category
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#222936] text-[#E0F6C4] shadow-sm'
                      : 'border border-[#222936] text-[#222936] hover:bg-[#222936]/10'
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>

        {/* 4. Projects Grid: 3 cols desktop, 2 cols tablet, 1 col mobile, gap 24px */}
        <motion.div 
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {filteredProjects.map((project) => (
              <motion.div
                key={project.slug || project._id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="group"
              >
                <Link
                  to={`/projects/${project.slug}`}
                  onClick={() => trackEvent('project_click', project.slug)}
                  className="block text-inherit no-underline"
                >
                  {/* Media box */}
                  <div className="w-full aspect-[4/3] rounded-[14px] bg-white/60 border border-[#222936]/15 shadow-sm p-4 overflow-hidden relative group-hover:-translate-y-1.5 group-hover:shadow-md transition-all duration-300">
                    <div className="w-full h-full rounded-[10px] bg-white overflow-hidden shadow-inner flex flex-col justify-start">
                      {/* Browser mock top bar */}
                      <div className="h-5 bg-[#222936]/5 border-b border-[#222936]/10 px-2 flex items-center gap-1.5 shrink-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                        <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                        <span className="text-[9px] text-[#374159]/60 px-2 truncate" dir="auto">{project.title}</span>
                      </div>
                      
                      {/* Project image inset */}
                      <img
                        src={project.thumbnail}
                        alt={project.title}
                        loading="lazy"
                        className="w-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                        style={{ height: 'calc(100% - 20px)' }}
                      />
                    </div>
                  </div>

                  {/* Below media box */}
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-[#B9D895] text-[#222936] font-bold text-[10px] flex items-center justify-center uppercase shadow-xs shrink-0">
                        {project.logoUrl || project.title.charAt(0)}
                      </div>
                      <span className="text-[13px] font-medium text-[#222936] group-hover:text-black" dir="auto">
                        {project.title}
                      </span>
                    </div>

                    <ArrowUpRight className={`w-4 h-4 text-[#374159] opacity-0 group-hover:opacity-100 transition-all ${isRTL ? '-scale-x-100' : ''}`} />
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-16 text-[#374159]">
            <p className="text-base font-medium">{t(lang, 'works.noProjects')}</p>
          </div>
        )}

      </div>
    </section>
  )
}
