import {
  format,
  parseISO,
  isToday as isFnsToday,
  isYesterday,
  differenceInCalendarDays,
  addDays as addFnsDays,
  subDays as subFnsDays,
  isValid,
} from 'date-fns'

export function toDate(input) {
  if (!input) return null
  if (input instanceof Date) return isValid(input) ? input : null
  try {
    const parsed = typeof input === 'string' ? parseISO(input) : new Date(input)
    return isValid(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function getLocalDateString(input = new Date()) {
  const d = toDate(input)
  if (!d) return ''
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function formatDate(input, pattern = 'MMM d, yyyy') {
  const d = toDate(input)
  if (!d) return '—'
  try {
    return format(d, pattern)
  } catch {
    return '—'
  }
}

export function formatRelativeDate(input) {
  const d = toDate(input)
  if (!d) return '—'
  if (isFnsToday(d)) return 'Today'
  if (isYesterday(d)) return 'Yesterday'
  
  const diff = differenceInCalendarDays(new Date(), d)
  if (diff > 0 && diff <= 30) return `${diff}d ago`
  if (diff < 0 && Math.abs(diff) <= 30) return `In ${Math.abs(diff)}d`
  
  return formatDate(d, 'MMM d')
}

export function isDateToday(input) {
  const d = toDate(input)
  return d ? isFnsToday(d) : false
}

export function addDays(input, amount) {
  const d = toDate(input) || new Date()
  return addFnsDays(d, amount)
}

export function subDays(input, amount) {
  const d = toDate(input) || new Date()
  return subFnsDays(d, amount)
}

export function getDaysDifference(dateLeft, dateRight) {
  const dl = toDate(dateLeft)
  const dr = toDate(dateRight)
  if (!dl || !dr) return 0
  return differenceInCalendarDays(dl, dr)
}
