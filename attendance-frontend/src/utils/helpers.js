import { format, parseISO } from 'date-fns'

export const formatDate = (dateStr) => {
  try { return format(parseISO(dateStr), 'dd MMM yyyy') }
  catch { return dateStr }
}

export const formatPct = (n) => `${Number(n).toFixed(1)}%`

export const pctColor = (pct) => {
  if (pct >= 75) return 'var(--success)'
  if (pct >= 60) return 'var(--warning)'
  return 'var(--danger)'
}

export const statusLabel = (s) => s?.charAt(0).toUpperCase() + s?.slice(1)

export const getErrorMessage = (err) =>
  err?.response?.data?.detail || err?.message || 'An unexpected error occurred'

export const roleColors = {
  admin:     { bg: 'rgba(79,142,247,0.15)',  color: '#4f8ef7' },
  teacher:   { bg: 'rgba(45,212,191,0.12)',  color: '#2dd4bf' },
  student:   { bg: 'rgba(52,211,153,0.12)',  color: '#34d399' },
  dept_head: { bg: 'rgba(251,191,36,0.12)',  color: '#fbbf24' },
}
