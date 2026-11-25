import React, { useState, useEffect } from 'react'
import { Save, ShieldCheck, LogOut, Upload } from 'lucide-react'
import FormField from '../components/FormField'
import { useToast } from '../components/Toast'
import { updateProfile, uploadBlobDirect } from '../../services/api'
import { useLang } from '../../i18n/LanguageContext'
import { t } from '../../i18n/translations'

export default function Settings({ profile, onSaved, onLogout }) {
  const { lang, isRTL } = useLang()
  const { addToast } = useToast()

  const [form, setForm] = useState({
    title: '',
    bio: '',
    country: '',
    cvUrl: '',
    email: '',
    phone: '',
    github: '',
    linkedin: ''
  })
  const [saving, setSaving] = useState(false)
  const [uploadingCv, setUploadingCv] = useState(false)

  useEffect(() => {
    if (!profile) return
    setForm({
      title: profile.title || '',
      bio: profile.bio || '',
      country: profile.country || '',
      cvUrl: profile.cvUrl || '',
      email: profile.socials?.email || '',
      phone: profile.socials?.phone || '',
      github: profile.socials?.github || '',
      linkedin: profile.socials?.linkedin || ''
    })
  }, [profile])

  const handleSave = async (e) => {
    e?.preventDefault()
    setSaving(true)
    try {
      await updateProfile({
        title: form.title,
        bio: form.bio,
        country: form.country,
        cvUrl: form.cvUrl,
        socials: {
          ...profile?.socials,
          email: form.email,
          phone: form.phone,
          github: form.github,
          linkedin: form.linkedin
        }
      })
      addToast(isRTL ? 'تم حفظ الإعدادات' : 'Settings saved')
      onSaved?.()
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault()
        handleSave()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const handleCvUpload = async (file) => {
    if (!file) return
    setUploadingCv(true)
    try {
      const blob = await uploadBlobDirect(file)
      setForm((prev) => ({ ...prev, cvUrl: blob.url }))
      addToast(isRTL ? 'تم رفع ملف السيرة الذاتية' : 'CV uploaded')
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setUploadingCv(false)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Active Session Info */}
      <div className="rounded-2xl bg-[#222936] text-[#E0F6C4] p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#374159] text-[#B9D895] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">{t(lang, 'adminP5.sessionActive')}</p>
            <p className="text-xs text-[#E0F6C4]/70">{t(lang, 'adminP5.sessionDesc')}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600/90 hover:bg-red-600 text-white text-xs font-bold cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>{t(lang, 'adminAuth.logoutBtn')}</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="rounded-2xl bg-white border border-gray-200 p-6 space-y-5 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label={isRTL ? 'المسمى الوظيفي' : 'Headline / Title'} required>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#222936]"
            />
          </FormField>
          <FormField label={isRTL ? 'الدولة / المدينة' : 'Country / Location'}>
            <input
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#222936]"
            />
          </FormField>
        </div>

        <FormField label={isRTL ? 'النبذة الشخصية' : 'Bio'} required>
          <textarea
            rows={4}
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#222936]"
          />
        </FormField>

        <FormField label={t(lang, 'adminP5.cvUrlLabel')}>
          <div className="flex flex-wrap gap-2">
            <input
              value={form.cvUrl}
              onChange={(e) => setForm({ ...form, cvUrl: e.target.value })}
              className="flex-1 min-w-[200px] px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#222936]"
              dir="ltr"
            />
            <label className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold hover:bg-gray-50 cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>{uploadingCv ? '...' : 'PDF'}</span>
              <input type="file" accept=".pdf" className="hidden" onChange={(e) => handleCvUpload(e.target.files?.[0])} />
            </label>
          </div>
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Email">
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm" dir="ltr" />
          </FormField>
          <FormField label="Phone">
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm" dir="ltr" />
          </FormField>
          <FormField label="GitHub">
            <input value={form.github} onChange={(e) => setForm({ ...form, github: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm" dir="ltr" />
          </FormField>
          <FormField label="LinkedIn">
            <input value={form.linkedin} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm" dir="ltr" />
          </FormField>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#222936] hover:bg-[#374159] text-[#B9D895] text-sm font-bold cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? '...' : (isRTL ? 'حفظ التغييرات' : 'Save Settings')}</span>
        </button>
      </form>
    </div>
  )
}
