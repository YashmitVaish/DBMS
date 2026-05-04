import React from 'react'

const styles = {
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px',
    width: '100%',
  },
  spinner: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    border: '3px solid var(--border-default)',
    borderTopColor: 'var(--accent-primary)',
    animation: 'spin 0.7s linear infinite',
  },
}

export default function Spinner({ size = 36, fullPage = false }) {
  return (
    <div style={{ ...styles.wrapper, ...(fullPage ? { minHeight: '60vh' } : {}) }}>
      <div style={{ ...styles.spinner, width: size, height: size }} />
    </div>
  )
}
