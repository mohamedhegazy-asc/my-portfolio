import React from 'react'
import { useLang } from '../i18n/LanguageContext'

export default function HeroPortrait({ profile }) {
  const { isRTL } = useLang()
  const photoUrl = profile?.heroImageUrl || "/assets/mohamed_hero.jpg"
  const tagText = isRTL ? 'محمد حجازي' : (profile?.shortName || "M_Hegazy")

  return (
    <div className="relative flex items-center justify-center p-6 md:p-8 select-none">
      <figure
        className="relative aspect-[260/330] w-[clamp(240px,28vw,320px)]"
        style={{
          '--pc-accent': '#B9D895',
          '--pc-ink': '#222936',
        }}
      >
        {/* Outline frame behind the photo */}
        <div
          className="absolute inset-0 border-2 rounded-[18px] pointer-events-none transition-transform duration-300"
          style={{
            borderColor: 'var(--pc-accent)',
            transform: `translate(${isRTL ? '18px' : '-18px'}, 18px)`,
          }}
        />

        {/* The photo, rotated 2.5deg */}
        <img
          src={photoUrl}
          alt={tagText}
          className="relative block w-full h-full object-cover object-top rounded-[18px] shadow-2xl transition-transform duration-300"
          style={{
            transform: isRTL ? 'rotate(-2.5deg)' : 'rotate(2.5deg)',
          }}
          onError={(e) => {
            e.target.src = "/assets/avatar.jpg"
          }}
        />

        {/* Name tag on the photo's bottom corner */}
        <figcaption
          className="absolute z-20 font-bold text-[0.85rem] md:text-sm px-3.5 py-2 rounded-[10px] shadow-lg whitespace-nowrap"
          style={{
            bottom: '-14px',
            [isRTL ? 'left' : 'right']: '-12px',
            backgroundColor: 'var(--pc-accent)',
            color: 'var(--pc-ink)',
            direction: 'ltr',
          }}
        >
          {tagText}
        </figcaption>
      </figure>
    </div>
  )
}
