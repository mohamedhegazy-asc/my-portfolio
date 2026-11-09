import React, { useEffect } from 'react'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import ServicesAndAbout from '../components/ServicesAndAbout'
import WorksSection from '../components/WorksSection'
import ArticlesSection from '../components/ArticlesSection'
import Footer from '../components/Footer'

export default function HomePage({ profile, projects, articles, onOpenContact }) {
  useEffect(() => {
    if (profile?.name) {
      document.title = `${profile.name} | ${profile.title || 'Data Analyst & AI Enthusiast'}`
    }
  }, [profile])

  return (
    <div className="min-h-screen bg-[#222936] text-[#E0F6C4] flex flex-col justify-between selection:bg-[#B9D895] selection:text-[#222936]">
      {/* Top Navbar */}
      <Navbar profile={profile} onOpenContact={onOpenContact} />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* 3A: Dark Landing Hero (Section 3A) */}
        <Hero profile={profile} />

        {/* Services & About Anchor Sections */}
        <ServicesAndAbout profile={profile} />

        {/* 3B: Light Works Grid Section (Section 3B) */}
        <WorksSection profile={profile} projects={projects} />

        {/* Articles & Blog Insights Section */}
        <ArticlesSection articles={articles} />
      </main>

      {/* Footer */}
      <Footer profile={profile} />
    </div>
  )
}
