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
  if (name.trim().length > 100) return 'Name cannot exceed 100 characters.'
  return null
}

export const validateMessage = (message) => {
  if (!message || !message.trim()) return 'Message content is required.'
  if (message.trim().length < 5) return 'Message must be at least 5 characters long.'
  if (message.trim().length > 4000) return 'Message cannot exceed 4000 characters.'
  return null
}

export const validateUrl = (url, fieldName = 'URL', required = false) => {
  if (!url || !url.trim()) {
    if (required) return `${fieldName} is required.`
    return null
  }
  const clean = url.trim()
  if (clean === '#' || clean.startsWith('/') || clean.startsWith('./')) return null
  
  try {
    const hasProtocol = clean.startsWith('http://') || clean.startsWith('https://')
    new URL(hasProtocol ? clean : `https://${clean}`)
    return null
  } catch {
    return `Please enter a valid ${fieldName}.`
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
  }

  if (!data.subtitle || !data.subtitle.trim()) {
    errors.subtitle = 'Subtitle or short description is required.'
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
  }

  if (!data.content || !data.content.trim()) {
    errors.content = 'Article body content is required.'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}
