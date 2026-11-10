import { Profile, Project, Article, Message, DailySnapshot } from './model/index.js'
import { getDBStatus } from './connection.db.js'

export const defaultProfile = {
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

export const defaultProjects = [
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

export const defaultArticles = [
    {
        _id: "art_1",
        title: "The Rise of Vibe Coding: How AI Is Redefining Modern Development",
        slug: "rise-of-vibe-coding",
        category: "AI & Vibe Coding",
        excerpt: "Exploring how natural language prompting and intelligent agents enable rapid prototyping and data-driven application delivery without traditional boilerplate friction.",
        content: `Vibe coding marks a paradigm shift in how developers and analysts interact with systems. Rather than getting lost in tedious syntax and repetitive boilerplate, developers focus on system architecture, analytical thinking, and business logic.

### Why Vibe Coding Matters for Data Analysts
1. **Accelerated Prototyping:** Turn business hypotheses into functional dashboards in hours instead of days.
2. **Context-Driven Automation:** Seamlessly script complex data transformations using LLM capabilities.
3. **Focus on Insights:** Spend less time fighting dependencies and more time interpreting trends and finding value in business metrics.

By marrying core knowledge of database structures with AI acceleration, modern analysts operate with tenfold speed while maintaining high quality standards.`,
        coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
        readTime: "4 min read",
        author: "Mohamed Mahmoud Hegazy",
        published: true,
        views: 248,
        createdAt: new Date(Date.now() - 3600000 * 2) // 2 hours ago
    },
    {
        _id: "art_2",
        title: "Mastering Exploratory Data Analysis (EDA) with Python & Pandas",
        slug: "mastering-eda-python-pandas",
        category: "Data Analysis",
        excerpt: "A structured walkthrough on handling messy datasets, identifying statistical outliers, and uncovering core business distributions before modeling.",
        content: `Before creating any dashboard or machine learning model, thorough Exploratory Data Analysis (EDA) is vital.

### The 4 Pillars of Clean EDA:
- **Distribution Analysis:** Understanding skewness, variance, and central tendencies.
- **Handling Missing Values:** Differentiating between MCAR, MAR, and MNAR patterns to apply appropriate imputation.
- **Correlation Maps:** Identifying colinear variables and relationships between business KPIs.
- **Outlier Treatment:** Using IQR and Z-scores to distinguish between genuine anomalies and operational data noise.

Applying this discipline ensures that business leaders make decisions based on rock-solid foundations rather than misleading artifacts.`,
        coverImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
        readTime: "6 min read",
        author: "Mohamed Mahmoud Hegazy",
        published: true,
        views: 412,
        createdAt: new Date(Date.now() - 86400000 * 1 - 3600000 * 4) // Yesterday
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
        createdAt: new Date(Date.now() - 86400000 * 2 - 3600000 * 6) // 2 days ago
    }
]

export const defaultMessages = [
    {
        _id: "msg_1",
        name: "Ahmed Hassan",
        email: "ahmed.hassan@example.com",
        message: "Hello Mohamed, we reviewed your data analytics portfolio and would love to discuss a business dashboard project for our retail branch.",
        createdAt: new Date(Date.now() - 86400000 * 2)
    },
    {
        _id: "msg_2",
        name: "Sara Kamal",
        email: "sara.kamal@agency.com",
        message: "Great work on the customer segmentation model! Are you available for remote data consulting contracts?",
        createdAt: new Date(Date.now() - 86400000 * 4)
    }
]

export const seedDB = async () => {
    if (!getDBStatus()) {
        return false
    }
    try {
        await Profile.deleteMany({})
        await Profile.create(defaultProfile)
        console.log("[DB Seed]: Profile data updated to Data Analyst successfully.")

        const countProjects = await Project.countDocuments()
        if (countProjects === 0) {
            await Project.insertMany(defaultProjects)
            console.log("[DB Seed]: Projects seeded successfully.")
        }

        const countArticles = await Article.countDocuments()
        if (countArticles === 0) {
            await Article.insertMany(defaultArticles)
            console.log("[DB Seed]: Articles seeded successfully.")
        }

        // Seed empty daily snapshots for the last 7 days if none exist
        const countSnapshots = await DailySnapshot.countDocuments()
        if (countSnapshots === 0) {
            const snapshots = []
            for (let i = 6; i >= 0; i--) {
                const d = new Date()
                d.setDate(d.getDate() - i)
                snapshots.push({ date: d.toISOString().slice(0, 10), views: 0, uniqueVisitors: 0, projectClicks: 0, cvDownloads: 0 })
            }
            await DailySnapshot.insertMany(snapshots)
            console.log("[DB Seed]: Daily snapshot baseline seeded.")
        }

        return true
    } catch (err) {
        console.error("[DB Seed Error]:", err.message)
        return false
    }
}
