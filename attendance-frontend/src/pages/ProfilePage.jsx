import React from 'react'
import { useAuth } from '../context/AuthContext'
import Card from '../components/common/Card'
import { RoleBadge } from '../components/common/Badge'
import { User, Mail, Building2, ShieldCheck } from 'lucide-react'

export default function ProfilePage() {
  const { user } = useAuth()

  if (!user) return null

  const fields = [
    { icon: User,       label: 'Full Name',     value: user.name },
    { icon: Mail,       label: 'Email',         value: user.email },
    { icon: ShieldCheck,label: 'Role',          value: <RoleBadge role={user.role} /> },
    { icon: Building2,  label: 'Department ID', value: user.department_id ?? 'Not assigned' },
  ]

  return (
    <div style={{ maxWidth: 540, display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeIn 0.4s ease' }}>
      <Card>
        {/* Avatar area */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28 }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-teal))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '28px', fontWeight: 900, color: '#fff',
            fontFamily: 'var(--font-display)',
            boxShadow: 'var(--shadow-glow)',
            flexShrink: 0,
          }}>
            {user.name?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: 4 }}>
              {user.name}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <RoleBadge role={user.role} />
              <span style={{
                fontSize: '12px', fontWeight: 600,
                color: user.is_active ? 'var(--success)' : 'var(--danger)',
              }}>
                {user.is_active ? '● Active' : '○ Inactive'}
              </span>
            </div>
          </div>
        </div>

        {/* Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {fields.map(({ icon: Icon, label, value }, i) => (
            <div key={label} style={{
              display: 'flex', alignItems: 'center', gap: 16,
              padding: '14px 0',
              borderBottom: i < fields.length - 1 ? '1px solid var(--border-subtle)' : 'none',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-elevated)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Icon size={16} style={{ color: 'var(--text-muted)' }} />
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>
                  {label}
                </div>
                <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>
                  {value}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card style={{ borderColor: 'rgba(79,142,247,0.2)', background: 'rgba(79,142,247,0.04)' }}>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          <strong style={{ color: 'var(--accent-primary)' }}>User ID</strong>
          <div style={{
            fontFamily: 'monospace', fontSize: '12px', color: 'var(--text-muted)',
            background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)',
            padding: '8px 12px', marginTop: 6, wordBreak: 'break-all',
            border: '1px solid var(--border-subtle)',
          }}>
            {user.user_id}
          </div>
        </div>
      </Card>
    </div>
  )
}
