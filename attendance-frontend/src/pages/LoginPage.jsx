import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../utils/helpers'
import Button from '../components/common/Button'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [showPwd, setShowPwd] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async ({ email, password }) => {
    setLoading(true)
    try {
      await login(email, password)
      toast.success('Logged in successfully')
      navigate('/dashboard')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-base)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background mesh */}
      <div style={{
        position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none',
      }}>
        <div style={{
          position: 'absolute', width: 600, height: 600,
          borderRadius: '50%', top: -200, left: -150,
          background: 'radial-gradient(circle, rgba(79,142,247,0.08) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', width: 400, height: 400,
          borderRadius: '50%', bottom: -100, right: -100,
          background: 'radial-gradient(circle, rgba(45,212,191,0.06) 0%, transparent 70%)',
        }} />
      </div>

      <div style={{
        width: '100%', maxWidth: 420, position: 'relative',
        animation: 'fadeIn 0.4s ease both',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 52, height: 52,
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-teal))',
            borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '22px', fontWeight: 800, color: '#fff',
            fontFamily: 'var(--font-display)', margin: '0 auto 16px',
            boxShadow: 'var(--shadow-glow)',
          }}>A</div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'var(--font-display)', letterSpacing: '-0.03em' }}>
            Attend<span style={{ color: 'var(--accent-primary)' }}>X</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: 6 }}>
            Attendance Management System
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-xl)',
          padding: 32,
          boxShadow: 'var(--shadow-lg)',
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: 6 }}>Sign in</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: 28 }}>
            Enter your credentials to continue
          </p>

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>
                Email address
              </label>
              <input
                type="email"
                placeholder="you@university.edu"
                {...register('email', { required: 'Email is required' })}
                style={{
                  background: 'var(--bg-elevated)',
                  border: `1px solid ${errors.email ? 'var(--danger)' : 'var(--border-default)'}`,
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  padding: '11px 14px',
                  fontSize: '14px', outline: 'none',
                  width: '100%',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--accent-primary)'}
                onBlur={e => e.target.style.borderColor = errors.email ? 'var(--danger)' : 'var(--border-default)'}
              />
              {errors.email && <span style={{ fontSize: '12px', color: 'var(--danger)' }}>{errors.email.message}</span>}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPwd ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
                  style={{
                    background: 'var(--bg-elevated)',
                    border: `1px solid ${errors.password ? 'var(--danger)' : 'var(--border-default)'}`,
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                    padding: '11px 44px 11px 14px',
                    fontSize: '14px', outline: 'none',
                    width: '100%',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent-primary)'}
                  onBlur={e => e.target.style.borderColor = errors.password ? 'var(--danger)' : 'var(--border-default)'}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer',
                    display: 'flex', padding: 0,
                  }}
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <span style={{ fontSize: '12px', color: 'var(--danger)' }}>{errors.password.message}</span>}
            </div>

            <Button
              type="submit"
              loading={loading}
              fullWidth
              size="lg"
              style={{ marginTop: 8 }}
            >
              <LogIn size={16} />
              Sign In
            </Button>
          </form>

          <div style={{
            marginTop: 24, padding: 14,
            background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
          }}>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: 6 }}>Demo credentials:</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {[
                ['Admin', 'admin@university.edu', 'admin123'],
                ['Teacher', 'gupta@university.edu', 'teacher123'],
                ['Student', 'arjun@student.edu', 'student123'],
              ].map(([role, email, pwd]) => (
                <div key={role} style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                  <span style={{ color: 'var(--accent-primary)' }}>{role}:</span> {email} / {pwd}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
