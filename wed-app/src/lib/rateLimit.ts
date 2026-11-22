/**
 * Rate Limiting & Anti-Spam Protection Utility for MANA
 * Client-side + Session storage tracking for auth attempts and inquiry submissions.
 */

interface RateLimitRecord {
  timestamps: number[]
  lockedUntil?: number
}

const STORAGE_PREFIX = 'mana_rate_limit_'

function getRecord(key: string): RateLimitRecord {
  try {
    const raw = sessionStorage.getItem(STORAGE_PREFIX + key)
    if (!raw) return { timestamps: [] }
    const parsed = JSON.parse(raw)
    return {
      timestamps: Array.isArray(parsed.timestamps) ? parsed.timestamps : [],
      lockedUntil: typeof parsed.lockedUntil === 'number' ? parsed.lockedUntil : undefined,
    }
  } catch {
    return { timestamps: [] }
  }
}

function saveRecord(key: string, record: RateLimitRecord): void {
  try {
    sessionStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(record))
  } catch {
    // sessionStorage quota or disabled
  }
}

/**
 * Check if an action is allowed under the rate limit.
 * @param key Unique key for the action (e.g., 'auth_login', 'inquiry_packages')
 * @param maxAttempts Max allowed attempts within the window
 * @param windowSeconds Window duration in seconds
 */
export function checkRateLimit(
  key: string,
  maxAttempts: number,
  windowSeconds: number
): {
  allowed: boolean
  remainingAttempts: number
  retryAfterSeconds: number
} {
  const now = Date.now()
  const windowMs = windowSeconds * 1000
  const record = getRecord(key)

  // Check if explicitly locked
  if (record.lockedUntil && record.lockedUntil > now) {
    const retryAfter = Math.ceil((record.lockedUntil - now) / 1000)
    return {
      allowed: false,
      remainingAttempts: 0,
      retryAfterSeconds: retryAfter,
    }
  }

  // Filter timestamps within active window
  const validTimestamps = record.timestamps.filter((ts) => now - ts < windowMs)

  if (validTimestamps.length >= maxAttempts) {
    // Exceeded limit: lock for the remaining window of oldest valid attempt
    const oldest = validTimestamps[0]
    const retryAfter = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000))
    saveRecord(key, {
      timestamps: validTimestamps,
      lockedUntil: now + retryAfter * 1000,
    })
    return {
      allowed: false,
      remainingAttempts: 0,
      retryAfterSeconds: retryAfter,
    }
  }

  return {
    allowed: true,
    remainingAttempts: Math.max(0, maxAttempts - validTimestamps.length),
    retryAfterSeconds: 0,
  }
}

/**
 * Record a submission or attempt.
 */
export function recordRateLimitAttempt(key: string, windowSeconds = 60): void {
  const now = Date.now()
  const windowMs = windowSeconds * 1000
  const record = getRecord(key)
  const validTimestamps = record.timestamps.filter((ts) => now - ts < windowMs)
  validTimestamps.push(now)
  saveRecord(key, { ...record, timestamps: validTimestamps })
}

/**
 * Explicitly lock an action for N seconds (e.g., after catching a 429/rate-limit error).
 */
export function lockRateLimit(key: string, lockSeconds: number): void {
  const now = Date.now()
  const record = getRecord(key)
  saveRecord(key, {
    ...record,
    lockedUntil: now + lockSeconds * 1000,
  })
}

/**
 * Reset rate limit counters for a key (e.g. after successful login).
 */
export function resetRateLimit(key: string): void {
  try {
    sessionStorage.removeItem(STORAGE_PREFIX + key)
  } catch {
    // ignore
  }
}

/**
 * Detect whether an error is a Supabase or network rate limit error.
 */
export function isRateLimitError(err: unknown): boolean {
  if (!err) return false
  const msg = err instanceof Error ? err.message : String(err)
  const lower = msg.toLowerCase()
  return (
    lower.includes('rate limit') ||
    lower.includes('too many requests') ||
    lower.includes('429') ||
    lower.includes('over_email_send_rate_limit') ||
    lower.includes('security purposes') ||
    lower.includes('retry after') ||
    lower.includes('exceeded')
  )
}

/**
 * Formats a clean, user-friendly rate limit message.
 */
export function formatRateLimitMessage(retryAfterSeconds: number, action = 'request'): string {
  if (retryAfterSeconds <= 1) {
    return `Too many ${action}s. Please wait a moment before trying again.`
  }
  return `Rate limit reached. For security, please wait ${retryAfterSeconds} seconds before trying again.`
}
