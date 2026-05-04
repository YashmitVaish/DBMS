import React from 'react'

export default function StatCard({ label, value, icon: Icon, accent = 'var(--accent-primary)', trend, sub }) {
  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      padding: '20px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      transition: 'border-color var(--transition-base)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Accent line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: 3, background: accent, borderRadius: '0 0 4px 4px',
        opacity: 0.7,
      }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>
          {label}
        </span>
        {Icon && (
          <div style={{
            background: `rgba(${accent === 'var(--accent-primary)' ? '79,142,247' : '45,212,191'}, 0.12)`,
            borderRadius: 'var(--radius-sm)',
            padding: '8px',
            display: 'flex',
          }}>
            <Icon size={18} style={{ color: accent }} />
          </div>
        )}
      </div>

      <div>
        <div style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'var(--font-display)', lineHeight: 1 }}>
          {value}
        </div>
        {sub && <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: 4 }}>{sub}</div>}
      </div>
    </div>
  )
}
