export const IST_TIMEZONE = 'Asia/Kolkata'

export function formatISTDate(dateInput) {
  const d = typeof dateInput === 'string' || typeof dateInput === 'number' ? new Date(dateInput) : dateInput
  if (isNaN(d.getTime())) {
    throw new Error(`Invalid date input provided: ${dateInput}`)
  }

  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: IST_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })

  return formatter.format(d)
}

export function expandDateRangeIST(startInput, endInput) {
  const startDateStr = typeof startInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(startInput)
    ? startInput
    : formatISTDate(startInput)

  const endDateStr = typeof endInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(endInput)
    ? endInput
    : formatISTDate(endInput)

  const dates = []
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
