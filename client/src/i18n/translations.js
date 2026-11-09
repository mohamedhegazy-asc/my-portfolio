// translations.js — Full EN/AR translation dictionary for portfolio site

export const translations = {
  en: {
    // ─── Navbar ───────────────────────────────────────────────────────────────
    nav: {
      home: 'Home',
      projects: 'Projects',
      articles: 'Articles',
      services: 'Services',
      about: 'About',
      contactBtn: 'Contact Us',
      adminLabel: 'Admin Dashboard & CMS',
      openAdmin: 'Open Admin Dashboard',
    },

    // ─── Hero ─────────────────────────────────────────────────────────────────
    hero: {
      greeting: "Hey, I'm",
      from: 'From',
      cardServices: 'Services',
      cardProjects: 'Projects',
      cardAbout: 'About',
    },

    // ─── Works Section ────────────────────────────────────────────────────────
    works: {
      downloadCV: 'Download CV',
      hiPrefix: "Hi, I'm",
      myWorks: 'My works',
      all: 'All',
      noProjects: 'No projects found in this category.',
    },

    // ─── Articles Section ─────────────────────────────────────────────────────
    articles: {
      sectionTag: 'Insights & Blog',
      sectionTitle: 'Data, AI & Vibe Coding Articles',
      sectionDesc: 'Articles, thoughts, and technical tutorials exploring analytics workflows, automated systems, and modern software principles.',
      readFull: 'Read Full Article',
    },

    // ─── Services & About ─────────────────────────────────────────────────────
    services: {
      sectionTag: 'Specializations',
      sectionTitle: 'Data & Analytical Capabilities',
      sectionDesc: 'Uncovering data patterns, building predictive narratives, and engineering modern digital tools.',
      items: [
        {
          title: 'Data Analysis & BI Dashboards',
          desc: 'Transforming complex datasets into actionable business intelligence using Power BI, Excel, and SQL with clear visual KPIs.',
        },
        {
          title: 'Data Cleaning & EDA',
          desc: 'Rigorous exploratory data analysis (EDA), data wrangling, missing-value treatment, and pipeline organization using Python & Pandas.',
        },
        {
          title: 'AI & Vibe Coding',
          desc: 'Rapid prototyping and intelligent system development leveraging cutting-edge AI models, prompt engineering, and vibe coding workflows.',
        },
        {
          title: 'Web & Backend Principles',
          desc: 'Strong academic foundation in college web design, reinforced by Route Academy backend training (Node.js & MongoDB) in 2025.',
        },
      ],
    },

    // ─── About ────────────────────────────────────────────────────────────────
    about: {
      sectionTag: 'Background & Journey',
      sectionTitle: 'About Mohamed Mahmoud Hegazy',
      bio1: 'Data Analyst and graduate of the <strong>Misr Higher Institute for Commerce and Computers in Mansoura (MET)</strong>, majoring in <strong>Business Information Systems (BIS)</strong> with a Very Good overall grade and an Excellent graduation project score.',
      bio2: 'Born on <strong>January 16, 2003</strong> in <strong>Zifta, Gharbia Governorate</strong>. Gained comprehensive foundational knowledge of web design principles during college, followed by intensive Backend Development training (Node.js & MongoDB) from <strong>Route Academy (2025)</strong>.',
      bio3: 'From <strong>August 2025 to present</strong>, deeply specializing in <strong>Data Analysis</strong> (Python, SQL, Power BI, Advanced Excel, Data Wrangling) while actively practicing <strong>AI & Vibe Coding</strong> to rapidly engineer impactful software and analytical systems.',
      bornLabel: 'Born',
      bornValue: '16 Jan 2003',
      originLabel: 'Origin',
      originValue: 'Zifta, Gharbia',
      collegeLabel: 'College',
      collegeValue: 'MET Mansoura',
      gradLabel: 'Grad Project',
      gradValue: 'Excellent',
      toolbeltTitle: 'Technical Toolbelt',
      toolbeltDesc: 'Core technologies, analytical libraries, and engineering tools applied across projects:',
      timeline1Label: 'Aug 2025 - Present:',
      timeline1Value: 'Data Analysis Specialization',
      timeline2Label: '2025:',
      timeline2Value: 'Route Academy (Node.js & MongoDB)',
      timeline3Label: 'Graduation:',
      timeline3Value: 'MET Mansoura (B.I.S)',
    },

    // ─── Footer ───────────────────────────────────────────────────────────────
    footer: {
      crafted: 'Crafted with MERN Stack • React, Node.js, Express & MongoDB',
      backToTop: 'Back to Top',
    },

    // ─── Contact Modal ────────────────────────────────────────────────────────
    contact: {
      tag: 'Get in Touch',
      title: 'Send a Message',
      namePlaceholder: 'e.g. John Doe',
      nameLabel: 'Your Name',
      emailLabel: 'Email Address',
      emailPlaceholder: 'name@example.com',
      messageLabel: 'Your Message',
      messagePlaceholder: 'How can I assist you with your data, analytics, or web project?',
      sendBtn: 'Send Message',
      validationTitle: 'Validation Error',
      validationText: 'Please review and correct the highlighted fields before submitting.',
      successTitle: 'Message Sent Successfully',
      successText: 'Thank you for reaching out! I will review your message and reply as soon as possible.',
      successBtn: 'Great!',
      errorTitle: 'Submission Failed',
    },

    // ─── Floating Action Menu ─────────────────────────────────────────────────
    fab: {
      downloadCV: 'Download CV',
      contactMe: 'Contact Me',
      github: 'GitHub',
      linkedin: 'LinkedIn',
    },

    // ─── Admin Dashboard ──────────────────────────────────────────────────────
    admin: {
      brand: 'Admin CMS',
      sidebarToggle: 'Toggle Sidebar',
      tabs: {
        overview: 'Overview',
        projects: 'Projects',
        articles: 'Articles & Blog',
        messages: 'Messages',
        settings: 'Settings',
      },
      overview: {
        title: 'Dashboard Overview',
        subtitle: 'Portfolio management at a glance',
        kpiProjects: 'Total Projects',
        kpiArticles: 'Published Articles',
        kpiMessages: 'Unread Messages',
        kpiViews: 'Profile Views',
        kpiSkills: 'Skills Listed',
        kpiCategories: 'Categories',
        kpiExperience: 'Years Learning',
        kpiEngagement: 'Engagement',
      },
      projects: {
        title: 'Projects Manager',
        addBtn: 'Add Project',
        editBtn: 'Edit',
        deleteBtn: 'Delete',
        saveBtn: 'Save Project',
        cancelBtn: 'Cancel',
        formTitle: 'Add New Project',
        formEditTitle: 'Edit Project',
        fields: {
          title: 'Project Title',
          slug: 'Slug',
          description: 'Description',
          category: 'Category',
          thumbnail: 'Thumbnail URL',
          liveUrl: 'Live URL',
          githubUrl: 'GitHub URL',
          tags: 'Tags (comma separated)',
          featured: 'Featured',
        },
      },
      articles: {
        title: 'Articles & Blog',
        addBtn: 'New Article',
        editBtn: 'Edit',
        deleteBtn: 'Delete',
        saveBtn: 'Publish Article',
        cancelBtn: 'Cancel',
        formTitle: 'Create New Article',
        formEditTitle: 'Edit Article',
        fields: {
          title: 'Article Title',
          slug: 'Slug',
          excerpt: 'Excerpt',
          content: 'Full Content',
          category: 'Category',
          coverImage: 'Cover Image URL',
          readTime: 'Read Time',
          published: 'Published',
        },
      },
      messages: {
        title: 'Messages Inbox',
        deleteBtn: 'Delete',
        replyBtn: 'Reply',
        emptyState: 'No messages yet.',
        from: 'From',
      },
      settings: {
        title: 'Profile Settings',
        saveBtn: 'Save Changes',
        fields: {
          name: 'Full Name',
          shortName: 'Short Name',
          initials: 'Initials',
          title: 'Professional Title',
          bio: 'Bio / Summary',
          email: 'Email',
          github: 'GitHub URL',
          linkedin: 'LinkedIn URL',
          cvUrl: 'CV File URL',
          avatarUrl: 'Avatar URL',
          heroImageUrl: 'Hero Image URL',
          country: 'Country/Region',
        },
      },
      alerts: {
        confirmDeleteTitle: 'Confirm Delete',
        confirmDeleteText: 'This action cannot be undone.',
        confirmDeleteBtn: 'Yes, Delete',
        cancelBtn: 'Cancel',
        deleteSuccess: 'Deleted successfully.',
        saveSuccess: 'Saved successfully.',
        errorTitle: 'Error',
        validationTitle: 'Validation Error',
        validationText: 'Please fill in all required fields correctly.',
      },
    },

    // ─── Article Detail ───────────────────────────────────────────────────────
    articleDetail: {
      backBtn: 'Back to Articles',
      share: 'Share',
      minRead: 'min read',
    },

    // ─── Project Detail ───────────────────────────────────────────────────────
    projectDetail: {
      backBtn: 'Back to Projects',
      typeLabel: 'Type',
      clientLabel: 'Client',
      categoryLabel: 'Category',
      liveBtn: 'View Live',
      githubBtn: 'GitHub',
      prevBtn: 'Previous',
      nextBtn: 'Next Project',
    },

    // ─── Validation ───────────────────────────────────────────────────────────
    validation: {
      nameRequired: 'Name is required.',
      nameTooShort: 'Name must be at least 2 characters.',
      nameTooLong: 'Name must not exceed 60 characters.',
      emailRequired: 'Email address is required.',
      emailInvalid: 'Please enter a valid email address.',
      messageRequired: 'Message is required.',
      messageTooShort: 'Message must be at least 15 characters.',
      messageTooLong: 'Message must not exceed 2000 characters.',
      titleRequired: 'Title is required.',
      slugRequired: 'Slug is required.',
      descRequired: 'Description is required.',
      contentRequired: 'Content is required.',
    },
  },

  // ══════════════════════════════════════════════════════════════════════════════
  // ARABIC TRANSLATIONS
  // ══════════════════════════════════════════════════════════════════════════════
  ar: {
    nav: {
      home: 'الرئيسية',
      projects: 'المشاريع',
      articles: 'المقالات',
      services: 'الخدمات',
      about: 'عن محمد',
      contactBtn: 'تواصل معي',
      adminLabel: 'لوحة تحكم الأدمن',
      openAdmin: 'فتح لوحة التحكم',
    },

    hero: {
      greeting: 'مرحباً، أنا',
      from: 'من',
      cardServices: 'الخدمات',
      cardProjects: 'المشاريع',
      cardAbout: 'عني',
    },

    works: {
      downloadCV: 'تحميل السيرة الذاتية',
      hiPrefix: 'مرحباً، أنا',
      myWorks: 'أعمالي',
      all: 'الكل',
      noProjects: 'لا توجد مشاريع في هذه الفئة.',
    },

    articles: {
      sectionTag: 'مقالات وتحليلات',
      sectionTitle: 'مقالات في البيانات والذكاء الاصطناعي',
      sectionDesc: 'مقالات وأفكار ودروس تقنية تستكشف سير عمل التحليلات والأنظمة الآلية ومبادئ البرمجيات الحديثة.',
      readFull: 'قراءة المقال كاملاً',
    },

    services: {
      sectionTag: 'التخصصات',
      sectionTitle: 'القدرات التحليلية والبيانات',
      sectionDesc: 'اكتشاف أنماط البيانات، وبناء روايات تنبؤية، وهندسة أدوات رقمية حديثة.',
      items: [
        {
          title: 'تحليل البيانات ولوحات BI',
          desc: 'تحويل مجموعات البيانات المعقدة إلى ذكاء أعمال قابل للتنفيذ باستخدام Power BI وExcel وSQL مع مؤشرات KPI بصرية واضحة.',
        },
        {
          title: 'تنظيف البيانات والتحليل الاستكشافي',
          desc: 'تحليل استكشافي صارم للبيانات (EDA)، ومعالجة البيانات، وعلاج القيم المفقودة، وتنظيم خطوط الأنابيب باستخدام Python وPandas.',
        },
        {
          title: 'الذكاء الاصطناعي وVibe Coding',
          desc: 'النمذجة السريعة وتطوير الأنظمة الذكية باستخدام أحدث نماذج الذكاء الاصطناعي وهندسة الـ Prompt وسير عمل Vibe Coding.',
        },
        {
          title: 'مبادئ الويب والباك إند',
          desc: 'أساس أكاديمي قوي في تصميم الويب، معزز بتدريب مكثف في تطوير الباك إند (Node.js وMongoDB) من أكاديمية Route عام 2025.',
        },
      ],
    },

    about: {
      sectionTag: 'الخلفية والمسيرة',
      sectionTitle: 'عن محمد محمود حجازي',
      bio1: 'محلل بيانات وخريج <strong>معهد مصر العالي للتجارة والحاسبات بالمنصورة (MET)</strong>، تخصص <strong>نظم المعلومات الإدارية (BIS)</strong> بتقدير جيد جداً في المجموع وامتياز في مشروع التخرج.',
      bio2: 'مواليد <strong>16 يناير 2003</strong> من <strong>زفتى، محافظة الغربية</strong>. اكتسب معرفة أساسية شاملة بمبادئ تصميم الويب خلال الدراسة، تلاه تدريب مكثف في تطوير الباك إند (Node.js وMongoDB) من <strong>أكاديمية Route (2025)</strong>.',
      bio3: 'من <strong>أغسطس 2025 حتى الآن</strong>، يتخصص بعمق في <strong>تحليل البيانات</strong> (Python وSQL وPower BI وExcel المتقدم ومعالجة البيانات) مع ممارسة نشطة لـ <strong>الذكاء الاصطناعي وVibe Coding</strong> لبناء أنظمة برمجية وتحليلية مؤثرة بسرعة.',
      bornLabel: 'تاريخ الميلاد',
      bornValue: '16 يناير 2003',
      originLabel: 'مكان الميلاد',
      originValue: 'زفتى، الغربية',
      collegeLabel: 'الكلية',
      collegeValue: 'MET المنصورة',
      gradLabel: 'مشروع التخرج',
      gradValue: 'امتياز',
      toolbeltTitle: 'الأدوات التقنية',
      toolbeltDesc: 'التقنيات الأساسية والمكتبات التحليلية وأدوات الهندسة المطبقة عبر المشاريع:',
      timeline1Label: 'أغسطس 2025 - الآن:',
      timeline1Value: 'التخصص في تحليل البيانات',
      timeline2Label: '2025:',
      timeline2Value: 'أكاديمية Route (Node.js وMongoDB)',
      timeline3Label: 'التخرج:',
      timeline3Value: 'MET المنصورة (BIS)',
    },

    footer: {
      crafted: 'مصنوع بـ MERN Stack • React وNode.js وExpress وMongoDB',
      backToTop: 'العودة للأعلى',
    },

    contact: {
      tag: 'تواصل معي',
      title: 'أرسل رسالة',
      namePlaceholder: 'مثال: محمد أحمد',
      nameLabel: 'الاسم الكامل',
      emailLabel: 'البريد الإلكتروني',
      emailPlaceholder: 'name@example.com',
      messageLabel: 'رسالتك',
      messagePlaceholder: 'كيف يمكنني مساعدتك في مشروع البيانات أو التحليل أو الويب؟',
      sendBtn: 'إرسال الرسالة',
      validationTitle: 'خطأ في البيانات',
      validationText: 'يرجى مراجعة وتصحيح الحقول المُبرزة قبل الإرسال.',
      successTitle: 'تم إرسال الرسالة بنجاح',
      successText: 'شكراً للتواصل! سأراجع رسالتك وأرد في أقرب وقت ممكن.',
      successBtn: 'رائع!',
      errorTitle: 'فشل الإرسال',
    },

    fab: {
      downloadCV: 'تحميل السيرة الذاتية',
      contactMe: 'تواصل معي',
      github: 'GitHub',
      linkedin: 'LinkedIn',
    },

    admin: {
      brand: 'لوحة التحكم',
      sidebarToggle: 'تبديل الشريط الجانبي',
      tabs: {
        overview: 'نظرة عامة',
        projects: 'المشاريع',
        articles: 'المقالات والمدونة',
        messages: 'الرسائل',
        settings: 'الإعدادات',
      },
      overview: {
        title: 'نظرة عامة على لوحة التحكم',
        subtitle: 'إدارة البورتفوليو في لمحة',
        kpiProjects: 'إجمالي المشاريع',
        kpiArticles: 'المقالات المنشورة',
        kpiMessages: 'الرسائل غير المقروءة',
        kpiViews: 'مشاهدات الملف الشخصي',
        kpiSkills: 'المهارات المدرجة',
        kpiCategories: 'الفئات',
        kpiExperience: 'سنوات التعلم',
        kpiEngagement: 'التفاعل',
      },
      projects: {
        title: 'إدارة المشاريع',
        addBtn: 'إضافة مشروع',
        editBtn: 'تعديل',
        deleteBtn: 'حذف',
        saveBtn: 'حفظ المشروع',
        cancelBtn: 'إلغاء',
        formTitle: 'إضافة مشروع جديد',
        formEditTitle: 'تعديل المشروع',
        fields: {
          title: 'عنوان المشروع',
          slug: 'المعرف (Slug)',
          description: 'الوصف',
          category: 'الفئة',
          thumbnail: 'رابط الصورة المصغرة',
          liveUrl: 'رابط الموقع الحي',
          githubUrl: 'رابط GitHub',
          tags: 'الوسوم (مفصولة بفاصلة)',
          featured: 'مميز',
        },
      },
      articles: {
        title: 'المقالات والمدونة',
        addBtn: 'مقال جديد',
        editBtn: 'تعديل',
        deleteBtn: 'حذف',
        saveBtn: 'نشر المقال',
        cancelBtn: 'إلغاء',
        formTitle: 'إنشاء مقال جديد',
        formEditTitle: 'تعديل المقال',
        fields: {
          title: 'عنوان المقال',
          slug: 'المعرف (Slug)',
          excerpt: 'مقتطف',
          content: 'المحتوى الكامل',
          category: 'الفئة',
          coverImage: 'رابط صورة الغلاف',
          readTime: 'وقت القراءة',
          published: 'منشور',
        },
      },
      messages: {
        title: 'صندوق الرسائل',
        deleteBtn: 'حذف',
        replyBtn: 'رد',
        emptyState: 'لا توجد رسائل بعد.',
        from: 'من',
      },
      settings: {
        title: 'إعدادات الملف الشخصي',
        saveBtn: 'حفظ التغييرات',
        fields: {
          name: 'الاسم الكامل',
          shortName: 'الاسم المختصر',
          initials: 'الأحرف الأولى',
          title: 'المسمى الوظيفي',
          bio: 'السيرة الذاتية / الملخص',
          email: 'البريد الإلكتروني',
          github: 'رابط GitHub',
          linkedin: 'رابط LinkedIn',
          cvUrl: 'رابط ملف السيرة الذاتية',
          avatarUrl: 'رابط الصورة الشخصية',
          heroImageUrl: 'رابط الصورة الرئيسية',
          country: 'الدولة/المنطقة',
        },
      },
      alerts: {
        confirmDeleteTitle: 'تأكيد الحذف',
        confirmDeleteText: 'لا يمكن التراجع عن هذا الإجراء.',
        confirmDeleteBtn: 'نعم، احذف',
        cancelBtn: 'إلغاء',
        deleteSuccess: 'تم الحذف بنجاح.',
        saveSuccess: 'تم الحفظ بنجاح.',
        errorTitle: 'خطأ',
        validationTitle: 'خطأ في التحقق',
        validationText: 'يرجى ملء جميع الحقول المطلوبة بشكل صحيح.',
      },
    },

    articleDetail: {
      backBtn: 'العودة إلى المقالات',
      share: 'مشاركة',
      minRead: 'دقيقة قراءة',
    },

    projectDetail: {
      backBtn: 'العودة إلى المشاريع',
      typeLabel: 'النوع',
      clientLabel: 'العميل',
      categoryLabel: 'الفئة',
      liveBtn: 'عرض مباشر',
      githubBtn: 'GitHub',
      prevBtn: 'السابق',
      nextBtn: 'المشروع التالي',
    },

    validation: {
      nameRequired: 'الاسم مطلوب.',
      nameTooShort: 'يجب أن يكون الاسم حرفين على الأقل.',
      nameTooLong: 'يجب ألا يتجاوز الاسم 60 حرفاً.',
      emailRequired: 'البريد الإلكتروني مطلوب.',
      emailInvalid: 'يرجى إدخال بريد إلكتروني صالح.',
      messageRequired: 'الرسالة مطلوبة.',
      messageTooShort: 'يجب أن تكون الرسالة 15 حرفاً على الأقل.',
      messageTooLong: 'يجب ألا تتجاوز الرسالة 2000 حرف.',
      titleRequired: 'العنوان مطلوب.',
      slugRequired: 'المعرف مطلوب.',
      descRequired: 'الوصف مطلوب.',
      contentRequired: 'المحتوى مطلوب.',
    },
  },
}

// Helper hook-compatible function
export function t(lang, path) {
  const keys = path.split('.')
  let val = translations[lang]
  for (const key of keys) {
    if (val == null) return path
    val = val[key]
  }
  return val ?? path
}

