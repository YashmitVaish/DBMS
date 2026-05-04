import React from 'react'
import { statusLabel } from '../../utils/helpers'

const statusStyles = {
  present: { bg: 'var(--success-muted)',  color: 'var(--success)' },
  absent:  { bg: 'var(--danger-muted)',   color: 'var(--danger)'  },
  late:    { bg: 'var(--warning-muted)',  color: 'var(--warning)' },
  excused: { bg: 'var(--info-muted)',     color: 'var(--info)'    },
}

export function StatusBadge({ status }) {
  const s = statusStyles[status] || { bg: 'var(--bg-elevated)', color: 'var(--text-secondary)' }
  return (
    <span style={{
      background: s.bg, color: s.color,
      padding: '3px 10px', borderRadius: '99px',
      fontSize: '12px', fontWeight: 600, letterSpacing: '0.03em',
      textTransform: 'capitalize', display: 'inline-block',
    }}>
      {statusLabel(status)}
    </span>
  )
}

const roleStyles = {
  admin:     { bg: 'rgba(79,142,247,0.15)',  color: '#4f8ef7' },
  teacher:   { bg: 'rgba(45,212,191,0.12)',  color: '#2dd4bf' },
  student:   { bg: 'rgba(52,211,153,0.12)',  color: '#34d399' },
  dept_head: { bg: 'rgba(251,191,36,0.12)',  color: '#fbbf24' },
}

export function RoleBadge({ role }) {
  const s = roleStyles[role] || { bg: 'var(--bg-elevated)', color: 'var(--text-secondary)' }
  return (
    <span style={{
      background: s.bg, color: s.color,
      padding: '3px 10px', borderRadius: '99px',
      fontSize: '12px', fontWeight: 600, letterSpacing: '0.03em',
      textTransform: 'capitalize', display: 'inline-block',
    }}>
      {role?.replace('_', ' ')}
    </span>
  )
}

export function PctBadge({ pct }) {
  const color = pct >= 75 ? 'var(--success)' : pct >= 60 ? 'var(--warning)' : 'var(--danger)'
  const bg    = pct >= 75 ? 'var(--success-muted)' : pct >= 60 ? 'var(--warning-muted)' : 'var(--danger-muted)'
  return (
    <span style={{
      background: bg, color, padding: '3px 10px', borderRadius: '99px',
      fontSize: '12px', fontWeight: 700,
    }}>
      {Number(pct).toFixed(1)}%
    </span>
  )
}
