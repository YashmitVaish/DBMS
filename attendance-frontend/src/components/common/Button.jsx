import React from 'react'
import Spinner from './Spinner'

const variants = {
  primary: {
    background: 'var(--accent-primary)',
    color: '#fff',
    border: 'none',
  },
  secondary: {
    background: 'var(--bg-elevated)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-default)',
  },
  danger: {
    background: 'var(--danger-muted)',
    color: 'var(--danger)',
    border: '1px solid rgba(248,113,113,0.3)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--text-secondary)',
    border: '1px solid var(--border-subtle)',
  },
}

export default function Button({
  children, onClick, type = 'button', variant = 'primary',
  loading = false, disabled = false, style = {}, size = 'md', fullWidth = false,
}) {
  const padding = size === 'sm' ? '6px 14px' : size === 'lg' ? '12px 28px' : '9px 20px'
  const fontSize = size === 'sm' ? '13px' : size === 'lg' ? '16px' : '14px'

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        ...variants[variant],
        padding,
        fontSize,
        fontWeight: 500,
        borderRadius: 'var(--radius-md)',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all var(--transition-fast)',
        width: fullWidth ? '100%' : 'auto',
        justifyContent: 'center',
        letterSpacing: '0.01em',
        ...style,
      }}
    >
      {loading ? <Spinner size={14} /> : null}
      {children}
    </button>
  )
}
