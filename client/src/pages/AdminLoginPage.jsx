import React, { useState, useEffect } from 'react'
import { Lock } from 'lucide-react'
import { useLang } from '../i18n/LanguageContext'
import { t } from '../i18n/translations'
import { adminLogin } from '../services/api'

export default function AdminLoginPage({ requiresExtraSecret = false, onSuccess }) {
  const { lang, isRTL } = useLang()
  const [phone, setPhone] = useState('')
  const [confirmPhone, setConfirmPhone] = useState('')
  const [extraSecret, setExtraSecret] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let meta = document.querySelector('meta[name="robots"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = 'robots'
      document.head.appendChild(meta)
    }
    meta.content = 'noindex,nofollow'
    return () => {
      meta?.remove()
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!phone.trim() || !confirmPhone.trim()) {
      setError(t(lang, 'adminAuth.missingFields'))
      return
    }

    setLoading(true)
    try {
      await adminLogin({
        phone,
        confirmPhone,
        ...(requiresExtraSecret ? { extraSecret } : {})
      })
      onSuccess?.()
    } catch (err) {
      setError(err.message || t(lang, 'adminAuth.connectionError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="min-h-screen bg-[#222936] flex items-center justify-center p-6 selection:bg-[#B9D895] selection:text-[#222936]"
    >
      <div className="w-full max-w-sm bg-[#374159]/30 border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl">
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#374159] border border-[#B9D895]/30 mb-4">
            <Lock className="w-6 h-6 text-[#B9D895]" />
          </div>
          <h1 className="text-xl font-bold text-white font-serif">
            {t(lang, 'adminAuth.title')}
          </h1>
          <p className="text-xs sm:text-sm text-[#E0F6C4]/60 mt-1">
            {t(lang, 'adminAuth.subtitle')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#E0F6C4]/80 mb-1.5">
              {t(lang, 'adminAuth.phoneLabel')}
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="off"
              placeholder={t(lang, 'adminAuth.phonePlaceholder')}
              className="w-full bg-[#222936] border border-white/10 focus:border-[#B9D895] rounded-xl px-4 py-3 text-white text-sm outline-none transition-colors"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#E0F6C4]/80 mb-1.5">
              {t(lang, 'adminAuth.confirmPhoneLabel')}
            </label>
            <input
              type="tel"
              value={confirmPhone}
              onChange={(e) => setConfirmPhone(e.target.value)}
              autoComplete="off"
              placeholder={t(lang, 'adminAuth.confirmPhonePlaceholder')}
              className="w-full bg-[#222936] border border-white/10 focus:border-[#B9D895] rounded-xl px-4 py-3 text-white text-sm outline-none transition-colors"
              dir="ltr"
            />
          </div>

          {requiresExtraSecret && (
            <div>
              <label className="block text-xs font-medium text-[#E0F6C4]/80 mb-1.5">
                {t(lang, 'adminAuth.extraSecretLabel')}
              </label>
              <input
                type="password"
                value={extraSecret}
                onChange={(e) => setExtraSecret(e.target.value)}
                autoComplete="off"
                placeholder={t(lang, 'adminAuth.extraSecretPlaceholder')}
                className="w-full bg-[#222936] border border-white/10 focus:border-[#B9D895] rounded-xl px-4 py-3 text-white text-sm outline-none transition-colors"
                dir="ltr"
              />
            </div>
          )}

          {error && (
            <div className="text-xs sm:text-sm text-red-300 bg-red-900/30 border border-red-700/40 rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#B9D895] hover:bg-[#a6ca7f] disabled:opacity-50 text-[#222936] font-bold py-3 rounded-xl transition-colors cursor-pointer mt-2"
          >
            {loading ? t(lang, 'adminAuth.verifyingBtn') : t(lang, 'adminAuth.loginBtn')}
          </button>
        </form>
      </div>
    </div>
  )
}
