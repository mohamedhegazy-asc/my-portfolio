import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Download, ArrowLeft, ArrowRight, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react'
import { fetchProjectBySlug, fetchProjects } from '../services/api'
import { useLang } from '../i18n/LanguageContext'
import { t } from '../i18n/translations'

// GitHub SVG Icon
function GithubIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  )
}

export default function ProjectDetailPage({ profile }) {
  const { slug } = useParams()
  const { lang, isRTL } = useLang()
  const [project, setProject] = useState(null)
  const [allProjects, setAllProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    let isMounted = true

    async function loadData() {
      setLoading(true)
      try {
        const [proj, list] = await Promise.all([
          fetchProjectBySlug(slug),
          fetchProjects()
        ])
        if (isMounted) {
          setProject(proj)
          setAllProjects(list)
        }
      } catch (err) {
        console.error("Failed to load project details:", err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadData()
    return () => { isMounted = false }
  }, [slug])

  // Update page title
  useEffect(() => {
    if (project?.title) {
      document.title = `${project.title} | ${isRTL ? 'محمد حجازي' : (profile?.name || 'Mohamed Hegazy')}`
    }
  }, [project, profile, isRTL])

  // Calculate Next & Previous project links
  const currentIndex = allProjects.findIndex(p => p.slug === slug)
  const prevProject = currentIndex > 0 ? allProjects[currentIndex - 1] : allProjects[allProjects.length - 1]
  const nextProject = currentIndex >= 0 && currentIndex < allProjects.length - 1 ? allProjects[currentIndex + 1] : allProjects[0]

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E0F6C4] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[#222936] border-t-[#B9D895] rounded-full animate-spin" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#E0F6C4] flex flex-col items-center justify-center text-[#222936] p-6">
        <h2 className="text-2xl font-bold mb-4">{isRTL ? 'المشروع غير موجود' : 'Project Not Found'}</h2>
        <Link to="/" className="px-5 py-2.5 rounded-full bg-[#222936] text-[#E0F6C4] font-medium text-sm">
          {t(lang, 'projectDetail.backBtn')}
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#E0F6C4] text-[#222936] pb-24 selection:bg-[#222936] selection:text-[#E0F6C4]">
      
      {/* 1. Top Bar */}
      <div className="w-full border-b border-[#222936]/15 px-6 md:px-12 py-4 flex items-center justify-between sticky top-0 bg-[#E0F6C4]/95 backdrop-blur-xs z-30">
        <div className="flex items-center gap-4">
          <Link 
            to="/#projects" 
            className="flex items-center gap-1.5 text-xs font-semibold text-[#222936] hover:opacity-75 transition-opacity"
          >
            {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            <span>{t(lang, 'projectDetail.backBtn')}</span>
          </Link>
          <span className="text-xs text-[#222936]/30">|</span>
          <span className="text-xl font-bold tracking-tight text-[#222936] lowercase">
            {profile?.initials || 'mmh'}
          </span>
        </div>

        <a
          href={profile?.cvUrl || "/Mohamed_Hegazy_CV.pdf"}
          download="Mohamed_Hegazy_CV.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-[#222936] text-[#E0F6C4] px-4 py-2 rounded-full text-[13px] font-medium hover:bg-[#374159] transition-colors shadow-sm"
        >
          <span>{t(lang, 'works.downloadCV')}</span>
          <Download className="w-3.5 h-3.5" />
        </a>
      </div>

      <main className="max-w-6xl mx-auto px-6 md:px-12 lg:px-16 pt-12">
        
        {/* 2. Header */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-4 mb-8"
        >
          <div className="w-11 h-11 rounded-full bg-[#B9D895] text-[#222936] font-bold text-base flex items-center justify-center shadow-xs uppercase">
            {project.logoUrl || project.title.charAt(0)}
          </div>

          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#222936]" dir="auto">
              {project.title}
            </h1>
            <p className="text-base sm:text-lg text-[#374159] mt-2 max-w-3xl leading-relaxed" dir="auto">
              {project.subtitle}
            </p>
          </div>
        </motion.div>

        {/* 3. Meta Row with 3 Columns: Type, Client, Category */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-3 gap-6 py-6 border-y border-[#222936]/15 max-w-xl mb-12"
        >
          {/* Type */}
          <div>
            <span className="block text-[11px] font-medium text-[#374159]/70 uppercase tracking-wider mb-1">
              {t(lang, 'projectDetail.typeLabel')}
            </span>
            <span className="text-[13px] font-semibold text-[#222936]">
              {project.type || "Web App"}
            </span>
          </div>

          {/* Client */}
          <div>
            <span className="block text-[11px] font-medium text-[#374159]/70 uppercase tracking-wider mb-1">
              {t(lang, 'projectDetail.clientLabel')}
            </span>
            <span className="text-[13px] font-semibold text-[#222936]">
              {project.client || "Client Studio"}
            </span>
          </div>

          {/* Category */}
          <div>
            <span className="block text-[11px] font-medium text-[#374159]/70 uppercase tracking-wider mb-1">
              {t(lang, 'projectDetail.categoryLabel')}
            </span>
            <span className="text-[13px] font-semibold text-[#222936]">
              {project.category || "Design"}
            </span>
          </div>
        </motion.div>

        {/* Action Links */}
        {(project.liveUrl || project.repoUrl) && (
          <div className="flex items-center gap-4 mb-10">
            {project.liveUrl && project.liveUrl !== '#' && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#222936] text-[#E0F6C4] px-4 py-2 rounded-full text-xs font-semibold hover:bg-[#374159] transition-all shadow-xs"
              >
                <span>{t(lang, 'projectDetail.liveBtn')}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            {project.repoUrl && project.repoUrl !== '#' && (
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-[#222936] text-[#222936] px-4 py-2 rounded-full text-xs font-semibold hover:bg-[#222936]/10 transition-all"
              >
                <span>{t(lang, 'projectDetail.githubBtn')}</span>
                <GithubIcon className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        )}

        {/* 4. Gallery */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-20"
        >
          {(project.images && project.images.length > 0 ? project.images : [project.thumbnail]).map((imgUrl, i) => (
            <div
              key={i}
              className="rounded-[16px] bg-white/70 border border-[#222936]/15 shadow-sm p-4 sm:p-6 overflow-hidden flex items-center justify-center group hover:bg-white/90 transition-all"
            >
              <div className="w-full rounded-[10px] overflow-hidden shadow-md border border-[#222936]/10 bg-white">
                <img
                  src={imgUrl}
                  alt={`${project.title} screenshot ${i + 1}`}
                  loading="lazy"
                  className="w-full h-auto object-cover group-hover:scale-102 transition-transform duration-500"
                />
              </div>
            </div>
          ))}
        </motion.div>

        {/* 5. Navigation links */}
        <div className="pt-8 border-t border-[#222936]/15 flex items-center justify-between">
          {prevProject ? (
            <Link
              to={`/projects/${prevProject.slug}`}
              className="group flex items-center gap-3 text-start no-underline"
            >
              <div className="w-10 h-10 rounded-full bg-[#222936] text-[#E0F6C4] flex items-center justify-center group-hover:-translate-x-1 transition-transform">
                {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
              </div>
              <div>
                <span className="block text-[11px] font-medium text-[#374159]/70 uppercase">{t(lang, 'projectDetail.prevBtn')}</span>
                <span className="text-sm font-bold text-[#222936] group-hover:underline" dir="auto">{prevProject.title}</span>
              </div>
            </Link>
          ) : <div />}

          {nextProject ? (
            <Link
              to={`/projects/${nextProject.slug}`}
              className="group flex items-center gap-3 text-end no-underline"
            >
              <div>
                <span className="block text-[11px] font-medium text-[#374159]/70 uppercase">{t(lang, 'projectDetail.nextBtn')}</span>
                <span className="text-sm font-bold text-[#222936] group-hover:underline" dir="auto">{nextProject.title}</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#222936] text-[#E0F6C4] flex items-center justify-center group-hover:translate-x-1 transition-transform">
                {isRTL ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </div>
            </Link>
          ) : <div />}
        </div>

      </main>
    </div>
  )
}
