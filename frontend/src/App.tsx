import { Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import AppShell from './components/AppShell'
import Button from './components/Button'
import ProtectedRoute from './components/ProtectedRoute'
import { useAuth } from './auth/AuthContext'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RoleRedirect from './pages/RoleRedirect'
import AdminDashboard from './pages/dashboards/AdminDashboard'
import DeptHeadDashboard from './pages/dashboards/DeptHeadDashboard'
import StudentDashboard from './pages/dashboards/StudentDashboard'
import TeacherDashboard from './pages/dashboards/TeacherDashboard'

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
      return '/'
  }
}

export default function App() {
  const navigate = useNavigate()
  const { token, user, logout } = useAuth()

  return (
    <AppShell
      title={<span>University Portal</span>}
      nav={
        <>
          <Link className="navLink" to="/">
            Home
          </Link>

          {token ? (
            <>
              <Link className="navLink" to={roleToPath(user?.role ?? '')}>
                Dashboard
              </Link>
              <span className="muted small" style={{ marginLeft: 8 }}>
                {user?.email ? user.email : ''}
                {user?.role ? ` (${user.role})` : ''}
              </span>
              <Button
                className="navLink"
                variant="secondary"
                onClick={() => {
                  logout()
                  navigate('/login')
                }}
              >
                Logout
              </Button>
            </>
          ) : (
            <Link className="navLink" to="/login">
              Login
            </Link>
          )}
        </>
      }
    >
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<RoleRedirect />} />

        <Route
          path="/student"
          element={
            <ProtectedRoute role="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher"
          element={
            <ProtectedRoute role="teacher">
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dept-head"
          element={
            <ProtectedRoute role="dept_head">
              <DeptHeadDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  )
}
