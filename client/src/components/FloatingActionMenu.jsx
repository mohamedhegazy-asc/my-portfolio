import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, FileText, Mail } from 'lucide-react'
import { useLang } from '../i18n/LanguageContext'
import { t } from '../i18n/translations'
import { trackEvent } from '../services/api'

// GitHub SVG Icon
function GithubIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  )
}

// LinkedIn SVG Icon
function LinkedinIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.53 1.53 0 0 0 1.54-1.54 1.54 1.54 0 1 0-1.54 1.54m1.39 9.74v-8.37H5.07v8.37h2.78z" />
    </svg>
  )
}

export default function FloatingActionMenu({ profile, onOpenContact }) {
  const { lang, isRTL } = useLang()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  // Close on Esc key
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  const actionItems = [
    {
      id: 'cv',
      label: t(lang, 'fab.downloadCV'),
      icon: <FileText className="w-4 h-4 text-white" />,
      onClick: () => {
        setIsOpen(false)
        trackEvent('cv_download')
        const link = document.createElement('a')
        link.href = profile?.cvUrl || '/Mohamed_Hegazy_CV.pdf'
        link.download = 'Mohamed_Hegazy_CV.pdf'
        link.click()
      }
    },
    {
      id: 'contact',
      label: t(lang, 'fab.contactMe'),
      icon: <Mail className="w-4 h-4 text-white" />,
      onClick: () => {
        setIsOpen(false)
        onOpenContact()
      }
    },
    {
      id: 'github',
      label: t(lang, 'fab.github'),
      icon: <GithubIcon className="w-4 h-4 text-white" />,
      onClick: () => {
        setIsOpen(false)
        window.open(profile?.socials?.github || 'https://github.com', '_blank')
      }
    },
    {
      id: 'linkedin',
      label: t(lang, 'fab.linkedin'),
      icon: <LinkedinIcon className="w-4 h-4 text-white" />,
      onClick: () => {
        setIsOpen(false)
        window.open(profile?.socials?.linkedin || 'https://linkedin.com', '_blank')
      }
    }
  ]

  // Animation variants with staggered delay & spring physics
  const containerVariants = {
    open: {
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1, // bottom-up
      }
    },
    closed: {
      transition: {
        staggerChildren: 0.04,
        staggerDirection: 1,
      }
    }
  }

  const itemVariants = {
    open: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 25
      }
    },
    closed: {
      opacity: 0,
      y: 15,
      scale: 0.9,
      transition: {
        duration: 0.15
      }
    }
  }

  return (
    <div 
      ref={menuRef} 
      className={`fixed bottom-6 ${isRTL ? 'left-6 md:left-8' : 'right-6 md:right-8'} z-50 flex flex-col ${isRTL ? 'items-start' : 'items-end'} select-none`}
    >
      {/* Pills Container */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={containerVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className={`flex flex-col ${isRTL ? 'items-start' : 'items-end'} space-y-2.5 mb-3`}
          >
            {actionItems.map((action) => (
              <motion.button
                key={action.id}
                variants={itemVariants}
                onClick={action.onClick}
                aria-label={action.label}
                className="group flex items-center bg-white hover:bg-slate-50 text-[#222936] px-2.5 py-1.5 rounded-full shadow-[0_8px_24px_rgba(34,41,54,0.18)] border border-black/5 transition-transform active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#B9D895]"
              >
                {/* 32px solid circular icon badge */}
                <div className="w-8 h-8 rounded-full bg-[#374159] group-hover:bg-[#222936] flex items-center justify-center shrink-0 transition-colors shadow-xs">
                  {action.icon}
                </div>

                {/* label */}
                <span className="mx-3 text-[14px] font-medium tracking-tight whitespace-nowrap text-[#222936]">
                  {action.label}
                </span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close quick menu" : "Open quick contact and links"}
        aria-expanded={isOpen}
        className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#374159] hover:bg-[#222936] text-[#E0F6C4] flex items-center justify-center ring-2 ring-[#B9D895] shadow-[0_6px_20px_rgba(34,41,54,0.35)] transition-all transform active:scale-90 cursor-pointer focus:outline-none focus:ring-4 focus:ring-[#B9D895]/50"
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ type: "spring", stiffness: 350, damping: 20 }}
          className="flex items-center justify-center"
        >
          <Plus className="w-6 h-6 md:w-7 md:h-7 text-[#E0F6C4]" strokeWidth={2.5} />
        </motion.div>
      </button>
    </div>
  )
}
