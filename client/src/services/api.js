const API_BASE = '/api'

export const fallbackProfile = {
  name: "Mohamed Mahmoud Hegazy",
  shortName: "Mohamed",
  initials: "mmh",
  title: "Data Analyst & AI Enthusiast",
  country: "Egypt, Gharbia - Zifta",
  birthDate: "2003-01-16",
  bio: "Data Analyst and Business Information Systems graduate from Misr Higher Institute for Commerce and Computers (MET - Mansoura). Passionate about Data Analysis, AI, Vibe Coding, and leveraging modern analytical and development tools to turn raw data into strategic business insights.",
  avatarUrl: "/assets/avatar.jpg",
  heroImageUrl: "/assets/mohamed_hero.jpg",
  cvUrl: "/Mohamed_Hegazy_CV.pdf",
  socials: {
    github: "https://github.com/mohamedhegazy",
    linkedin: "https://linkedin.com/in/mohamedhegazy",
    email: "mohamed12hegazy11@gmail.com",
    phone: "+20 101 511 2428",
    location: "Zifta, Gharbia, Egypt"
  },
  tools: [
    { name: "Python", icon: "Code2" },
    { name: "SQL", icon: "Database" },
    { name: "Power BI", icon: "BarChart3" },
    { name: "Excel Advanced", icon: "Table" },
    { name: "Data Cleaning & EDA", icon: "Filter" },
    { name: "AI & Vibe Coding", icon: "Cpu" },
    { name: "Node.js & MongoDB", icon: "Server" },
    { name: "Web Design Principles", icon: "Layout" }
  ]
}

export const fallbackProjects = [
  {
    _id: "proj_1",
    title: "Sales & Churn Analytics Dashboard",
    slug: "sales-churn-analytics",
    subtitle: "Interactive Power BI & Python analytics dashboard tracking retail performance, revenue metrics, and customer retention.",
    logoUrl: "DA",
    category: "Data Analysis",
    type: "BI Dashboard",
    client: "Retail Matrix",
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80"
    ],
    liveUrl: "https://example.com/churn-dashboard",
    repoUrl: "https://github.com/example/churn-dashboard",
    order: 1,
    featured: true
  },
  {
    _id: "proj_2",
    title: "Market Basket & Customer Segmentation",
    slug: "customer-segmentation-rfm",
    subtitle: "RFM customer segmentation and transaction basket analysis conducted with Python, SQL, and Pandas.",
    logoUrl: "RFM",
    category: "Data Analysis",
    type: "Predictive Analytics",
    client: "MarketPulse Corp",
    thumbnail: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1543286386-713bdd548da4?auto=format&fit=crop&w=1200&q=80"
    ],
    liveUrl: "https://example.com/segmentation",
    repoUrl: "https://github.com/example/segmentation",
    order: 2,
    featured: true
  },
  {
    _id: "proj_3",
    title: "AI Financial Anomaly Detector",
    slug: "ai-financial-anomaly",
    subtitle: "Machine learning & AI workflow identifying statistical anomalies and forecasting monthly business expenditures.",
    logoUrl: "AI",
    category: "AI",
    type: "AI Pipeline",
    client: "FinTrack Systems",
    thumbnail: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80"
    ],
    liveUrl: "https://example.com/ai-anomaly",
    repoUrl: "https://github.com/example/ai-anomaly",
    order: 3,
    featured: true
  },
  {
    _id: "proj_4",
    title: "Roamento Memory Archive",
    slug: "roamento",
    subtitle: "Clean web application and personal archive designed with modern web principles and cloud data persistence.",
    logoUrl: "R",
    category: "Web App",
    type: "Web Application",
    client: "RufoStudio",
    thumbnail: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=80"
    ],
    liveUrl: "https://example.com/roamento",
    repoUrl: "https://github.com/example/roamento",
    order: 4,
    featured: true
  },
  {
    _id: "proj_5",
    title: "Mach Sports Performance Analytics",
    slug: "mach-analytics",
    subtitle: "E-commerce data tracking system measuring conversion funnel efficiency and inventory velocity.",
    logoUrl: "M",
    category: "E-commerce",
    type: "Store Analytics",
    client: "Mach Athletics",
    thumbnail: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1200&q=80"
    ],
    liveUrl: "https://example.com/mach",
    repoUrl: "https://github.com/example/mach",
    order: 5,
    featured: true
  },
  {
    _id: "proj_6",
    title: "Pet Adapt Medical Health Tracker",
    slug: "pet-adapt",
    subtitle: "Health records tracking and veterinary appointment scheduling app with descriptive health reporting.",
    logoUrl: "PA",
    category: "Mobile App",
    type: "Mobile App",
    client: "Pet Adapt Foundation",
    thumbnail: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=1200&q=80"
    ],
    liveUrl: "https://example.com/pet-adapt",
    repoUrl: "https://github.com/example/pet-adapt",
    order: 6,
    featured: true
  },
  {
    _id: "proj_7",
    title: "Byteline API Integrations",
    slug: "byteline",
    subtitle: "Automated webhook routing and data transformation pipeline connecting CRM and analytics platforms.",
    logoUrl: "B",
    category: "Web App",
    type: "Cloud Dashboard",
    client: "Byteline Software",
    thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80"
    ],
    liveUrl: "https://example.com/byteline",
    repoUrl: "https://github.com/example/byteline",
    order: 7,
    featured: false
  }
]

export const fallbackArticles = [
  {
    _id: "art_1",
    title: "The Rise of Vibe Coding: How AI Is Redefining Modern Development",
    slug: "rise-of-vibe-coding",
    category: "AI & Vibe Coding",
    excerpt: "Exploring how natural language prompting and intelligent agents enable rapid prototyping and data-driven application delivery without traditional boilerplate friction.",
    content: `Vibe coding marks a paradigm shift in how developers and analysts interact with systems. Rather than getting lost in tedious syntax and repetitive boilerplate, developers focus on system architecture, analytical thinking, and business logic.

### Why Vibe Coding Matters for Data Analysts
1. Accelerated Prototyping: Turn business hypotheses into functional dashboards in hours instead of days.
2. Context-Driven Automation: Seamlessly script complex data transformations using LLM capabilities.
3. Focus on Insights: Spend less time fighting dependencies and more time interpreting trends and finding value in business metrics.

By marrying core knowledge of database structures with AI acceleration, modern analysts operate with tenfold speed while maintaining high quality standards.`,
    coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
    readTime: "4 min read",
    author: "Mohamed Mahmoud Hegazy",
    published: true,
    views: 248,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    _id: "art_2",
    title: "Mastering Exploratory Data Analysis (EDA) with Python & Pandas",
    slug: "mastering-eda-python-pandas",
    category: "Data Analysis",
    excerpt: "A structured walkthrough on handling messy datasets, identifying statistical outliers, and uncovering core business distributions before modeling.",
    content: `Before creating any dashboard or machine learning model, thorough Exploratory Data Analysis (EDA) is vital.

### The 4 Pillars of Clean EDA:
- Distribution Analysis: Understanding skewness, variance, and central tendencies.
- Handling Missing Values: Differentiating between MCAR, MAR, and MNAR patterns to apply appropriate imputation.
- Correlation Maps: Identifying colinear variables and relationships between business KPIs.
- Outlier Treatment: Using IQR and Z-scores to distinguish between genuine anomalies and operational data noise.

Applying this discipline ensures that business leaders make decisions based on rock-solid foundations rather than misleading artifacts.`,
    coverImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
    readTime: "6 min read",
    author: "Mohamed Mahmoud Hegazy",
    published: true,
    views: 412,
    createdAt: new Date(Date.now() - 86400000 * 1 - 3600000 * 4).toISOString()
  },
  {
    _id: "art_3",
    title: "Bridging Business Information Systems (BIS) and Modern Analytics",
    slug: "bridging-bis-and-modern-analytics",
    category: "Business Intelligence",
    excerpt: "How business process understanding, ERP systems, and financial accounting fundamentals empower analysts to build truly effective KPI reporting.",
    content: `Data analysis without deep business comprehension produces attractive charts that solve the wrong problems. 

Having an academic background in Business Information Systems (BIS) provides the vital link: understanding financial statements, supply chain lifecycles, and operational workflows. When an analyst understands the business pain points, the data transformation becomes meaningful and impactful.`,
    coverImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
    readTime: "5 min read",
    author: "Mohamed Mahmoud Hegazy",
    published: true,
    views: 185,
    createdAt: new Date(Date.now() - 86400000 * 2 - 3600000 * 6).toISOString()
  }
]

export const fallbackMessages = [
  {
    _id: "msg_1",
    name: "Ahmed Hassan",
    email: "ahmed.hassan@example.com",
    message: "Hello Mohamed, we reviewed your data analytics portfolio and would love to discuss a business dashboard project for our retail branch.",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    _id: "msg_2",
    name: "Sara Kamal",
    email: "sara.kamal@agency.com",
    message: "Great work on the customer segmentation model! Are you available for remote data consulting contracts?",
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString()
  }
]

// Profile APIs
export const fetchProfile = async () => {
  try {
    const res = await fetch(`${API_BASE}/profile`)
    if (!res.ok) throw new Error('Failed to fetch profile')
    const json = await res.json()
    return json.data || fallbackProfile
  } catch (error) {
    console.warn('API error (profile), using fallback data:', error.message)
    return fallbackProfile
  }
}

export const updateProfile = async (data) => {
  try {
    const res = await fetch(`${API_BASE}/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.message || 'Failed to update profile')
    return json.data
  } catch (error) {
    console.warn('API updateProfile error, returning local merged data:', error.message)
    return { ...fallbackProfile, ...data }
  }
}

// Projects APIs
export const fetchProjects = async (category) => {
  try {
    const url = category && category !== 'All' 
      ? `${API_BASE}/projects?category=${encodeURIComponent(category)}`
      : `${API_BASE}/projects`
    const res = await fetch(url)
    if (!res.ok) throw new Error('Failed to fetch projects')
    const json = await res.json()
    return json.data || fallbackProjects
  } catch (error) {
    console.warn('API error (projects), using fallback data:', error.message)
    if (category && category !== 'All') {
      return fallbackProjects.filter(p => p.category.toLowerCase() === category.toLowerCase())
    }
    return fallbackProjects
  }
}

export const fetchProjectBySlug = async (slug) => {
  try {
    const res = await fetch(`${API_BASE}/projects/${slug}`)
    if (!res.ok) throw new Error('Failed to fetch project')
    const json = await res.json()
    return json.data || fallbackProjects.find(p => p.slug === slug)
  } catch (error) {
    console.warn('API error (project detail), using fallback data:', error.message)
    return fallbackProjects.find(p => p.slug === slug) || null
  }
}

export const createProject = async (data) => {
  try {
    const res = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.message || 'Failed to create project')
    return json.data
  } catch (error) {
    console.warn('API createProject error, creating mock project:', error.message)
    const newProj = {
      _id: `proj_${Date.now()}`,
      ...data,
      slug: data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      createdAt: new Date().toISOString()
    }
    fallbackProjects.unshift(newProj)
    return newProj
  }
}

export const updateProject = async (id, data) => {
  try {
    const res = await fetch(`${API_BASE}/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.message || 'Failed to update project')
    return json.data
  } catch (error) {
    console.warn('API updateProject error:', error.message)
    const idx = fallbackProjects.findIndex(p => p._id === id || p.slug === id)
    if (idx !== -1) {
      fallbackProjects[idx] = { ...fallbackProjects[idx], ...data }
      return fallbackProjects[idx]
    }
    return data
  }
}

export const deleteProject = async (id) => {
  try {
    const res = await fetch(`${API_BASE}/projects/${id}`, {
      method: 'DELETE'
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.message || 'Failed to delete project')
    return true
  } catch (error) {
    console.warn('API deleteProject error:', error.message)
    const idx = fallbackProjects.findIndex(p => p._id === id || p.slug === id)
    if (idx !== -1) fallbackProjects.splice(idx, 1)
    return true
  }
}

// Articles APIs
export const fetchArticles = async (category) => {
  try {
    const url = category && category !== 'All' 
      ? `${API_BASE}/articles?category=${encodeURIComponent(category)}`
      : `${API_BASE}/articles`
    const res = await fetch(url)
    if (!res.ok) throw new Error('Failed to fetch articles')
    const json = await res.json()
    return json.data || fallbackArticles
  } catch (error) {
    console.warn('API error (articles), using fallback data:', error.message)
    if (category && category !== 'All') {
      return fallbackArticles.filter(a => a.category.toLowerCase() === category.toLowerCase())
    }
    return fallbackArticles
  }
}

export const fetchArticleBySlug = async (slug) => {
  try {
    const res = await fetch(`${API_BASE}/articles/${slug}`)
    if (!res.ok) throw new Error('Failed to fetch article')
    const json = await res.json()
    return json.data
  } catch (error) {
    console.warn('API error (article detail), using fallback data:', error.message)
    const found = fallbackArticles.find(a => a.slug === slug)
    if (found) {
      found.views = (found.views || 0) + 1
    }
    return found || null
  }
}

export const createArticle = async (data) => {
  try {
    const res = await fetch(`${API_BASE}/articles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.message || 'Failed to create article')
    return json.data
  } catch (error) {
    console.warn('API createArticle error, creating mock article:', error.message)
    const newArt = {
      _id: `art_${Date.now()}`,
      ...data,
      slug: data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      views: 0,
      createdAt: new Date().toISOString()
    }
    fallbackArticles.unshift(newArt)
    return newArt
  }
}

export const updateArticle = async (id, data) => {
  try {
    const res = await fetch(`${API_BASE}/articles/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.message || 'Failed to update article')
    return json.data
  } catch (error) {
    console.warn('API updateArticle error:', error.message)
    const idx = fallbackArticles.findIndex(a => a._id === id || a.slug === id)
    if (idx !== -1) {
      fallbackArticles[idx] = { ...fallbackArticles[idx], ...data }
      return fallbackArticles[idx]
    }
    return data
  }
}

export const deleteArticle = async (id) => {
  try {
    const res = await fetch(`${API_BASE}/articles/${id}`, {
      method: 'DELETE'
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.message || 'Failed to delete article')
    return true
  } catch (error) {
    console.warn('API deleteArticle error:', error.message)
    const idx = fallbackArticles.findIndex(a => a._id === id || a.slug === id)
    if (idx !== -1) fallbackArticles.splice(idx, 1)
    return true
  }
}

// Contact & Messages APIs
export const submitContact = async ({ name, email, subject = '', message }) => {
  const res = await fetch(`${API_BASE}/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, subject, message })
  })
  const json = await res.json()
  if (!res.ok) {
    throw new Error(json.message || 'Failed to submit contact message')
  }
  return json
}

export const fetchMessages = async () => {
  try {
    const res = await fetch(`${API_BASE}/contact/messages`)
    if (!res.ok) throw new Error('Failed to fetch messages')
    const json = await res.json()
    return json.data || fallbackMessages
  } catch (error) {
    console.warn('API error (messages), using fallback data:', error.message)
    return fallbackMessages
  }
}

export const deleteMessage = async (id) => {
  try {
    const res = await fetch(`${API_BASE}/contact/messages/${id}`, {
      method: 'DELETE'
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.message || 'Failed to delete message')
    return true
  } catch (error) {
    console.warn('API deleteMessage error:', error.message)
    const idx = fallbackMessages.findIndex(m => m._id === id)
    if (idx !== -1) fallbackMessages.splice(idx, 1)
    return true
  }
}

// ─────────────────────────────────────────────────────────────
// Analytics & View Tracking APIs
// ─────────────────────────────────────────────────────────────
export const fallbackAnalytics = {
  totalPageViews: 1420,
  uniqueVisitors: 480,
  projectClicks: 320,
  cvDownloads: 48,
  totalArticles: 3,
  totalArticleViews: 845,
  totalProjects: 7,
  totalMessages: 2,
  engagementRate: "3.85%",
  dailyVisits: [
    { date: 'Day -6', views: 180 },
    { date: 'Day -5', views: 210 },
    { date: 'Day -4', views: 195 },
    { date: 'Day -3', views: 240 },
    { date: 'Day -2', views: 275 },
    { date: 'Day -1', views: 290 },
    { date: 'Today', views: 330 }
  ]
}

export const fetchAnalytics = async () => {
  try {
    const res = await fetch(`${API_BASE}/analytics`)
    if (!res.ok) throw new Error('Failed to fetch analytics')
    const json = await res.json()
    return json.data || fallbackAnalytics
  } catch (error) {
    console.warn('API error (analytics), calculating dynamic fallback:', error.message)
    const totalArtViews = fallbackArticles.reduce((sum, a) => sum + (a.views || 0), 0)
    return {
      ...fallbackAnalytics,
      totalArticles: fallbackArticles.length,
      totalArticleViews: totalArtViews,
      totalProjects: fallbackProjects.length,
      totalMessages: fallbackMessages.length
    }
  }
}

export const trackEvent = async (event, options = {}) => {
  const page = typeof options === 'string' ? options : (options.page || window.location.pathname)
  const meta = typeof options === 'object' ? (options.meta || {}) : {}
  try {
    const res = await fetch(`${API_BASE}/analytics/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, page, meta })
    })
    return await res.json()
  } catch (err) {
    if (event === 'page_view') fallbackAnalytics.totalPageViews += 1
    if (event === 'project_click') fallbackAnalytics.projectClicks += 1
    if (event === 'cv_download') fallbackAnalytics.cvDownloads += 1
    return { success: true }
  }
}

// Track project card click + increment server counter
export const trackProjectClick = async (slug) => {
  trackEvent('project_click', { meta: { slug } })
  try {
    await fetch(`${API_BASE}/projects/${slug}/click`, { method: 'POST' })
  } catch (_) { /* silent */ }
}

// Mark message as read/unread
export const markMessageRead = async (id, isRead = true) => {
  try {
    const res = await fetch(`${API_BASE}/contact/messages/${id}/read`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isRead })
    })
    const json = await res.json()
    return json.data
  } catch (error) {
    console.warn('API markMessageRead error:', error.message)
    return null
  }
}

// Star / unstar message
export const starMessage = async (id, isStarred = true) => {
  try {
    const res = await fetch(`${API_BASE}/contact/messages/${id}/star`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isStarred })
    })
    const json = await res.json()
    return json.data
  } catch (error) {
    console.warn('API starMessage error:', error.message)
    return null
  }
}

