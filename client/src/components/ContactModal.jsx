import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, AlertCircle } from 'lucide-react'
import { submitContact } from '../services/api'
import { DarkSwal } from '../utils/alerts'
import { useLang } from '../i18n/LanguageContext'
import { t } from '../i18n/translations'

export default function ContactModal({ isOpen, onClose }) {
  const { lang, isRTL } = useLang()
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })
  const [fieldErrors, setFieldErrors] = useState({})
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  // Validate on change
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    
    // Clear field-specific error as user types
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const validateForm = () => {
    const errors = {}
    if (!formData.name || !formData.name.trim()) {
      errors.name = t(lang, 'validation.nameRequired')
    } else if (formData.name.trim().length < 2) {
      errors.name = t(lang, 'validation.nameTooShort')
    }

    if (!formData.email || !formData.email.trim()) {
      errors.email = t(lang, 'validation.emailRequired')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = t(lang, 'validation.emailInvalid')
    }

    if (!formData.message || !formData.message.trim()) {
      errors.message = t(lang, 'validation.messageRequired')
    } else if (formData.message.trim().length < 10) {
      errors.message = t(lang, 'validation.messageTooShort')
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Comprehensive Validation
    const validation = validateForm()
    if (!validation.isValid) {
      setFieldErrors(validation.errors)
      DarkSwal.fire({
        icon: 'warning',
        title: t(lang, 'contact.validationTitle'),
        text: t(lang, 'contact.validationText'),
      })
      return
    }

    try {
      setLoading(true)
      await submitContact(formData)
      setFormData({ name: '', email: '', message: '' })
      setFieldErrors({})
      onClose()

      // Show SweetAlert Success Popup
      DarkSwal.fire({
        icon: 'success',
        title: t(lang, 'contact.successTitle'),
        text: t(lang, 'contact.successText'),
        confirmButtonText: t(lang, 'contact.successBtn')
      })
    } catch (err) {
      DarkSwal.fire({
        icon: 'error',
        title: t(lang, 'contact.errorTitle'),
        text: err.message || (isRTL ? 'تعذر إرسال الرسالة، يرجى المحاولة لاحقاً.' : 'Unable to deliver message. Please try again later.')
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#222936]/80 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-lg bg-[#222936] border border-[#374159] text-[#E0F6C4] rounded-2xl p-6 sm:p-8 shadow-2xl z-10 max-h-[92vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#374159]/60 pb-4 mb-6">
            <div>
              <span className="text-xs font-semibold text-[#B9D895] uppercase tracking-wider">
                {t(lang, 'contact.tag')}
              </span>
              <h3 className="text-xl sm:text-2xl font-bold font-serif text-white">
                {t(lang, 'contact.title')}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-[#E0F6C4]/60 hover:text-white p-2 rounded-full hover:bg-[#374159]/40 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Input with validation */}
            <div>
              <label className="block text-xs font-medium text-[#E0F6C4]/80 mb-1">
                {t(lang, 'contact.nameLabel')} <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                dir="auto"
                placeholder={t(lang, 'contact.namePlaceholder')}
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl bg-[#374159]/50 border text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 transition-all ${
                  fieldErrors.name 
                    ? 'border-rose-500 focus:ring-rose-400' 
                    : 'border-white/10 focus:ring-[#B9D895]'
                }`}
              />
              {fieldErrors.name && (
                <p className="mt-1 text-xs text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" /> {fieldErrors.name}
                </p>
              )}
            </div>

            {/* Email Input with validation */}
            <div>
              <label className="block text-xs font-medium text-[#E0F6C4]/80 mb-1">
                {t(lang, 'contact.emailLabel')} <span className="text-rose-400">*</span>
              </label>
              <input
                type="email"
                dir="ltr"
                placeholder={t(lang, 'contact.emailPlaceholder')}
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl bg-[#374159]/50 border text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 transition-all ${
                  fieldErrors.email 
                    ? 'border-rose-500 focus:ring-rose-400' 
                    : 'border-white/10 focus:ring-[#B9D895]'
                }`}
              />
              {fieldErrors.email && (
                <p className="mt-1 text-xs text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" /> {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Message Input with validation */}
            <div>
              <label className="block text-xs font-medium text-[#E0F6C4]/80 mb-1">
                {t(lang, 'contact.messageLabel')} <span className="text-rose-400">*</span>
              </label>
              <textarea
                rows={4}
                dir="auto"
                placeholder={t(lang, 'contact.messagePlaceholder')}
                value={formData.message}
                onChange={(e) => handleChange('message', e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl bg-[#374159]/50 border text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 transition-all resize-none ${
                  fieldErrors.message 
                    ? 'border-rose-500 focus:ring-rose-400' 
                    : 'border-white/10 focus:ring-[#B9D895]'
                }`}
              />
              {fieldErrors.message && (
                <p className="mt-1 text-xs text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" /> {fieldErrors.message}
                </p>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-6 rounded-full bg-[#B9D895] hover:bg-[#a5c780] text-[#222936] font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-[#222936] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{t(lang, 'contact.sendBtn')}</span>
                    <Send className={`w-4 h-4 ${isRTL ? '-scale-x-100' : ''}`} />
                  </>
                )}
              </button>
            </div>
          </form>

        </motion.div>
      </div>
    </AnimatePresence>
  )
}
