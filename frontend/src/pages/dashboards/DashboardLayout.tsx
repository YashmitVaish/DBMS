import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../../components/Button'
import Card from '../../components/Card'
import { useAuth } from '../../auth/AuthContext'

export default function DashboardLayout({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="stack">
      <Card title={title}>
        <div className="stack">
          <div className="row">
            <nav aria-label="Dashboard navigation" className="row">
              <Link className="navLink" to="/">
                Home
              </Link>
              {user?.role === 'student' ? (
                <Link className="navLink" to="/student">
                  Student
                </Link>
              ) : null}
              {user?.role === 'teacher' ? (
                <Link className="navLink" to="/teacher">
                  Teacher
                </Link>
              ) : null}
              {user?.role === 'admin' ? (
                <Link className="navLink" to="/admin">
                  Admin
                </Link>
              ) : null}
              {user?.role === 'dept_head' ? (
                <Link className="navLink" to="/dept-head">
                  Dept Head
                </Link>
              ) : null}
            </nav>

            <div style={{ marginLeft: 'auto' }} className="row">
              <span className="muted small">
                {user?.email ? user.email : ''}
                {user?.role ? ` (${user.role})` : ''}
              </span>
              <Button
                variant="secondary"
                onClick={() => {
                  logout()
                  navigate('/login')
                }}
              >
                Logout
              </Button>
            </div>
          </div>

          {children}
        </div>
      </Card>
    </div>
  )
}
