import React from 'react'

const inputStyle = {
  width: '100%',
  background: 'var(--bg-elevated)',
  border: '1px solid var(--border-default)',
  borderRadius: 'var(--radius-md)',
  color: 'var(--text-primary)',
  padding: '10px 14px',
  fontSize: '14px',
  outline: 'none',
  transition: 'border-color var(--transition-fast)',
}

export function FormField({ label, error, children, required }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && (
        <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>
          {label} {required && <span style={{ color: 'var(--danger)' }}>*</span>}
        </label>
      )}
      {children}
      {error && <span style={{ fontSize: '12px', color: 'var(--danger)' }}>{error}</span>}
    </div>
  )
}

export function Input({ register, error, ...props }) {
  return (
    <input
      {...(register || {})}
      {...props}
      style={{
        ...inputStyle,
        borderColor: error ? 'var(--danger)' : undefined,
      }}
      onFocus={e => { e.target.style.borderColor = 'var(--accent-primary)' }}
      onBlur={e => { e.target.style.borderColor = error ? 'var(--danger)' : 'var(--border-default)' }}
    />
  )
}

export function Select({ register, error, children, ...props }) {
  return (
    <select
      {...(register || {})}
      {...props}
      style={{
        ...inputStyle,
        borderColor: error ? 'var(--danger)' : undefined,
        appearance: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238b9cbf' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 14px center',
        paddingRight: '36px',
        cursor: 'pointer',
      }}
    >
      {children}
    </select>
  )
}
