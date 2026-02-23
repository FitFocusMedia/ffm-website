/**
 * Input validation and sanitization utilities
 * Security-first approach for user inputs
 */

/**
 * Sanitize and validate email address
 * @param {string} email - Raw email input
 * @returns {string|null} - Sanitized email or null if invalid
 */
export function sanitizeEmail(email) {
  if (!email || typeof email !== 'string') return null
  
  // Trim and lowercase
  const cleaned = email.toLowerCase().trim()
  
  // Basic length check
  if (cleaned.length < 5 || cleaned.length > 254) return null
  
  // RFC 5322 compliant email regex (simplified)
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
  
  if (!emailRegex.test(cleaned)) return null
  
  // Additional XSS prevention - strip any HTML-like content
  if (/<[^>]*>/.test(cleaned)) return null
  
  return cleaned
}

/**
 * Validate email format without sanitization
 * @param {string} email - Email to validate
 * @returns {boolean} - Whether email is valid
 */
export function isValidEmail(email) {
  return sanitizeEmail(email) !== null
}

/**
 * Sanitize text input (remove potential XSS)
 * @param {string} text - Raw text input
 * @param {number} maxLength - Maximum allowed length
 * @returns {string} - Sanitized text
 */
export function sanitizeText(text, maxLength = 500) {
  if (!text || typeof text !== 'string') return ''
  
  // Trim and limit length
  let cleaned = text.trim().substring(0, maxLength)
  
  // Remove HTML tags
  cleaned = cleaned.replace(/<[^>]*>/g, '')
  
  // Encode HTML entities
  cleaned = cleaned
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
  
  return cleaned
}

/**
 * Sanitize phone number
 * @param {string} phone - Raw phone input
 * @returns {string|null} - Sanitized phone or null if invalid
 */
export function sanitizePhone(phone) {
  if (!phone || typeof phone !== 'string') return null
  
  // Remove all non-numeric characters except + at start
  let cleaned = phone.replace(/[^\d+]/g, '')
  
  // Ensure + only at start
  if (cleaned.indexOf('+') > 0) {
    cleaned = cleaned.replace(/\+/g, '')
  }
  
  // Basic length validation (allow 8-15 digits)
  const digitsOnly = cleaned.replace(/\D/g, '')
  if (digitsOnly.length < 8 || digitsOnly.length > 15) return null
  
  return cleaned
}

/**
 * Sanitize URL parameter
 * @param {string} param - URL parameter value
 * @returns {string} - Sanitized parameter
 */
export function sanitizeUrlParam(param) {
  if (!param || typeof param !== 'string') return ''
  
  // Decode and trim
  let cleaned = decodeURIComponent(param).trim()
  
  // Remove any script or event handlers
  cleaned = cleaned.replace(/javascript:/gi, '')
  cleaned = cleaned.replace(/on\w+=/gi, '')
  
  return cleaned
}

/**
 * Validate UUID format
 * @param {string} uuid - UUID to validate
 * @returns {boolean} - Whether UUID is valid
 */
export function isValidUUID(uuid) {
  if (!uuid || typeof uuid !== 'string') return false
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

/**
 * Rate limit check (client-side, for UX only - real limiting on server)
 */
const rateLimitStore = new Map()

export function checkRateLimit(key, maxRequests = 5, windowMs = 60000) {
  const now = Date.now()
  const record = rateLimitStore.get(key)
  
  if (!record) {
    rateLimitStore.set(key, { count: 1, start: now })
    return { allowed: true, remaining: maxRequests - 1 }
  }
  
  if (now - record.start > windowMs) {
    // Window expired, reset
    rateLimitStore.set(key, { count: 1, start: now })
    return { allowed: true, remaining: maxRequests - 1 }
  }
  
  if (record.count >= maxRequests) {
    const waitTime = Math.ceil((record.start + windowMs - now) / 1000)
    return { allowed: false, remaining: 0, waitSeconds: waitTime }
  }
  
  record.count++
  return { allowed: true, remaining: maxRequests - record.count }
}
