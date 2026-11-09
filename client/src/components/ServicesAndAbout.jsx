import React from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  Database, 
  Cpu, 
  Layout, 
  GraduationCap, 
  Award, 
  MapPin, 
  Calendar, 
  Layers, 
  BrainCircuit
} from 'lucide-react'
import { useLang } from '../i18n/LanguageContext'
import { t } from '../i18n/translations'

export default function ServicesAndAbout({ profile }) {
  const { lang, isRTL } = useLang()

  const serviceIcons = [
    <BarChart3 className="w-6 h-6 text-[#B9D895]" />,
    <Database className="w-6 h-6 text-[#B9D895]" />,
    <BrainCircuit className="w-6 h-6 text-[#B9D895]" />,
    <Layout className="w-6 h-6 text-[#B9D895]" />
  ]

  const rawServices = t(lang, 'services.items') || []
  const services = rawServices.map((item, idx) => ({
    icon: serviceIcons[idx] || <BarChart3 className="w-6 h-6 text-[#B9D895]" />,
    title: item.title,
    desc: item.desc
  }))

  const arabicTools = [
    'تحليل البيانات',
    'Python (Pandas, NumPy)',
    'SQL (PostgreSQL / MySQL)',
    'Power BI Dashboards',
    'Advanced Excel',
    'التحليل الاستكشافي للبيانات (EDA)',
    'الذكاء الاصطناعي و Vibe Coding',
    'Prompt Engineering',
    'مبادئ تصميم الويب',
    'Node.js & Express (Route 2025)',
    'MongoDB & Mongoose',
    'نظم المعلومات الإدارية (BIS)'
  ]

  const englishTools = [
    'Data Analysis',
    'Python (Pandas, NumPy)',
    'SQL (PostgreSQL / MySQL)',
    'Power BI Dashboards',
    'Advanced Excel',
    'Exploratory Data Analysis',
    'AI & Vibe Coding',
    'Prompt Engineering',
    'Web Design Principles',
    'Node.js & Express (Route 2025)',
    'MongoDB & Mongoose',
    'Business Information Systems (BIS)'
  ]

  const tools = isRTL ? arabicTools : englishTools

  return (
    <div className="w-full bg-[#222936] text-[#E0F6C4] px-6 md:px-12 lg:px-20 py-16 space-y-24 border-t border-[#374159]/40">
      
      {/* SECTION 1: SERVICES (#services) */}
      <section id="services" className="max-w-7xl mx-auto scroll-mt-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#B9D895] font-semibold">
              {t(lang, 'services.sectionTag')}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold font-serif text-white mt-1">
              {t(lang, 'services.sectionTitle')}
            </h2>
          </div>
          <p className="text-sm text-[#E0F6C4]/70 max-w-md">
            {t(lang, 'services.sectionDesc')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-[#374159]/30 hover:bg-[#374159]/60 border border-white/10 hover:border-[#B9D895]/50 p-6 rounded-2xl transition-all hover:-translate-y-1 group"
            >
              <div className="w-12 h-12 rounded-xl bg-[#374159] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-inner">
                {item.icon}
              </div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#B9D895] transition-colors">
                {item.title}
              </h3>
              <p className="text-xs sm:text-sm text-[#E0F6C4]/70 leading-relaxed">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SECTION 2: ABOUT (#about) */}
      <section id="about" className="max-w-7xl mx-auto scroll-mt-24">
        <div className="bg-[#374159]/25 border border-white/10 rounded-3xl p-8 md:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Bio Info */}
            <div className="lg:col-span-7 space-y-6">
              <span className="text-xs uppercase tracking-widest text-[#B9D895] font-semibold">
                {t(lang, 'about.sectionTag')}
              </span>
              <h2 className="text-3xl md:text-4xl font-bold font-serif text-white">
                {t(lang, 'about.sectionTitle')}
              </h2>
              
              <div className="space-y-3 text-sm md:text-base text-[#E0F6C4]/85 leading-relaxed">
                <p dangerouslySetInnerHTML={{ __html: t(lang, 'about.bio1') }} />
                <p dangerouslySetInnerHTML={{ __html: t(lang, 'about.bio2') }} />
                <p dangerouslySetInnerHTML={{ __html: t(lang, 'about.bio3') }} />
              </div>

              {/* Personal Info Quick Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="bg-[#222936] p-3.5 rounded-xl border border-white/5">
                  <Calendar className="w-4 h-4 text-[#B9D895] mb-1" />
                  <div className="text-[11px] text-[#E0F6C4]/60">{t(lang, 'about.bornLabel')}</div>
                  <div className="text-xs font-semibold text-white">{t(lang, 'about.bornValue')}</div>
                </div>
                <div className="bg-[#222936] p-3.5 rounded-xl border border-white/5">
                  <MapPin className="w-4 h-4 text-[#B9D895] mb-1" />
                  <div className="text-[11px] text-[#E0F6C4]/60">{t(lang, 'about.originLabel')}</div>
                  <div className="text-xs font-semibold text-white">{t(lang, 'about.originValue')}</div>
                </div>
                <div className="bg-[#222936] p-3.5 rounded-xl border border-white/5">
                  <GraduationCap className="w-4 h-4 text-[#B9D895] mb-1" />
                  <div className="text-[11px] text-[#E0F6C4]/60">{t(lang, 'about.collegeLabel')}</div>
                  <div className="text-xs font-semibold text-white">{t(lang, 'about.collegeValue')}</div>
                </div>
                <div className="bg-[#222936] p-3.5 rounded-xl border border-white/5">
                  <Award className="w-4 h-4 text-[#B9D895] mb-1" />
                  <div className="text-[11px] text-[#E0F6C4]/60">{t(lang, 'about.gradLabel')}</div>
                  <div className="text-xs font-semibold text-white">{t(lang, 'about.gradValue')}</div>
                </div>
              </div>
            </div>

            {/* Right Tools & Stack */}
            <div className="lg:col-span-5 bg-[#222936]/80 p-6 md:p-8 rounded-2xl border border-white/10 space-y-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#B9D895]" />
                {t(lang, 'about.toolbeltTitle')}
              </h3>
              <p className="text-xs text-[#E0F6C4]/70">
                {t(lang, 'about.toolbeltDesc')}
              </p>

              <div className="flex flex-wrap gap-2">
                {tools.map((tool, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#374159] text-white border border-white/10 hover:border-[#B9D895] hover:text-[#B9D895] transition-colors"
                  >
                    {tool}
                  </span>
                ))}
              </div>

              {/* Learning Timeline Highlights */}
              <div className="pt-3 border-t border-[#374159]/60 space-y-2 text-xs">
                <div className="flex items-center justify-between text-[#E0F6C4]/80">
                  <span className="font-semibold text-white">{t(lang, 'about.timeline1Label')}</span>
                  <span className="text-[#B9D895]">{t(lang, 'about.timeline1Value')}</span>
                </div>
                <div className="flex items-center justify-between text-[#E0F6C4]/60">
                  <span>{t(lang, 'about.timeline2Label')}</span>
                  <span>{t(lang, 'about.timeline2Value')}</span>
                </div>
                <div className="flex items-center justify-between text-[#E0F6C4]/60">
                  <span>{t(lang, 'about.timeline3Label')}</span>
                  <span>{t(lang, 'about.timeline3Value')}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  )
}
