export function fromISO(value: string) {
  return new Date(`${value}T12:00:00`)
}

export function toISO(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function addDays(value: string, count: number) {
  const date = fromISO(value)
  date.setDate(date.getDate() + count)
  return toISO(date)
}

export function displayDate(value: string, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat('zh-CN', options ?? { month: 'long', day: 'numeric' }).format(fromISO(value))
}

export function displayEnglishDate(value: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit' }).format(fromISO(value)).toUpperCase()
}

export function tripDateRange(start: string, end: string) {
  return `${displayEnglishDate(start)} — ${displayEnglishDate(end)}`
}

export function tripLength(start: string, end: string) {
  return Math.max(1, Math.round((fromISO(end).getTime() - fromISO(start).getTime()) / 86400000) + 1)
}
