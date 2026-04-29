import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import Button from '../components/Button'
import Card from '../components/Card'
import { API_BASE_URL } from '../config'

export default function HomePage() {
  const navigate = useNavigate()
  const { token, user } = useAuth()

  return (
    <div className="stack">
      <div className="pageHeader">
        <h1 className="pageTitle">University Portal</h1>
        <p className="pageSubtitle">
          A single place to manage attendance, reports, and academic operations.
        </p>
      </div>

      <Card title="Environment">
        <div className="row">
          <span className="muted small">API base URL</span>
          <code>{API_BASE_URL}</code>
        </div>
      </Card>

      <Card title="Quick actions">
        <div className="stack">
          <div className="row">
            {token ? (
              <Button onClick={() => navigate('/dashboard')}>Go to dashboard</Button>
            ) : (
              <Button onClick={() => navigate('/login')}>Sign in</Button>
            )}
            <Button variant="secondary" onClick={() => navigate('/')}>
              Refresh
            </Button>
          </div>
          <div className="muted small">
            {token
              ? `Signed in as ${user?.email ?? 'current user'}.`
              : 'Sign in to access role-specific dashboards.'}
          </div>
        </div>
      </Card>
    </div>
  )
}
