// '2026-09-13T19:04:08Z' -> 'Sep 13, 2026'
export function formatDate(value) {
  if (!value) {
    return '—'
  }
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// '2026-09-13T19:04:08Z' -> 'Sep 13, 2026, 7:04 PM'
export function formatDateTime(value) {
  if (!value) {
    return '—'
  }
  return new Date(value).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

// '2026-09-14' -> 'Sunday, 14 September 2026'
export function formatLongDate(value = new Date()) {
  return new Date(value).toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

// A date a few hours ago -> '3 hours ago'
export function timeAgo(value) {
  if (!value) {
    return ''
  }
  const seconds = Math.round((new Date(value).getTime() - Date.now()) / 1000)
  const units = [
    ['year', 31536000],
    ['month', 2592000],
    ['week', 604800],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ]
  const formatter = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })
  for (const [unit, secondsInUnit] of units) {
    if (Math.abs(seconds) >= secondsInUnit) {
      return formatter.format(Math.round(seconds / secondsInUnit), unit)
    }
  }
  return 'just now'
}

// 'Sara Ahmed' -> 'SA',  'omar' -> 'O'
export function getInitials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  return parts
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')
}

// percent(2, 3) -> 67 (0 when there is nothing to divide by)
export function percent(part, whole) {
  return whole ? Math.round((part * 100) / whole) : 0
}

// pluralize(1, 'topic') -> '1 topic',  pluralize(3, 'topic') -> '3 topics'
export function pluralize(count, word) {
  return `${count} ${count === 1 ? word : `${word}s`}`
}

export function getFullName(person) {
  const fullName = `${person.first_name ?? ''} ${person.last_name ?? ''}`.trim()
  return fullName || person.username
}
