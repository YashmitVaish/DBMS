import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function ProtectedRoute({
  role,
  children,
}: {
  role?: string
  children: ReactNode
}) {
  const { token, user, initializing } = useAuth()

  if (initializing) return <div className="muted">Loading…</div>

  if (!token) return <Navigate to="/login" replace />

  if (role && user && user.role !== role) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
