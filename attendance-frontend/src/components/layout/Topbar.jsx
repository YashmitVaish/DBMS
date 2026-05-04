import React from 'react'
import { useLocation } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { format } from 'date-fns'

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/users': 'User Management',
  '/courses': 'Course Management',
  '/attendance': 'Mark Attendance',
  '/reports/daily': 'Daily Report',
  '/reports/student': 'Student Reports',
  '/reports/low': 'Low Attendance',
  '/admin': 'Admin Panel',
  '/profile': 'My Profile',
}

export default function Topbar() {
  const { pathname } = useLocation()
  const { user } = useAuth()
  const title = PAGE_TITLES[pathname] || 'AttendX'

  return (
    <header style={{
      height: 'var(--topbar-height)',
      background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border-subtle)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 28px',
      position: 'sticky', top: 0, zIndex: 90,
      flexShrink: 0,
    }}>
      <div>
        <h1 style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
          {title}
        </h1>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: 1 }}>
          {format(new Date(), 'EEEE, dd MMMM yyyy')}
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Welcome, <strong style={{ color: 'var(--text-primary)' }}>{user?.name?.split(' ')[0]}</strong>
        </div>
        <div style={{
          width: 34, height: 34,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-teal))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '13px', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-display)',
        }}>
          {user?.name?.charAt(0)?.toUpperCase()}
        </div>
      </div>
    </header>
  )
}
