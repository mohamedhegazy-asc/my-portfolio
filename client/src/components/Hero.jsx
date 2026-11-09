import React from 'react'
import { motion } from 'framer-motion'
import { BarChart3, Database, Cpu } from 'lucide-react'
import HeroPortrait from './HeroPortrait'
import { useLang } from '../i18n/LanguageContext'
import { t } from '../i18n/translations'

export default function Hero({ profile }) {
  const { lang, isRTL } = useLang()

  const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const initialLetter = isRTL 
    ? 'م' 
    : (profile?.name ? profile.name.trim().charAt(0).toUpperCase() : 'M')

  const displayName = isRTL ? 'محمد' : (profile?.shortName || "MOHAMED")
  const displayTitle = isRTL ? 'محلل بيانات' : (profile?.title || "Data Analyst")
  const displayCountry = isRTL ? 'مصر، الغربية - زفتى' : (profile?.country || "Egypt, Gharbia - Zifta")

  return (
    <section 
      id="home" 
      className="relative w-full bg-[#222936] rounded-t-[24px] pt-8 pb-20 px-6 md:px-12 lg:px-20 overflow-hidden border-t border-white/10"
    >
      {/* Background radial glows:
          - soft --slate glow (top center-right)
          - soft --sage glow (top right corner) at 25-35% opacity
      */}
      <div 
        className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full pointer-events-none opacity-30 blur-3xl"
        style={{
          background: 'radial-gradient(circle, #374159 0%, transparent 70%)'
        }}
      />
      <div 
        className="absolute -top-20 -right-20 w-[450px] h-[450px] rounded-full pointer-events-none opacity-30 blur-3xl"
        style={{
          background: 'radial-gradient(circle, #B9D895 0%, transparent 65%)'
        }}
      />

      <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        
        {/* Text Column: Stacked Text + 3 Dashed Cards (span 7) */}
        <div className="lg:col-span-7 flex flex-col justify-center space-y-8 z-20">
          
          {/* Stacked Text Block (Tight line height, NO EMOJIS) */}
          <div className="space-y-1">
            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="font-serif text-xl md:text-2xl text-[#E0F6C4] flex items-center gap-2"
            >
              {t(lang, 'hero.greeting')}
            </motion.p>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-serif font-black text-6xl sm:text-7xl md:text-8xl lg:text-[92px] leading-[0.95] tracking-tight uppercase text-white drop-shadow-md"
            >
              {displayName}
            </motion.h1>

            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="font-serif font-bold text-3xl sm:text-4xl md:text-5xl text-white tracking-normal leading-tight pt-1"
            >
              {displayTitle}
            </motion.h2>

            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-lg md:text-2xl text-[#E0F6C4]/80 font-normal pt-2"
            >
              {t(lang, 'hero.from')} {displayCountry}
            </motion.p>
          </div>

          {/* Three Dashed Cards below the text (Clean SVG icons, NO EMOJIS) */}
          <motion.div 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="grid grid-cols-3 gap-3 sm:gap-4 max-w-lg pt-4"
          >
            {/* Card 1: Services */}
            <button
              onClick={() => scrollTo('services')}
              className="group text-start p-3 sm:p-4 rounded-[8px] border border-dashed border-white/25 hover:border-[#B9D895] bg-[#374159]/20 hover:bg-[#374159]/40 transition-all cursor-pointer flex flex-col justify-between h-28"
            >
              <span className="text-xs sm:text-sm font-medium text-[#E0F6C4]/70 group-hover:text-white transition-colors">
                {t(lang, 'hero.cardServices')}
              </span>
              <div className="flex items-center gap-2 text-[#B9D895]">
                <div className="w-6 h-6 rounded-md bg-[#374159] flex items-center justify-center shadow-xs">
                  <BarChart3 className="w-3.5 h-3.5 text-[#B9D895]" />
                </div>
                <div className="w-6 h-6 rounded-md bg-[#374159] flex items-center justify-center shadow-xs">
                  <Database className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="w-6 h-6 rounded-md bg-[#374159] flex items-center justify-center shadow-xs">
                  <Cpu className="w-3.5 h-3.5 text-[#E0F6C4]" />
                </div>
              </div>
            </button>

            {/* Card 2: Projects */}
            <button
              onClick={() => scrollTo('projects')}
              className="group text-start p-3 sm:p-4 rounded-[8px] border border-dashed border-white/25 hover:border-[#B9D895] bg-[#374159]/20 hover:bg-[#374159]/40 transition-all cursor-pointer flex flex-col justify-between h-28"
            >
              <span className="text-xs sm:text-sm font-medium text-[#E0F6C4]/70 group-hover:text-white transition-colors">
                {t(lang, 'hero.cardProjects')}
              </span>
              <div className="flex flex-col space-y-1">
                <div className="w-12 h-6 bg-[#374159] rounded border border-white/10 flex items-center justify-center overflow-hidden">
                  <div className="w-8 h-3 bg-white/20 rounded-[2px]" />
                </div>
                <div className="w-6 h-[2px] bg-[#B9D895] rounded-full" />
              </div>
            </button>

            {/* Card 3: About */}
            <button
              onClick={() => scrollTo('about')}
              className="group text-start p-3 sm:p-4 rounded-[8px] border border-dashed border-white/25 hover:border-[#B9D895] bg-[#374159]/20 hover:bg-[#374159]/40 transition-all cursor-pointer flex flex-col justify-between h-28"
            >
              <span className="text-xs sm:text-sm font-medium text-[#E0F6C4]/70 group-hover:text-white transition-colors">
                {t(lang, 'hero.cardAbout')}
              </span>
              <span className="font-serif font-black text-2xl sm:text-3xl text-[#B9D895] leading-none">
                {initialLetter}
              </span>
            </button>
          </motion.div>

        </div>

        {/* Right Column: Hero Portrait with user's photo (span 5) */}
        <div className="lg:col-span-5 flex justify-center items-center z-10 pt-4 lg:pt-0">
          <HeroPortrait profile={profile} />
        </div>

      </div>
    </section>
  )
}
