import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, BookOpen, ClipboardCheck,
  BarChart3, Settings, LogOut, ChevronLeft, ChevronRight,
  UserCog, Calendar, AlertTriangle,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { RoleBadge } from '../common/Badge'

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'teacher', 'student', 'dept_head'] },
  { to: '/users',     icon: Users,           label: 'Users',     roles: ['admin'] },
  { to: '/courses',   icon: BookOpen,        label: 'Courses',   roles: ['admin', 'teacher', 'student', 'dept_head'] },
  { to: '/attendance',icon: ClipboardCheck,  label: 'Mark Attendance', roles: ['admin', 'teacher'] },
  { to: '/reports/daily',    icon: Calendar,    label: 'Daily Report',  roles: ['admin', 'teacher'] },
  { to: '/reports/student',  icon: BarChart3,   label: 'Student Reports', roles: ['admin', 'teacher', 'student', 'dept_head'] },
  { to: '/reports/low',      icon: AlertTriangle, label: 'Low Attendance', roles: ['admin', 'teacher', 'dept_head'] },
  { to: '/admin',     icon: UserCog,         label: 'Admin Panel', roles: ['admin'] },
  { to: '/profile',   icon: Settings,        label: 'My Profile',  roles: ['student', 'teacher', 'admin', 'dept_head'] },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)

  const filteredNav = NAV_ITEMS.filter(item => item.roles.includes(user?.role))

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside style={{
      width: collapsed ? 64 : 'var(--sidebar-width)',
      minHeight: '100vh',
      background: 'var(--bg-surface)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      padding: collapsed ? '20px 8px' : '20px 12px',
      gap: 4,
      transition: 'width var(--transition-slow)',
      position: 'sticky', top: 0,
      flexShrink: 0,
      overflow: 'hidden',
      zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{
        display: 'flex', alignItems: 'center',
        gap: 10, padding: '8px 12px 20px',
        borderBottom: '1px solid var(--border-subtle)',
        marginBottom: 8,
        justifyContent: collapsed ? 'center' : 'space-between',
      }}>
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 32, height: 32,
              background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-teal))',
              borderRadius: 'var(--radius-sm)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '14px', fontWeight: 800, color: '#fff',
              fontFamily: 'var(--font-display)',
            }}>A</div>
            <span style={{ fontSize: '17px', fontWeight: 800, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
              Attend<span style={{ color: 'var(--accent-primary)' }}>X</span>
            </span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)', padding: '5px',
            color: 'var(--text-secondary)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {filteredNav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            title={collapsed ? label : ''}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center',
              gap: 10, padding: collapsed ? '10px' : '10px 14px',
              borderRadius: 'var(--radius-md)',
              fontSize: '13.5px', fontWeight: 500,
              color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
              background: isActive ? 'var(--accent-primary-muted)' : 'transparent',
              transition: 'all var(--transition-fast)',
              textDecoration: 'none',
              justifyContent: collapsed ? 'center' : 'flex-start',
              whiteSpace: 'nowrap',
            })}
          >
            {({ isActive }) => (
              <>
                <Icon size={17} style={{ flexShrink: 0, color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)' }} />
                {!collapsed && label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {!collapsed && user && (
          <div style={{ padding: '10px 14px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
              {user.name}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user.email}
            </div>
            <RoleBadge role={user.role} />
          </div>
        )}
        <button
          onClick={handleLogout}
          title="Logout"
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: collapsed ? '10px' : '10px 14px',
            borderRadius: 'var(--radius-md)',
            color: 'var(--danger)', background: 'var(--danger-muted)',
            border: 'none', cursor: 'pointer', fontSize: '13.5px', fontWeight: 500,
            justifyContent: collapsed ? 'center' : 'flex-start',
            transition: 'all var(--transition-fast)',
          }}
        >
          <LogOut size={17} />
          {!collapsed && 'Logout'}
        </button>
      </div>
    </aside>
  )
}
