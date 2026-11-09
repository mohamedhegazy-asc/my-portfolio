import React from 'react'

export default function HeroPortrait({ profile }) {
  const photoUrl = profile?.heroImageUrl || "/assets/mohamed_hero.jpg"

  return (
    <div className="relative w-full max-w-[360px] md:max-w-[420px] mx-auto aspect-[4/5] flex items-end justify-center select-none">
      
      {/* Background SVG Ring - 4.5px curved --sage (#B9D895) outline ring */}
      <svg 
        className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible"
        viewBox="0 0 400 480"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M 50 310 C 15 220 20 130 90 90 C 180 40 330 60 370 160 C 410 260 360 360 270 400 C 190 435 90 400 50 310 Z"
          stroke="#B9D895"
          strokeWidth="4.5"
          strokeLinecap="round"
          className="opacity-90 drop-shadow-[0_0_12px_rgba(185,216,149,0.35)]"
        />
        <path
          d="M 70 300 C 45 230 50 150 110 115 C 185 75 300 90 340 170 C 375 250 330 330 260 365"
          stroke="#B9D895"
          strokeWidth="1.5"
          strokeDasharray="4 8"
          className="opacity-40"
        />
      </svg>

      {/* The Rounded Rectangle Card (radius 20px, --slate #374159 background) */}
      <div className="relative w-full h-[90%] bg-[#374159] rounded-[24px] shadow-2xl overflow-hidden border border-white/10 flex items-end justify-center">
        
        {/* Soft gradient overlay for smooth integration */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#374159]/20 to-[#222936]/80 z-20 pointer-events-none" />

        {/* User Photo */}
        <img
          src={photoUrl}
          alt={profile?.name || "Mohamed Mahmoud Hegazy"}
          className="relative z-10 w-full h-full object-cover object-top filter brightness-[1.02] contrast-[1.04]"
          onError={(e) => {
            e.target.src = "/assets/avatar.jpg"
          }}
        />

        {/* Small subtle badge at bottom */}
        <div className="absolute bottom-3 left-4 right-4 z-30 py-2 px-3 rounded-xl bg-[#222936]/80 backdrop-blur-md border border-white/10 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] font-semibold text-white tracking-wide">
              {profile?.shortName || "Mohamed Hegazy"}
            </span>
            <span className="text-[10px] text-[#B9D895] font-medium">
              Data Analyst • BIS
            </span>
          </div>
          <div className="w-2 h-2 rounded-full bg-[#B9D895] animate-pulse" />
        </div>
      </div>
    </div>
  )
}
