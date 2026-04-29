import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import Card from '../components/Card'
import Input from '../components/Input'
import { useAuth } from '../auth/AuthContext'

export default function LoginPage() {
  const navigate = useNavigate()
  const { token, initializing, login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (!initializing && token) {
    return <Navigate to="/dashboard" replace />
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await login(email, password)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="authShell stack">
      <div className="pageHeader">
        <h1 className="pageTitle">Login</h1>
        <p className="pageSubtitle">
          Sign in with your university account to continue.
        </p>
      </div>

      <Card title="Credentials">
        <form onSubmit={onSubmit} className="stack">
          <Input
            id="email"
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
          />

          <Input
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />

          <div className="row">
            <Button type="submit" disabled={loading}>
              {loading ? 'Logging in…' : 'Login'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setEmail('')
                setPassword('')
                setError(null)
              }}
              disabled={loading}
            >
              Reset
            </Button>
          </div>

          {error ? <div className="error">{error}</div> : null}
          <div className="muted small">
            Enter the credentials provided by your institution administrator.
          </div>
        </form>
      </Card>
    </div>
  )
}
