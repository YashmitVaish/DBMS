import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

function roleToPath(role: string) {
  switch (role) {
    case 'student':
      return '/student'
    case 'teacher':
      return '/teacher'
    case 'admin':
      return '/admin'
    case 'dept_head':
      return '/dept-head'
    default:
      return '/login'
  }
}

export default function RoleRedirect() {
  const { token, user, initializing } = useAuth()

  if (initializing) return <div className="muted">Loading…</div>
  if (!token) return <Navigate to="/login" replace />

  return <Navigate to={roleToPath(user?.role ?? '')} replace />
}
