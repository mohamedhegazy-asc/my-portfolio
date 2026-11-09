import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Home, 
  Layers, 
  FileText, 
  Mail, 
  Settings, 
  ExternalLink, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Filter, 
  ChevronDown, 
  Calendar, 
  ChevronLeft,
  ChevronRight,
  Eye,
  Sparkles,
  Save,
  Menu,
  AlertCircle,
  Globe
} from 'lucide-react'
import { 
  fetchProjects, 
  createProject, 
  updateProject, 
  deleteProject,
  fetchArticles, 
  createArticle, 
  updateArticle, 
  deleteArticle,
  fetchProfile, 
  updateProfile,
  fetchMessages, 
  deleteMessage,
  fetchAnalytics
} from '../services/api'
import { LightSwal, showSuccessToast, showErrorToast, confirmDeletion } from '../utils/alerts'
import { validateProjectForm, validateArticleForm, validateEmail } from '../utils/validation'
import { useLang } from '../i18n/LanguageContext'
import { t } from '../i18n/translations'
import { formatCompactDateTime, formatPublishDateTime } from '../utils/date'

export default function AdminDashboard() {
  const { lang, setLang, isRTL } = useLang()
  const [activeTab, setActiveTab] = useState('overview')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('All')
  
  // Data states
  const [projects, setProjects] = useState([])
  const [articles, setArticles] = useState([])
  const [messages, setMessages] = useState([])
  const [profile, setProfile] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  // Modals state
  const [projectModalOpen, setProjectModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [projectErrors, setProjectErrors] = useState({})

  const [articleModalOpen, setArticleModalOpen] = useState(false)
  const [editingArticle, setEditingArticle] = useState(null)
  const [articleErrors, setArticleErrors] = useState({})

  // Forms state
  const [projectForm, setProjectForm] = useState({
    title: '',
    slug: '',
    subtitle: '',
    category: 'Data Analysis',
    type: 'BI Dashboard',
    client: 'Client Studio',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    liveUrl: '',
    repoUrl: ''
  })

  const [articleForm, setArticleForm] = useState({
    title: '',
    slug: '',
    category: 'Data Analysis',
    excerpt: '',
    content: '',
    coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    readTime: '5 min read',
    published: true
  })

  const [profileForm, setProfileForm] = useState({
    title: '',
    bio: '',
    country: '',
    email: '',
    phone: '',
    github: '',
    linkedin: ''
  })
  const [profileErrors, setProfileErrors] = useState({})

  // Load all dashboard data
  const loadDashboardData = async () => {
    setLoading(true)
    try {
      const [projList, artList, msgList, profData, analyticsData] = await Promise.all([
        fetchProjects(),
        fetchArticles(),
        fetchMessages(),
        fetchProfile(),
        fetchAnalytics()
      ])
      setProjects(projList || [])
      setArticles(artList || [])
      setMessages(msgList || [])
      setProfile(profData || null)
      setAnalytics(analyticsData || null)
      if (profData) {
        setProfileForm({
          title: profData.title || '',
          bio: profData.bio || '',
          country: profData.country || '',
          email: profData.socials?.email || '',
          phone: profData.socials?.phone || '',
          github: profData.socials?.github || '',
          linkedin: profData.socials?.linkedin || ''
        })
      }
    } catch (err) {
      console.error("Dashboard data load error:", err)
      showErrorToast(isRTL ? "تعذر تحميل بعض بيانات لوحة التحكم" : "Failed to load some dashboard data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    document.title = isRTL 
      ? "لوحة تحكم الأدمن | Portfolio CMS" 
      : "Admin Dashboard | Portfolio OS"
    loadDashboardData()
  }, [isRTL])

  // Project handlers
  const handleOpenAddProject = () => {
    setEditingProject(null)
    setProjectErrors({})
    setProjectForm({
      title: '',
      slug: '',
      subtitle: '',
      category: 'Data Analysis',
      type: 'BI Dashboard',
      client: 'Client Studio',
      thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
      liveUrl: '',
      repoUrl: ''
    })
    setProjectModalOpen(true)
  }

  const handleOpenEditProject = (proj) => {
    setEditingProject(proj)
    setProjectErrors({})
    setProjectForm({
      title: proj.title || '',
      slug: proj.slug || '',
      subtitle: proj.subtitle || '',
      category: proj.category || 'Data Analysis',
      type: proj.type || 'BI Dashboard',
      client: proj.client || 'Client Studio',
      thumbnail: proj.thumbnail || '',
      liveUrl: proj.liveUrl || '',
      repoUrl: proj.repoUrl || ''
    })
    setProjectModalOpen(true)
  }

  const handleSaveProject = async (e) => {
    e.preventDefault()

    const validation = validateProjectForm(projectForm)
    if (!validation.isValid) {
      setProjectErrors(validation.errors)
      LightSwal.fire({
        icon: 'warning',
        title: isRTL ? 'خطأ في بيانات المشروع' : 'Validation Error',
        html: `<ul style="text-align: ${isRTL ? 'right' : 'left'}; padding-${isRTL ? 'right' : 'left'}: 20px; font-size: 13px;">${Object.values(validation.errors).map(err => `<li>${err}</li>`).join('')}</ul>`,
        confirmButtonText: isRTL ? 'مراجعة النموذج' : 'Review Form'
      })
      return
    }

    try {
      if (editingProject) {
        await updateProject(editingProject._id || editingProject.slug, projectForm)
        LightSwal.fire({
          icon: 'success',
          title: isRTL ? 'تم تحديث المشروع!' : 'Project Updated!',
          text: isRTL ? `تم حفظ تعديلات "${projectForm.title}" بنجاح.` : `"${projectForm.title}" has been updated on your live portfolio.`,
          timer: 2000,
          showConfirmButton: false
        })
      } else {
        await createProject(projectForm)
        LightSwal.fire({
          icon: 'success',
          title: isRTL ? 'تم نشر المشروع!' : 'Project Published!',
          text: isRTL ? `"${projectForm.title}" معروض الآن لجميع زوار موقعك.` : `"${projectForm.title}" is now visible to all visitors.`,
          timer: 2000,
          showConfirmButton: false
        })
      }
      setProjectModalOpen(false)
      loadDashboardData()
    } catch (err) {
      LightSwal.fire({
        icon: 'error',
        title: isRTL ? 'فشل الحفظ' : 'Save Failed',
        text: err.message
      })
    }
  }

  const handleDeleteProject = async (id, title) => {
    const isConfirmed = await confirmDeletion(title)
    if (isConfirmed) {
      try {
        await deleteProject(id)
        showSuccessToast(isRTL ? `تم حذف المشروع "${title}"` : `Project "${title}" deleted successfully`)
        loadDashboardData()
      } catch (err) {
        showErrorToast(err.message)
      }
    }
  }

  // Article handlers
  const handleOpenAddArticle = () => {
    setEditingArticle(null)
    setArticleErrors({})
    setArticleForm({
      title: '',
      slug: '',
      category: 'Data Analysis',
      excerpt: '',
      content: '',
      coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
      readTime: isRTL ? '5 دقائق قراءة' : '5 min read',
      published: true
    })
    setArticleModalOpen(true)
  }

  const handleOpenEditArticle = (art) => {
    setEditingArticle(art)
    setArticleErrors({})
    setArticleForm({
      title: art.title || '',
      slug: art.slug || '',
      category: art.category || 'Data Analysis',
      excerpt: art.excerpt || '',
      content: art.content || '',
      coverImage: art.coverImage || '',
      readTime: art.readTime || (isRTL ? '5 دقائق قراءة' : '5 min read'),
      published: art.published !== false
    })
    setArticleModalOpen(true)
  }

  const handleSaveArticle = async (e) => {
    e.preventDefault()

    const validation = validateArticleForm(articleForm)
    if (!validation.isValid) {
      setArticleErrors(validation.errors)
      LightSwal.fire({
        icon: 'warning',
        title: isRTL ? 'خطأ في بيانات المقال' : 'Validation Error',
        html: `<ul style="text-align: ${isRTL ? 'right' : 'left'}; padding-${isRTL ? 'right' : 'left'}: 20px; font-size: 13px;">${Object.values(validation.errors).map(err => `<li>${err}</li>`).join('')}</ul>`,
        confirmButtonText: isRTL ? 'مراجعة المقال' : 'Review Form'
      })
      return
    }

    try {
      if (editingArticle) {
        await updateArticle(editingArticle._id || editingArticle.slug, articleForm)
        LightSwal.fire({
          icon: 'success',
          title: isRTL ? 'تم تحديث المقال!' : 'Article Updated!',
          text: isRTL ? `تم حفظ تعديلات "${articleForm.title}".` : `"${articleForm.title}" changes saved.`,
          timer: 2000,
          showConfirmButton: false
        })
      } else {
        await createArticle({
          ...articleForm,
          createdAt: new Date().toISOString()
        })
        LightSwal.fire({
          icon: 'success',
          title: isRTL ? 'تم نشر المقال!' : 'Article Published!',
          text: isRTL ? `"${articleForm.title}" منشور الآن في مدونتك.` : `"${articleForm.title}" is now published on your blog.`,
          timer: 2000,
          showConfirmButton: false
        })
      }
      setArticleModalOpen(false)
      loadDashboardData()
    } catch (err) {
      LightSwal.fire({
        icon: 'error',
        title: isRTL ? 'فشل النشر' : 'Publish Failed',
        text: err.message
      })
    }
  }

  const handleDeleteArticle = async (id, title) => {
    const isConfirmed = await confirmDeletion(title)
    if (isConfirmed) {
      try {
        await deleteArticle(id)
        showSuccessToast(isRTL ? `تم حذف المقال "${title}"` : `Article "${title}" removed`)
        loadDashboardData()
      } catch (err) {
        showErrorToast(err.message)
      }
    }
  }

  // Message handler
  const handleDeleteMessage = async (id) => {
    const isConfirmed = await confirmDeletion(isRTL ? "هذه الرسالة" : "this contact inquiry")
    if (isConfirmed) {
      try {
        await deleteMessage(id)
        showSuccessToast(isRTL ? "تم حذف الرسالة" : "Message deleted")
        loadDashboardData()
      } catch (err) {
        showErrorToast(err.message)
      }
    }
  }

  // Profile save handler with validation
  const handleSaveProfile = async (e) => {
    e.preventDefault()
    const errors = {}

    if (!profileForm.title || !profileForm.title.trim()) {
      errors.title = isRTL ? 'المسمى الوظيفي مطلوب.' : 'Job title / headline is required.'
    }
    if (!profileForm.bio || profileForm.bio.trim().length < 15) {
      errors.bio = isRTL ? 'يجب أن تكون النبذة 15 حرفاً على الأقل.' : 'Bio must be at least 15 characters long.'
    }
    if (profileForm.email) {
      const emailErr = validateEmail(profileForm.email)
      if (emailErr) errors.email = emailErr
    }

    if (Object.keys(errors).length > 0) {
      setProfileErrors(errors)
      LightSwal.fire({
        icon: 'warning',
        title: isRTL ? 'بيانات غير صحيحة' : 'Invalid Profile Data',
        text: isRTL ? 'يرجى تصحيح الحقول المحددة قبل الحفظ.' : 'Please correct the highlighted fields before saving.'
      })
      return
    }

    try {
      await updateProfile({
        title: profileForm.title,
        bio: profileForm.bio,
        country: profileForm.country,
        socials: {
          email: profileForm.email,
          phone: profileForm.phone,
          github: profileForm.github,
          linkedin: profileForm.linkedin
        }
      })
      LightSwal.fire({
        icon: 'success',
        title: isRTL ? 'تم تحديث الملف الشخصي!' : 'Profile Updated!',
        text: isRTL ? 'تمت مزامنة المسمى الوظيفي والنبذة ومعلومات التواصل مع الموقع المباشر.' : 'Your headline, bio, and contact details have been synchronized with the live website.',
        timer: 2500,
        showConfirmButton: false
      })
      loadDashboardData()
    } catch (err) {
      LightSwal.fire({
        icon: 'error',
        title: isRTL ? 'خطأ في التحديث' : 'Update Error',
        text: err.message
      })
    }
  }

  const navMenuItems = [
    { id: 'overview', label: t(lang, 'admin.tabs.overview'), icon: Home },
    { id: 'projects', label: t(lang, 'admin.tabs.projects'), icon: Layers, badge: projects.length },
    { id: 'articles', label: t(lang, 'admin.tabs.articles'), icon: FileText, badge: articles.length },
    { id: 'messages', label: t(lang, 'admin.tabs.messages'), icon: Mail, badge: messages.length },
    { id: 'settings', label: t(lang, 'admin.tabs.settings'), icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-[#1E232F] flex font-sans antialiased selection:bg-[#222936] selection:text-white">
      
      {/* MOBILE BACKDROP DRAWER */}
      {mobileSidebarOpen && (
        <div 
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* SIDEBAR (Desktop & Responsive Mobile Drawer) */}
      <aside 
        className={`bg-white border-e border-[#E7E9ED] flex flex-col justify-between transition-all duration-300 z-50 fixed lg:sticky top-0 h-screen ${
          sidebarCollapsed ? 'lg:w-20' : 'lg:w-64'
        } ${
          mobileSidebarOpen 
            ? 'translate-x-0 w-64' 
            : (isRTL ? 'translate-x-full lg:translate-x-0' : '-translate-x-full lg:translate-x-0')
        }`}
      >
        <div>
          {/* Brand header */}
          <div className="h-18 px-5 border-b border-[#F0F2F5] flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-[#222936] text-[#B9D895] font-black text-sm flex items-center justify-center shrink-0 shadow-sm">
                mmh
              </div>
              {(!sidebarCollapsed || mobileSidebarOpen) && (
                <div className="flex flex-col">
                  <span className="font-extrabold text-[15px] tracking-tight text-[#1E232F]">
                    {isRTL ? 'سكاي ميتريكس' : 'Skymetrics'}
                  </span>
                  <span className="text-[10px] text-gray-400 font-medium tracking-wide">
                    {isRTL ? 'نظام البورتفوليو v2.6' : 'Portfolio OS v2.6'}
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                if (window.innerWidth < 1024) {
                  setMobileSidebarOpen(false)
                } else {
                  setSidebarCollapsed(!sidebarCollapsed)
                }
              }}
              className="w-7 h-7 rounded-lg border border-gray-200 hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors cursor-pointer"
            >
              {isRTL ? (
                <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${sidebarCollapsed && !mobileSidebarOpen ? '-rotate-180' : ''}`} />
              ) : (
                <ChevronLeft className={`w-4 h-4 transition-transform duration-300 ${sidebarCollapsed && !mobileSidebarOpen ? 'rotate-180' : ''}`} />
              )}
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1.5">
            {navMenuItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id)
                    setMobileSidebarOpen(false)
                  }}
                  className={`w-full flex items-center px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#F2F4F7] text-[#1E232F] font-semibold shadow-xs'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#1E232F]' : 'text-gray-400'}`} />
                  {(!sidebarCollapsed || mobileSidebarOpen) && (
                    <span className="mx-3 flex-1 text-start">{item.label}</span>
                  )}
                  {(!sidebarCollapsed || mobileSidebarOpen) && item.badge > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#222936] text-[#E0F6C4]">
                      {item.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Bottom bar */}
        <div className="p-3 border-t border-[#F0F2F5] space-y-1">
          <Link
            to="/"
            target="_blank"
            className="w-full flex items-center px-3.5 py-2.5 rounded-xl text-[13px] font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
          >
            <ExternalLink className="w-4 h-4 text-gray-400 shrink-0" />
            {(!sidebarCollapsed || mobileSidebarOpen) && (
              <span className="mx-3">{isRTL ? 'الموقع المباشر' : 'Live Website'}</span>
            )}
          </Link>
          
          {(!sidebarCollapsed || mobileSidebarOpen) && (
            <div className="px-3.5 py-3 rounded-xl bg-gray-50 border border-gray-100 flex items-center gap-3 mt-2">
              <img
                src={profile?.avatarUrl || "/assets/avatar.jpg"}
                alt="Admin"
                className="w-8 h-8 rounded-full object-cover border border-white shadow-xs"
              />
              <div className="flex flex-col truncate">
                <span className="text-xs font-semibold text-gray-800 truncate">
                  {isRTL ? 'محمد حجازي' : (profile?.shortName || "Mohamed")}
                </span>
                <span className="text-[10px] text-emerald-600 font-medium">
                  {isRTL ? '● متصل (أدمن)' : '● Online Admin'}
                </span>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto w-full">
        
        {/* TOP HEADER */}
        <header className="bg-white/80 backdrop-blur-md border-b border-[#E7E9ED] px-4 sm:px-8 py-5 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            {/* Hamburger Button for Mobile */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#1E232F]">
                {activeTab === 'overview' && (isRTL ? 'نظرة عامة والتحليلات' : 'Portfolio Analytics')}
                {activeTab === 'projects' && (isRTL ? 'إدارة المشاريع' : 'Projects Manager')}
                {activeTab === 'articles' && (isRTL ? 'المقالات والمدونة' : 'Articles & Blog Posts')}
                {activeTab === 'messages' && (isRTL ? 'رسائل الزوار' : 'Visitor Messages')}
                {activeTab === 'settings' && (isRTL ? 'إعدادات الموقع والملف الشخصي' : 'Site & Profile Settings')}
              </h1>
              <p className="hidden sm:block text-xs text-gray-500 mt-0.5">
                {activeTab === 'overview' && (isRTL ? 'فحص مقاييس الزوار، وتحديث المشاريع ونشر المقالات.' : 'Inspect visitor metrics, update projects and publish articles.')}
                {activeTab === 'projects' && (isRTL ? 'إنشاء وتعديل وتنظيم المشاريع المعروضة في البورتفوليو.' : 'Create, edit, and organize projects shown on your live portfolio.')}
                {activeTab === 'articles' && (isRTL ? 'نشر مقالات تقنية ودروس تحليل البيانات ورؤى الذكاء الاصطناعي.' : 'Publish blog posts, data tutorials, and insights for your audience.')}
                {activeTab === 'messages' && (isRTL ? 'الاستفسارات الواردة والملاحظات المرسلة عبر نموذج التواصل.' : 'Inbound inquiries and feedback submitted via the contact form.')}
                {activeTab === 'settings' && (isRTL ? 'إدارة النبذة الشخصية والمسمى الوظيفي وبيانات التواصل.' : 'Manage your personal bio, headline, contact coordinates, and skills.')}
              </p>
            </div>
          </div>

          {/* Quick Header Actions: Language Switcher + Date + Add Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Admin Language Switcher */}
            <div className="flex items-center bg-gray-100 border border-gray-200 rounded-full p-1 text-xs">
              <Globe className="w-3.5 h-3.5 text-[#374159] mx-1 hidden sm:block" />
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`px-2.5 py-1 rounded-full font-medium transition-all cursor-pointer ${
                  lang === 'en'
                    ? 'bg-[#222936] text-white font-bold shadow-xs'
                    : 'text-gray-600 hover:text-black'
                }`}
                title="English"
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLang('ar')}
                className={`px-2.5 py-1 rounded-full font-medium transition-all cursor-pointer ${
                  lang === 'ar'
                    ? 'bg-[#222936] text-white font-bold shadow-xs'
                    : 'text-gray-600 hover:text-black'
                }`}
                title="العربية"
              >
                عربي
              </button>
            </div>

            <div className="hidden md:flex items-center px-3.5 py-1.5 rounded-full border border-gray-200 text-xs text-gray-600 bg-white shadow-2xs font-medium gap-2">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <span>{isRTL ? 'آخر 7 أيام' : 'Last 7 days'}</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </div>

            {activeTab === 'projects' && (
              <button
                onClick={handleOpenAddProject}
                className="bg-[#222936] hover:bg-[#374159] text-white px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#B9D895]" />
                <span className="hidden sm:inline">{isRTL ? 'مشروع جديد' : 'New Project'}</span>
                <span className="sm:hidden">{isRTL ? 'إضافة' : 'Add'}</span>
              </button>
            )}

            {activeTab === 'articles' && (
              <button
                onClick={handleOpenAddArticle}
                className="bg-[#222936] hover:bg-[#374159] text-white px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#B9D895]" />
                <span className="hidden sm:inline">{isRTL ? 'مقال جديد' : 'New Article'}</span>
                <span className="sm:hidden">{isRTL ? 'كتابة' : 'Write'}</span>
              </button>
            )}
          </div>
        </header>

        {/* BODY CONTAINER */}
        <main className="p-4 sm:p-8 space-y-8 max-w-7xl w-full mx-auto">
          
          {/* TAB 1: OVERVIEW & DASHBOARD */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              
              {/* Category / Filter Pills Bar */}
              <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1">
                <span className="text-xs font-semibold text-gray-500 mx-2 flex items-center gap-1 shrink-0">
                  <Filter className="w-3.5 h-3.5" /> {isRTL ? 'تصفية العرض:' : 'Filter Views:'}
                </span>
                {['All', 'Data Analysis', 'AI', 'Web App', 'E-commerce', 'Mobile App'].map((cat) => {
                  const isSelected = selectedCategory === cat
                  const catLabel = cat === 'All' 
                    ? (isRTL ? 'الكل' : 'All')
                    : (cat === 'Data Analysis' && isRTL ? 'تحليل البيانات' : (cat === 'AI' && isRTL ? 'الذكاء الاصطناعي' : cat))
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`text-xs px-3.5 py-1.5 rounded-full transition-all cursor-pointer font-medium shrink-0 ${
                        isSelected
                          ? 'bg-[#1E232F] text-white shadow-sm'
                          : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {catLabel}
                    </button>
                  )
                })}
              </div>

              {/* 8 METRIC CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* 1. Net Views */}
                <div className="bg-white rounded-[18px] p-5 border border-[#E7E9ED] shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-500">{isRTL ? 'مشاهدات البورتفوليو' : 'Portfolio Views'}</span>
                    <span className="px-1.5 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-600">+14%</span>
                  </div>
                  <div className="my-3">
                    <span className="text-2xl font-black text-[#1E232F] tracking-tight">
                      {(analytics?.totalPageViews || 1420).toLocaleString()}
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-400">{isRTL ? 'تتبع لحظي للزيارات' : 'Real-time visit tracking'}</span>
                </div>

                {/* 2. Unique Visitors */}
                <div className="bg-white rounded-[18px] p-5 border border-[#E7E9ED] shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-500">{isRTL ? 'الزوار الفريدون' : 'Unique Visitors'}</span>
                    <span className="px-1.5 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-600">-6%</span>
                  </div>
                  <div className="my-3">
                    <span className="text-2xl font-black text-[#1E232F] tracking-tight">
                      {(analytics?.uniqueVisitors || 480).toLocaleString()}
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-400">{isRTL ? 'أجهزة ومصادر فريدة' : 'Unique client devices'}</span>
                </div>

                {/* 3. Published Projects */}
                <div className="bg-white rounded-[18px] p-5 border border-[#E7E9ED] shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-500">{isRTL ? 'إجمالي المشاريع' : 'Total Projects'}</span>
                    <span className="px-1.5 py-0.5 rounded text-[11px] font-bold bg-[#E0F6C4] text-[#222936] font-semibold">{projects.length} {isRTL ? 'نشط' : 'Active'}</span>
                  </div>
                  <div className="my-3">
                    <span className="text-2xl font-black text-[#1E232F] tracking-tight">{projects.length}</span>
                  </div>
                  <span className="text-[11px] text-gray-400">{isRTL ? 'بين البيانات والويب' : 'Across Data & Web Apps'}</span>
                </div>

                {/* 4. Articles Published */}
                <div className="bg-white rounded-[18px] p-5 border border-[#E7E9ED] shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-500">{isRTL ? 'المقالات والمدونة' : 'Articles & Blog'}</span>
                    <span className="px-1.5 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-600">{articles.length} {isRTL ? 'منشور' : 'Live'}</span>
                  </div>
                  <div className="my-3">
                    <span className="text-2xl font-black text-[#1E232F] tracking-tight">{articles.length}</span>
                  </div>
                  <span className="text-[11px] text-gray-400">
                    {isRTL ? 'إجمالي قراءات المقالات: ' : 'Total article reads: '}
                    <strong className="text-gray-700">
                      {(analytics?.totalArticleViews || articles.reduce((sum, a) => sum + (a.views || 0), 0)).toLocaleString()}
                    </strong>
                  </span>
                </div>

                {/* 5. Project Clicks */}
                <div className="bg-white rounded-[18px] p-5 border border-[#E7E9ED] shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-500">{isRTL ? 'نقرات وتصفح المشاريع' : 'Project Clicks'}</span>
                    <span className="px-1.5 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-600">+18%</span>
                  </div>
                  <div className="my-3">
                    <span className="text-2xl font-black text-[#1E232F] tracking-tight">
                      {(analytics?.projectClicks || 320).toLocaleString()}
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-400">{isRTL ? 'تفاعل مباشر مع تفاصيل المشاريع' : 'Interactions with portfolio cases'}</span>
                </div>

                {/* 6. CV Downloads */}
                <div className="bg-white rounded-[18px] p-5 border border-[#E7E9ED] shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-500">{isRTL ? 'تحميلات السيرة الذاتية' : 'CV Downloads'}</span>
                    <span className="px-1.5 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-600">+20%</span>
                  </div>
                  <div className="my-3">
                    <span className="text-2xl font-black text-[#1E232F] tracking-tight">
                      {(analytics?.cvDownloads || 48).toLocaleString()}
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-400">Mohamed_Hegazy_CV.pdf</span>
                </div>

                {/* 7. Contact Inquiries */}
                <div className="bg-white rounded-[18px] p-5 border border-[#E7E9ED] shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-500">{isRTL ? 'رسائل التواصل' : 'Inbound Inquiries'}</span>
                    <span className="px-1.5 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-600">{isRTL ? 'نشط' : 'Active'}</span>
                  </div>
                  <div className="my-3">
                    <span className="text-2xl font-black text-[#1E232F] tracking-tight">{messages.length}</span>
                  </div>
                  <span className="text-[11px] text-gray-400">{isRTL ? 'استفسارات العملاء والشركات' : 'Recruiter inquiries'}</span>
                </div>

                {/* 8. Engagement Rate */}
                <div className="bg-white rounded-[18px] p-5 border border-[#E7E9ED] shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-500">{isRTL ? 'معدل التفاعل' : 'Engagement Rate'}</span>
                    <span className="px-1.5 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-600">+0.29%</span>
                  </div>
                  <div className="my-3">
                    <span className="text-2xl font-black text-[#1E232F] tracking-tight">
                      {analytics?.engagementRate || "3.85%"}
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-400">{isRTL ? 'نسبة التحويل والتواصل' : 'Action conversion ratio'}</span>
                </div>

              </div>

              {/* DUAL CHARTS ROW */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Chart 1: Bar Volume Chart */}
                <div className="lg:col-span-7 bg-white rounded-[20px] p-6 border border-[#E7E9ED] shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        {isRTL ? 'حجم الزيارات الأسبوعي' : 'Weekly Traffic Volume'}
                      </span>
                      <h3 className="text-lg font-bold text-[#1E232F]">
                        {isRTL ? 'مرات ظهور الزوار يومياً' : 'Daily Visitor Impressions'}
                      </h3>
                      <span className="text-xs text-gray-400">Mar 13, 2026 - Mar 19, 2026</span>
                    </div>
                    <div className="text-end">
                      <span className="text-xs text-gray-400">{isRTL ? 'زيارات اليوم' : "Today's Traffic"}</span>
                      <div className="text-xl font-black text-[#1E232F] flex items-center justify-end gap-1.5">
                        3,179
                        <span className="text-[10px] px-1 rounded bg-emerald-100 text-emerald-700 font-bold">+8%</span>
                      </div>
                    </div>
                  </div>

                  {/* SVG Bar Chart with highlighted bar */}
                  <div className="h-52 w-full pt-4 relative">
                    <svg className="w-full h-full" viewBox="0 0 500 160">
                      <line x1="0" y1="40" x2="500" y2="40" stroke="#F0F2F5" strokeDasharray="3 3" />
                      <line x1="0" y1="80" x2="500" y2="80" stroke="#F0F2F5" strokeDasharray="3 3" />
                      <line x1="0" y1="120" x2="500" y2="120" stroke="#F0F2F5" strokeDasharray="3 3" />

                      {[
                        30, 45, 60, 50, 75, 90, 85, 110, 95, 105, 80, 70, 55, 60, 85, 115, 140, 130, 125, 110
                      ].map((val, idx) => {
                        const x = idx * 24 + 15
                        const isHighlight = idx === 16
                        return (
                          <g key={idx}>
                            <rect
                              x={x}
                              y={150 - val}
                              width="12"
                              height={val}
                              rx="3"
                              fill={isHighlight ? "#10B981" : "#E5E7EB"}
                              className="transition-all hover:fill-[#374159]"
                            />
                            {isHighlight && (
                              <g>
                                <rect x={x - 45} y="10" width="105" height="34" rx="6" fill="#1E232F" />
                                <text x={x + 7} y="25" fill="#E0F6C4" fontSize="9" fontWeight="bold" textAnchor="middle">17 March 10:52 AM</text>
                                <text x={x + 7} y="37" fill="#FFFFFF" fontSize="10" fontWeight="bold" textAnchor="middle">{isRTL ? '3,179 مشاهدة' : '3,179 Views'}</text>
                              </g>
                            )}
                          </g>
                        )
                      })}
                    </svg>

                    <div className="flex justify-between text-[11px] text-gray-400 pt-2 px-3 border-t border-gray-100">
                      <span>Mar 13</span>
                      <span>Mar 14</span>
                      <span>Mar 15</span>
                      <span>Mar 16</span>
                      <span className="font-bold text-[#1E232F]">Mar 17</span>
                      <span>Mar 18</span>
                      <span>Mar 19</span>
                    </div>
                  </div>
                </div>

                {/* Chart 2: Spline Curves */}
                <div className="lg:col-span-5 bg-white rounded-[20px] p-6 border border-[#E7E9ED] shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        {isRTL ? 'مقاييس التحويل' : 'Conversion Metrics'}
                      </span>
                      <h3 className="text-lg font-bold text-[#1E232F]">
                        {isRTL ? 'منحنيات التفاعل' : 'Engagement Curves'}
                      </h3>
                      <span className="text-xs text-gray-400">Mar 13, 2026 - Mar 19, 2026</span>
                    </div>
                    <div className="flex items-center gap-3 text-end">
                      <div>
                        <span className="text-[10px] text-emerald-600 block">{isRTL ? '● قراءات المشاريع' : '● Project Reads'}</span>
                        <span className="text-sm font-bold text-[#1E232F]">0.899 <span className="text-[10px] text-emerald-600">+7%</span></span>
                      </div>
                      <div>
                        <span className="text-[10px] text-rose-500 block">{isRTL ? '● معدل التواصل' : '● Contact Rate'}</span>
                        <span className="text-sm font-bold text-[#1E232F]">0.272 <span className="text-[10px] text-rose-500">-12%</span></span>
                      </div>
                    </div>
                  </div>

                  <div className="h-52 w-full pt-4 relative">
                    <svg className="w-full h-full" viewBox="0 0 350 160">
                      <line x1="0" y1="40" x2="350" y2="40" stroke="#F0F2F5" strokeDasharray="3 3" />
                      <line x1="0" y1="80" x2="350" y2="80" stroke="#F0F2F5" strokeDasharray="3 3" />
                      <line x1="0" y1="120" x2="350" y2="120" stroke="#F0F2F5" strokeDasharray="3 3" />

                      <path
                        d="M 10 90 Q 60 90 100 105 T 180 115 T 260 95 T 340 70"
                        fill="none"
                        stroke="#10B981"
                        strokeWidth="2.5"
                      />
                      <path
                        d="M 10 110 Q 70 120 130 115 T 230 110 T 340 105"
                        fill="none"
                        stroke="#D1D5DB"
                        strokeWidth="2"
                        strokeDasharray="4 4"
                      />
                      <circle cx="260" cy="95" r="4" fill="#10B981" />
                    </svg>

                    <div className="flex justify-between text-[11px] text-gray-400 pt-2 px-2 border-t border-gray-100">
                      <span>Mar 13</span>
                      <span>Mar 15</span>
                      <span className="font-bold text-[#1E232F]">Mar 17</span>
                      <span>Mar 19</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: PROJECTS MANAGEMENT */}
          {activeTab === 'projects' && (
            <div className="bg-white rounded-[20px] p-6 border border-[#E7E9ED] shadow-sm space-y-6">
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-[#1E232F]">
                    {isRTL ? 'جميع مشاريع البورتفوليو' : 'All Portfolio Projects'}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {isRTL ? 'إدارة دراسات الحالة وروابط العرض الحي والتصنيفات.' : 'Manage case studies, live links, and categories.'}
                  </p>
                </div>

                <button
                  onClick={handleOpenAddProject}
                  className="bg-[#222936] hover:bg-[#374159] text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-[#B9D895]" />
                  <span>{isRTL ? 'إضافة مشروع جديد' : 'Upload New Project'}</span>
                </button>
              </div>

              {/* Projects Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-start text-xs border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-400 font-medium">
                      <th className="py-3 px-4">{isRTL ? 'المشروع' : 'Project'}</th>
                      <th className="py-3 px-4">{isRTL ? 'الفئة' : 'Category'}</th>
                      <th className="py-3 px-4">{isRTL ? 'العميل' : 'Client'}</th>
                      <th className="py-3 px-4">{isRTL ? 'الروابط' : 'Live / Repo'}</th>
                      <th className="py-3 px-4 text-end">{isRTL ? 'الإجراءات' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {projects.map((proj) => (
                      <tr key={proj._id || proj.slug} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-4 px-4 flex items-center gap-3">
                          <img
                            src={proj.thumbnail}
                            alt={proj.title}
                            className="w-12 h-10 rounded-lg object-cover border border-gray-200 shrink-0"
                          />
                          <div>
                            <span className="font-bold text-gray-900 block" dir="auto">{proj.title}</span>
                            <span className="text-[11px] text-gray-400 truncate max-w-xs block" dir="auto">{proj.subtitle}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-700">
                            {proj.category}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-gray-600 font-medium" dir="auto">{proj.client}</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            {proj.liveUrl && proj.liveUrl !== '#' && (
                              <a href={proj.liveUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                                <span>{isRTL ? 'مباشر' : 'Live'}</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                            {proj.repoUrl && proj.repoUrl !== '#' && (
                              <a href={proj.repoUrl} target="_blank" rel="noreferrer" className="text-gray-600 hover:underline">
                                {isRTL ? 'الكود' : 'Repo'}
                              </a>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-end">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEditProject(proj)}
                              className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                              title={isRTL ? "تعديل المشروع" : "Edit Project"}
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProject(proj._id || proj.slug, proj.title)}
                              className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title={isRTL ? "حذف المشروع" : "Delete Project"}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* TAB 3: ARTICLES & BLOG MANAGEMENT */}
          {activeTab === 'articles' && (
            <div className="bg-white rounded-[20px] p-6 border border-[#E7E9ED] shadow-sm space-y-6">
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-[#1E232F]">
                    {isRTL ? 'المقالات وتدوينات المدونة' : 'Articles & Blog Posts'}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {isRTL ? 'نشر مقالات في تحليل البيانات والذكاء الاصطناعي وVibe Coding.' : 'Publish thought leadership on Data Analysis, AI, and Vibe Coding.'}
                  </p>
                </div>

                <button
                  onClick={handleOpenAddArticle}
                  className="bg-[#222936] hover:bg-[#374159] text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-[#B9D895]" />
                  <span>{isRTL ? 'كتابة مقال جديد' : 'Write New Article'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {articles.map((art) => (
                  <div
                    key={art._id || art.slug}
                    className="p-5 rounded-2xl border border-gray-200 hover:border-gray-300 bg-white transition-all space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="aspect-[16/9] w-full rounded-xl overflow-hidden bg-gray-100">
                        <img
                          src={art.coverImage}
                          alt={art.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#E0F6C4] text-[#222936]">
                          {art.category}
                        </span>
                        <div className="flex items-center gap-3 text-[11px] text-gray-400">
                          <span className="flex items-center gap-1 font-medium text-gray-600">
                            <Calendar className="w-3 h-3 text-[#1E232F]" />
                            <span>{formatCompactDateTime(art.createdAt, lang)}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" /> {art.views || 0} {isRTL ? 'مشاهدة' : 'views'}
                          </span>
                        </div>
                      </div>
                      <h4 className="font-bold text-base text-[#1E232F] leading-snug" dir="auto">
                        {art.title}
                      </h4>
                      <p className="text-xs text-gray-500 line-clamp-2" dir="auto">
                        {art.excerpt}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                      <Link
                        to={`/articles/${art.slug}`}
                        target="_blank"
                        className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <span>{isRTL ? 'معاينة' : 'Preview'}</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEditArticle(art)}
                          className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                          title={isRTL ? "تعديل المقال" : "Edit Article"}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteArticle(art._id || art.slug, art.title)}
                          className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title={isRTL ? "حذف المقال" : "Delete Article"}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* TAB 4: VISITOR MESSAGES */}
          {activeTab === 'messages' && (
            <div className="bg-white rounded-[20px] p-6 border border-[#E7E9ED] shadow-sm space-y-6">
              
              <div>
                <h3 className="text-lg font-bold text-[#1E232F]">
                  {isRTL ? `رسائل واستفسارات التواصل (${messages.length})` : `Contact Messages (${messages.length})`}
                </h3>
                <p className="text-xs text-gray-500">
                  {isRTL ? 'الاستفسارات الواردة المقدمة من قبل الزوار والشركات.' : 'Inbound inquiries submitted by recruiters and clients.'}
                </p>
              </div>

              {messages.length === 0 ? (
                <div className="py-16 text-center text-gray-400">
                  <Mail className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm font-medium">{isRTL ? 'لا توجد رسائل بعد.' : 'No messages yet.'}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg._id}
                      className="p-5 rounded-2xl border border-gray-200 bg-gray-50/60 hover:bg-white transition-colors flex flex-col md:flex-row md:items-start justify-between gap-4"
                    >
                      <div className="space-y-2 max-w-3xl">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-sm text-[#1E232F]" dir="auto">{msg.name}</span>
                          <span className="text-xs text-gray-400">•</span>
                          <a href={`mailto:${msg.email}`} className="text-xs text-blue-600 hover:underline" dir="ltr">
                            {msg.email}
                          </a>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-[11px] text-gray-400">
                            {new Date(msg.createdAt).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US')}
                          </span>
                        </div>
                        <p 
                          className="text-xs sm:text-sm text-gray-700 leading-relaxed bg-white p-3.5 rounded-xl border border-gray-100"
                          dir="auto"
                        >
                          {msg.message}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={`mailto:${msg.email}?subject=Reply to your inquiry regarding Data Analysis portfolio`}
                          className="px-3 py-1.5 rounded-lg bg-[#222936] text-[#E0F6C4] text-xs font-semibold hover:bg-[#374159] transition-colors"
                        >
                          {isRTL ? 'رد' : 'Reply'}
                        </a>
                        <button
                          onClick={() => handleDeleteMessage(msg._id)}
                          className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title={isRTL ? "حذف الرسالة" : "Delete message"}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

          {/* TAB 5: SITE & PROFILE SETTINGS */}
          {activeTab === 'settings' && (
            <div className="bg-white rounded-[20px] p-6 border border-[#E7E9ED] shadow-sm space-y-6">
              
              <div>
                <h3 className="text-lg font-bold text-[#1E232F]">
                  {isRTL ? 'إعدادات الملف الشخصي والنبذة' : 'Portfolio Profile & Bio Settings'}
                </h3>
                <p className="text-xs text-gray-500">
                  {isRTL ? 'تحديث المسمى الوظيفي والملخص ومكان الإقامة وروابط التواصل.' : 'Update your job headline, personal summary, location, and contact coordinates.'}
                </p>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-6 max-w-2xl">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {isRTL ? 'المسمى الوظيفي / العنوان' : 'Job Title / Headline'} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    dir="auto"
                    value={profileForm.title}
                    onChange={(e) => setProfileForm({ ...profileForm, title: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#222936] ${
                      profileErrors.title ? 'border-rose-500' : 'border-gray-200'
                    }`}
                    placeholder={isRTL ? "مثال: محلل بيانات وشغوف بالذكاء الاصطناعي" : "e.g. Data Analyst & AI Enthusiast"}
                  />
                  {profileErrors.title && (
                    <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {profileErrors.title}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {isRTL ? 'الدولة / الموقع' : 'Country / Location'}
                  </label>
                  <input
                    type="text"
                    required
                    dir="auto"
                    value={profileForm.country}
                    onChange={(e) => setProfileForm({ ...profileForm, country: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#222936]"
                    placeholder={isRTL ? "مثال: مصر، الغربية - زفتى" : "e.g. Egypt, Gharbia - Zifta"}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {isRTL ? 'النبذة والملخص الشخصي' : 'Personal Bio / Intro'} <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    dir="auto"
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#222936] resize-none ${
                      profileErrors.bio ? 'border-rose-500' : 'border-gray-200'
                    }`}
                    placeholder={isRTL ? "أخبر الزوار عن تخرجك في معهد مصر العالي (BIS)، وكورس روت، ومسار تعلم تحليل البيانات..." : "Tell visitors about your BIS graduation, Route course, and data analysis learning journey..."}
                  />
                  {profileErrors.bio && (
                    <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {profileErrors.bio}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      {isRTL ? 'البريد الإلكتروني' : 'Email'}
                    </label>
                    <input
                      type="email"
                      dir="ltr"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      className={`w-full px-4 py-2 rounded-xl border text-xs focus:ring-2 focus:ring-[#222936] ${
                        profileErrors.email ? 'border-rose-500' : 'border-gray-200'
                      }`}
                    />
                    {profileErrors.email && (
                      <p className="mt-1 text-xs text-rose-500">{profileErrors.email}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      {isRTL ? 'الهاتف' : 'Phone'}
                    </label>
                    <input
                      type="text"
                      dir="ltr"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#222936]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      {isRTL ? 'رابط GitHub' : 'GitHub URL'}
                    </label>
                    <input
                      type="url"
                      dir="ltr"
                      value={profileForm.github}
                      onChange={(e) => setProfileForm({ ...profileForm, github: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#222936]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      {isRTL ? 'رابط LinkedIn' : 'LinkedIn URL'}
                    </label>
                    <input
                      type="url"
                      dir="ltr"
                      value={profileForm.linkedin}
                      onChange={(e) => setProfileForm({ ...profileForm, linkedin: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#222936]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#222936] hover:bg-[#374159] text-white text-xs font-bold flex items-center gap-2 shadow-md cursor-pointer transition-all active:scale-95"
                >
                  <Save className="w-4 h-4 text-[#B9D895]" />
                  <span>{isRTL ? 'حفظ تعديلات الملف الشخصي' : 'Save Profile Updates'}</span>
                </button>
              </form>

            </div>
          )}

        </main>
      </div>

      {/* PROJECT MODAL (Create / Edit) with Validation & Dir Auto */}
      <AnimatePresence>
        {projectModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setProjectModalOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-xl bg-white rounded-2xl p-6 shadow-2xl border border-gray-200 z-10 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b pb-3 mb-4">
                <h3 className="text-lg font-bold text-[#1E232F]">
                  {editingProject 
                    ? (isRTL ? 'تعديل المشروع' : 'Edit Project') 
                    : (isRTL ? 'إضافة مشروع جديد' : 'Upload New Project')}
                </h3>
                <button onClick={() => setProjectModalOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProject} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold mb-1">
                    {isRTL ? 'عنوان المشروع' : 'Project Title'} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    dir="auto"
                    placeholder={isRTL ? "مثال: لوحة تحليلات مبيعات التجزئة" : "e.g. Sales KPI Analytics"}
                    value={projectForm.title}
                    onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg ${projectErrors.title ? 'border-rose-500' : 'border-gray-200'}`}
                  />
                  {projectErrors.title && (
                    <p className="mt-1 text-rose-500">{projectErrors.title}</p>
                  )}
                </div>

                <div>
                  <label className="block font-semibold mb-1">
                    {isRTL ? 'الوصف المختصر' : 'Subtitle / Summary'} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    dir="auto"
                    placeholder={isRTL ? "وصف موجز للقيمة التحليلية للمشروع" : "Brief description of analytical value"}
                    value={projectForm.subtitle}
                    onChange={(e) => setProjectForm({ ...projectForm, subtitle: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg ${projectErrors.subtitle ? 'border-rose-500' : 'border-gray-200'}`}
                  />
                  {projectErrors.subtitle && (
                    <p className="mt-1 text-rose-500">{projectErrors.subtitle}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">{isRTL ? 'الفئة' : 'Category'}</label>
                    <select
                      value={projectForm.category}
                      onChange={(e) => setProjectForm({ ...projectForm, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white"
                    >
                      <option value="Data Analysis">{isRTL ? 'تحليل البيانات' : 'Data Analysis'}</option>
                      <option value="AI">{isRTL ? 'الذكاء الاصطناعي' : 'AI'}</option>
                      <option value="Web App">{isRTL ? 'تطبيقات الويب' : 'Web App'}</option>
                      <option value="E-commerce">{isRTL ? 'التجارة الإلكترونية' : 'E-commerce'}</option>
                      <option value="Mobile App">{isRTL ? 'تطبيقات الموبايل' : 'Mobile App'}</option>
                      <option value="Website">{isRTL ? 'موقع إلكتروني' : 'Website'}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">{isRTL ? 'النوع' : 'Type'}</label>
                    <input
                      type="text"
                      dir="auto"
                      placeholder={isRTL ? "مثال: لوحة Power BI" : "e.g. Power BI Dashboard"}
                      value={projectForm.type}
                      onChange={(e) => setProjectForm({ ...projectForm, type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1">{isRTL ? 'اسم العميل / الجهة' : 'Client Name'}</label>
                  <input
                    type="text"
                    dir="auto"
                    placeholder={isRTL ? "مثال: شركة مصفوفة التجزئة" : "e.g. Retail Matrix"}
                    value={projectForm.client}
                    onChange={(e) => setProjectForm({ ...projectForm, client: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">
                    {isRTL ? 'رابط الصورة المصغرة' : 'Thumbnail Image URL'} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="url"
                    required
                    dir="ltr"
                    value={projectForm.thumbnail}
                    onChange={(e) => setProjectForm({ ...projectForm, thumbnail: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg ${projectErrors.thumbnail ? 'border-rose-500' : 'border-gray-200'}`}
                  />
                  {projectErrors.thumbnail && (
                    <p className="mt-1 text-rose-500">{projectErrors.thumbnail}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">{isRTL ? 'رابط المعاينة المباشرة (اختياري)' : 'Live URL (optional)'}</label>
                    <input
                      type="text"
                      dir="ltr"
                      placeholder="https://..."
                      value={projectForm.liveUrl}
                      onChange={(e) => setProjectForm({ ...projectForm, liveUrl: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg ${projectErrors.liveUrl ? 'border-rose-500' : 'border-gray-200'}`}
                    />
                    {projectErrors.liveUrl && (
                      <p className="mt-1 text-rose-500">{projectErrors.liveUrl}</p>
                    )}
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">{isRTL ? 'رابط مستودع GitHub (اختياري)' : 'GitHub Repo URL (optional)'}</label>
                    <input
                      type="text"
                      dir="ltr"
                      placeholder="https://github.com/..."
                      value={projectForm.repoUrl}
                      onChange={(e) => setProjectForm({ ...projectForm, repoUrl: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg ${projectErrors.repoUrl ? 'border-rose-500' : 'border-gray-200'}`}
                    />
                    {projectErrors.repoUrl && (
                      <p className="mt-1 text-rose-500">{projectErrors.repoUrl}</p>
                    )}
                  </div>
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t">
                  <button
                    type="button"
                    onClick={() => setProjectModalOpen(false)}
                    className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 cursor-pointer"
                  >
                    {isRTL ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#222936] text-[#E0F6C4] rounded-lg font-bold hover:bg-[#374159] cursor-pointer"
                  >
                    {isRTL ? 'حفظ المشروع' : 'Save Project'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ARTICLE MODAL (Create / Edit) with Validation & Proper Dir Auto for Content */}
      <AnimatePresence>
        {articleModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setArticleModalOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-white rounded-2xl p-6 shadow-2xl border border-gray-200 z-10 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b pb-3 mb-4">
                <h3 className="text-lg font-bold text-[#1E232F]">
                  {editingArticle 
                    ? (isRTL ? 'تعديل المقال' : 'Edit Blog Article') 
                    : (isRTL ? 'نشر مقال جديد في المدونة' : 'Publish New Blog Article')}
                </h3>
                <button onClick={() => setArticleModalOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveArticle} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold mb-1">
                    {isRTL ? 'عنوان المقال' : 'Article Title'} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    dir="auto"
                    placeholder={isRTL ? "مثال: كيف تستفيد من Vibe Coding في معالجة البيانات باستخدام Pandas" : "e.g. How to use Vibe Coding with Pandas"}
                    value={articleForm.title}
                    onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg ${articleErrors.title ? 'border-rose-500' : 'border-gray-200'}`}
                  />
                  {articleErrors.title && (
                    <p className="mt-1 text-rose-500">{articleErrors.title}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">{isRTL ? 'الفئة' : 'Category'}</label>
                    <select
                      value={articleForm.category}
                      onChange={(e) => setArticleForm({ ...articleForm, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white"
                    >
                      <option value="Data Analysis">{isRTL ? 'تحليل البيانات' : 'Data Analysis'}</option>
                      <option value="AI & Vibe Coding">{isRTL ? 'الذكاء الاصطناعي وVibe Coding' : 'AI & Vibe Coding'}</option>
                      <option value="Business Intelligence">{isRTL ? 'ذكاء الأعمال (BI)' : 'Business Intelligence'}</option>
                      <option value="Web Development">{isRTL ? 'تطوير الويب' : 'Web Development'}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">{isRTL ? 'وقت القراءة التقريبي' : 'Estimated Read Time'}</label>
                    <input
                      type="text"
                      dir="auto"
                      placeholder={isRTL ? "مثال: 5 دقائق قراءة" : "e.g. 5 min read"}
                      value={articleForm.readTime}
                      onChange={(e) => setArticleForm({ ...articleForm, readTime: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1">
                    {isRTL ? 'المقتطف / الملخص التمهيدي' : 'Excerpt / Brief Summary'} <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    dir="auto"
                    placeholder={isRTL ? "مقدمة مشوقة وموجزة تظهر في بطاقات المعاينة" : "Short engaging hook that appears in previews"}
                    value={articleForm.excerpt}
                    onChange={(e) => setArticleForm({ ...articleForm, excerpt: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg resize-none ${articleErrors.excerpt ? 'border-rose-500' : 'border-gray-200'}`}
                  />
                  {articleErrors.excerpt && (
                    <p className="mt-1 text-rose-500">{articleErrors.excerpt}</p>
                  )}
                </div>

                <div>
                  <label className="block font-semibold mb-1">
                    {isRTL ? 'رابط صورة الغلاف' : 'Cover Image URL'} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="url"
                    required
                    dir="ltr"
                    value={articleForm.coverImage}
                    onChange={(e) => setArticleForm({ ...articleForm, coverImage: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg ${articleErrors.coverImage ? 'border-rose-500' : 'border-gray-200'}`}
                  />
                  {articleErrors.coverImage && (
                    <p className="mt-1 text-rose-500">{articleErrors.coverImage}</p>
                  )}
                </div>

                {/* Article Body Content with dir="auto" for natural typing in Arabic and English */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold">
                      {isRTL ? 'نص المقال / المحتوى الكامل' : 'Article Body / Full Content'} <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] text-gray-400">
                      {isRTL ? 'يدعم الكتابة بالعربية والإنجليزية تلقائياً' : 'Supports auto text direction'}
                    </span>
                  </div>
                  <textarea
                    rows={8}
                    required
                    dir="auto"
                    placeholder={isRTL ? "اكتب محتوى مقالك هنا، يمكنك كتابة فقرات أو نقاط باللغة العربية أو الإنجليزية بكل راحة..." : "Write your article in markdown or plain text..."}
                    value={articleForm.content}
                    onChange={(e) => setArticleForm({ ...articleForm, content: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg text-sm leading-relaxed resize-y ${articleErrors.content ? 'border-rose-500' : 'border-gray-200'}`}
                  />
                  {articleErrors.content && (
                    <p className="mt-1 text-rose-500">{articleErrors.content}</p>
                  )}
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t">
                  <button
                    type="button"
                    onClick={() => setArticleModalOpen(false)}
                    className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 cursor-pointer"
                  >
                    {isRTL ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#222936] text-[#E0F6C4] rounded-lg font-bold hover:bg-[#374159] cursor-pointer"
                  >
                    {isRTL ? 'نشر المقال' : 'Publish Article'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}
