/**
 * All calendar and booking dates in MANA strictly use pure DATE (`YYYY-MM-DD`)
 * in Indian Standard Time (`Asia/Kolkata` - UTC+05:30) to eliminate UTC midnight offset bugs.
 */

export const IST_TIMEZONE = 'Asia/Kolkata'

/**
 * Formats a Date object or string into pure 'YYYY-MM-DD' in Indian Standard Time.
 */
export function formatISTDate(dateInput: Date | string | number): string {
  const d = typeof dateInput === 'string' || typeof dateInput === 'number' ? new Date(dateInput) : dateInput
  if (isNaN(d.getTime())) {
    throw new Error(`Invalid date input provided: ${dateInput}`)
  }

  // Use Intl.DateTimeFormat to extract Indian Standard Time calendar values
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: IST_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })

  // 'en-CA' gives 'YYYY-MM-DD' format natively
  return formatter.format(d)
}

/**
 * Parses a pure 'YYYY-MM-DD' string safely into a Date set to 00:00:00 IST
 */
export function parseISTDate(dateStr: string): Date {
  const cleaned = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr.trim()
  const [year, month, day] = cleaned.split('-').map(Number)
  // Construct UTC timestamp corresponding to midnight IST (00:00:00 IST is 18:30:00 UTC previous day)
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0))
}

/**
 * Expands a date range [startDate, endDate] into an array of discrete 'YYYY-MM-DD' strings in IST.
 * Inclusive of both start and end dates.
 */
export function expandDateRangeIST(startInput: Date | string, endInput: Date | string): string[] {
  const startDateStr = typeof startInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(startInput)
    ? startInput
    : formatISTDate(startInput)

  const endDateStr = typeof endInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(endInput)
    ? endInput
    : formatISTDate(endInput)

  const dates: string[] = []
  const [sY, sM, sD] = startDateStr.split('-').map(Number)
  const [eY, eM, eD] = endDateStr.split('-').map(Number)

  let current = new Date(Date.UTC(sY, sM - 1, sD, 12, 0, 0))
  const end = new Date(Date.UTC(eY, eM - 1, eD, 12, 0, 0))

  while (current <= end) {
    dates.push(current.toISOString().slice(0, 10))
    current.setUTCDate(current.getUTCDate() + 1)
  }

  return dates
}
