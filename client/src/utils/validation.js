// Validation helper functions

export const validateEmail = (email) => {
  if (!email || !email.trim()) return 'Email address is required.'
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!regex.test(email.trim())) return 'Please enter a valid email address (e.g. name@domain.com).'
  return null
}

export const validateName = (name) => {
  if (!name || !name.trim()) return 'Your name is required.'
  if (name.trim().length < 2) return 'Name must be at least 2 characters long.'
  if (name.trim().length > 60) return 'Name cannot exceed 60 characters.'
  return null
}

export const validateMessage = (message) => {
  if (!message || !message.trim()) return 'Message content is required.'
  if (message.trim().length < 10) return 'Message must be at least 10 characters long to provide context.'
  if (message.trim().length > 2000) return 'Message cannot exceed 2000 characters.'
  return null
}

export const validateUrl = (url, fieldName = 'URL', required = false) => {
  if (!url || !url.trim()) {
    if (required) return `${fieldName} is required.`
    return null
  }
  if (url === '#') return null
  try {
    const parsed = new URL(url)
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return `${fieldName} must start with http:// or https://`
    }
    return null
  } catch {
    return `Please enter a valid ${fieldName} format (e.g. https://...).`
  }
}

export const validateContactForm = ({ name, email, message }) => {
  const errors = {}
  const nameErr = validateName(name)
  if (nameErr) errors.name = nameErr

  const emailErr = validateEmail(email)
  if (emailErr) errors.email = emailErr

  const msgErr = validateMessage(message)
  if (msgErr) errors.message = msgErr

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

export const validateProjectForm = (data) => {
  const errors = {}
  if (!data.title || !data.title.trim()) {
    errors.title = 'Project title is required.'
  } else if (data.title.trim().length < 3) {
    errors.title = 'Project title must be at least 3 characters.'
  }

  if (!data.subtitle || !data.subtitle.trim()) {
    errors.subtitle = 'Subtitle / description is required.'
  }

  const thumbErr = validateUrl(data.thumbnail, 'Thumbnail Image URL', true)
  if (thumbErr) errors.thumbnail = thumbErr

  if (data.liveUrl) {
    const liveErr = validateUrl(data.liveUrl, 'Live Preview URL')
    if (liveErr) errors.liveUrl = liveErr
  }

  if (data.repoUrl) {
    const repoErr = validateUrl(data.repoUrl, 'Repository URL')
    if (repoErr) errors.repoUrl = repoErr
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

export const validateArticleForm = (data) => {
  const errors = {}
  if (!data.title || !data.title.trim()) {
    errors.title = 'Article title is required.'
  } else if (data.title.trim().length < 5) {
    errors.title = 'Article title must be at least 5 characters.'
  }

  if (!data.excerpt || !data.excerpt.trim()) {
    errors.excerpt = 'Brief excerpt / summary is required.'
  }

  if (!data.content || !data.content.trim()) {
    errors.content = 'Article body content cannot be empty.'
  } else if (data.content.trim().length < 20) {
    errors.content = 'Article body must be at least 20 characters.'
  }

  const coverErr = validateUrl(data.coverImage, 'Cover Image URL', true)
  if (coverErr) errors.coverImage = coverErr

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

