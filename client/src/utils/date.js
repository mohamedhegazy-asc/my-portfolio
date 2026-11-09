// date.js — Real Publishing Date & Time Formatter (Day, Date, Hour & Minute)

/**
 * Format publication date with day name, full date, and real hour/minute
 * Example AR: "الإثنين، 9 نوفمبر 2026 • 07:45 م"
 * Example EN: "Monday, Nov 9, 2026 • 7:45 PM"
 */
export function formatPublishDateTime(dateInput, lang = 'ar') {
  if (!dateInput) return ''
  const date = new Date(dateInput)
  if (isNaN(date.getTime())) return ''

  const isRTL = lang === 'ar'

  if (isRTL) {
    try {
      const weekday = new Intl.DateTimeFormat('ar-EG', { weekday: 'long' }).format(date)
      const day = new Intl.DateTimeFormat('ar-EG-u-nu-latn', { day: 'numeric' }).format(date)
      const month = new Intl.DateTimeFormat('ar-EG', { month: 'long' }).format(date)
      const year = new Intl.DateTimeFormat('ar-EG-u-nu-latn', { year: 'numeric' }).format(date)
      
      const timeStr = new Intl.DateTimeFormat('ar-EG', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }).format(date)

      return `${weekday}، ${day} ${month} ${year} • ${timeStr}`
    } catch {
      return date.toLocaleString('ar-EG')
    }
  } else {
    try {
      const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(date)
      const month = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date)
      const day = date.getDate()
      const year = date.getFullYear()
      const timeStr = new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }).format(date)

      return `${weekday}, ${month} ${day}, ${year} • ${timeStr}`
    } catch {
      return date.toLocaleString('en-US')
    }
  }
}

/**
 * Compact date & time for cards and list badges
 * Example AR: "9 نوفمبر 2026 • 07:45 م"
 * Example EN: "Nov 9, 2026 • 7:45 PM"
 */
export function formatCompactDateTime(dateInput, lang = 'ar') {
  if (!dateInput) return ''
  const date = new Date(dateInput)
  if (isNaN(date.getTime())) return ''

  const isRTL = lang === 'ar'

  if (isRTL) {
    try {
      const day = new Intl.DateTimeFormat('ar-EG-u-nu-latn', { day: 'numeric' }).format(date)
      const month = new Intl.DateTimeFormat('ar-EG', { month: 'long' }).format(date)
      const year = new Intl.DateTimeFormat('ar-EG-u-nu-latn', { year: 'numeric' }).format(date)
      const timeStr = new Intl.DateTimeFormat('ar-EG', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }).format(date)

      return `${day} ${month} ${year} • ${timeStr}`
    } catch {
      return date.toLocaleDateString('ar-EG')
    }
  } else {
    try {
      const month = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date)
      const day = date.getDate()
      const year = date.getFullYear()
      const timeStr = new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }).format(date)

      return `${month} ${day}, ${year} • ${timeStr}`
    } catch {
      return date.toLocaleDateString('en-US')
    }
  }
}

