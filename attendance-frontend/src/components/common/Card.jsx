import React from 'react'

export default function Card({ children, style = {}, className = '', onClick }) {
  return (
    <div
      className={`card ${className}`}
      onClick={onClick}
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        transition: 'border-color var(--transition-base), box-shadow var(--transition-base)',
        ...(onClick ? { cursor: 'pointer' } : {}),
        ...style,
      }}
    >
      {children}
    </div>
  )
}
