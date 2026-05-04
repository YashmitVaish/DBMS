import React from 'react'
import { Link } from 'react-router-dom'
import Button from '../components/common/Button'

export default function NotFoundPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, padding: 24, background: 'var(--bg-base)' }}>
      <div style={{ fontSize: '96px', fontWeight: 900, fontFamily: 'var(--font-display)', color: 'var(--border-default)', lineHeight: 1 }}>404</div>
      <h2 style={{ fontSize: '22px', fontWeight: 700 }}>Page not found</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>The page you're looking for doesn't exist.</p>
      <Link to="/dashboard"><Button>Go to Dashboard</Button></Link>
    </div>
  )
}
