import { useCallback, useEffect, useMemo, useState } from 'react'
import { apiRequest } from '../../api'
import { useAuth } from '../../auth/AuthContext'
import Button from '../../components/Button'
import Card from '../../components/Card'
import Input from '../../components/Input'
import DashboardLayout from './DashboardLayout'

type AttendanceReportRow = {
  course_code: string
  course_name: string
  total_classes: number
  present_count: number
  absent_count: number
  late_count: number
  excused_count: number
  attendance_pct: number | string
  threshold_pct: number | string
  is_below_threshold: boolean
}

type AttendanceReportResponse = {
  student_id: string
  period_id: number
  rows: AttendanceReportRow[]
}

function toNumber(value: number | string) {
  if (typeof value === 'number') return value
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

function fmtPct(value: number | string) {
  const n = toNumber(value)
  return `${n.toFixed(2)}%`
}

export default function StudentDashboard() {
  const { token, user, logout } = useAuth()

  const [periodId, setPeriodId] = useState('1')
  const [periodError, setPeriodError] = useState<string | null>(null)

  const [report, setReport] = useState<AttendanceReportResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const normalizedPeriodId = useMemo(() => periodId.trim(), [periodId])

  const loadReport = useCallback(
    async (periodIdRaw: string) => {
      const trimmed = periodIdRaw.trim()
      const parsed = Number.parseInt(trimmed, 10)

      if (!trimmed || !Number.isFinite(parsed) || parsed < 1) {
        setPeriodError('Period ID must be a positive integer')
        return
      }

      if (!token) {
        setError('Not authenticated')
        return
      }

      setPeriodError(null)
      setError(null)
      setLoading(true)

      try {
        const data = await apiRequest<AttendanceReportResponse>(
          `/reports/student/me?period_id=${encodeURIComponent(String(parsed))}`,
          {},
          token,
          logout,
        )
        setReport(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err))
      } finally {
        setLoading(false)
      }
    },
    [token, logout],
  )

  useEffect(() => {
    const t = setTimeout(() => {
      void loadReport('1')
    }, 0)

    return () => clearTimeout(t)
  }, [loadReport])

  return (
    <DashboardLayout title="Student Dashboard">
      <div className="pageHeader">
        <h1 className="pageTitle">Student Dashboard</h1>
        <p className="pageSubtitle">
          View your profile basics and your attendance report for a selected period.
        </p>
      </div>

      <Card title="Profile">
        <div className="tableWrap">
          <table className="table" aria-label="Student profile basics">
            <tbody>
              <tr>
                <th scope="row">Name</th>
                <td>{user?.name || <span className="muted">—</span>}</td>
              </tr>
              <tr>
                <th scope="row">Email</th>
                <td>{user?.email || <span className="muted">—</span>}</td>
              </tr>
              <tr>
                <th scope="row">Role</th>
                <td>{user?.role || <span className="muted">—</span>}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Attendance report">
        <form
          className="stack"
          onSubmit={(e) => {
            e.preventDefault()
            void loadReport(normalizedPeriodId)
          }}
        >
          <div className="row">
            <div style={{ flex: 1, minWidth: 220 }}>
              <Input
                id="periodId"
                label="Period ID"
                value={periodId}
                onChange={(e) => setPeriodId(e.target.value)}
                inputMode="numeric"
                placeholder="1"
                hint={
                  <>
                    Fetches <code>GET /reports/student/me</code> with <code>period_id</code>.
                  </>
                }
                error={periodError}
              />
            </div>

            <div className="row" style={{ alignSelf: 'flex-end' }}>
              <Button type="submit" disabled={loading}>
                {loading ? 'Loading…' : 'Load report'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={loading}
                onClick={() => {
                  setPeriodId('1')
                  setPeriodError(null)
                  void loadReport('1')
                }}
              >
                Reset to 1
              </Button>
            </div>
          </div>

          {error ? <div className="error">{error}</div> : null}

          {loading && !report ? <div className="muted">Loading…</div> : null}

          {report ? (
            <div className="stack">
              <div className="row">
                <span className="muted small">
                  Student ID: <code>{report.student_id}</code>
                </span>
                <span className="muted small">
                  Period ID: <code>{report.period_id}</code>
                </span>
              </div>

              {report.rows.length === 0 ? (
                <div className="muted">No attendance data found for this period.</div>
              ) : (
                <div className="tableWrap">
                  <table className="table" aria-label="Attendance report by course">
                    <thead>
                      <tr>
                        <th>Course</th>
                        <th>Total</th>
                        <th>Present</th>
                        <th>Absent</th>
                        <th>Late</th>
                        <th>Excused</th>
                        <th>Attendance</th>
                        <th>Threshold</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.rows.map((r) => (
                        <tr key={r.course_code}>
                          <td>
                            <div style={{ fontWeight: 650 }}>{r.course_code}</div>
                            <div className="muted small">{r.course_name}</div>
                          </td>
                          <td>{r.total_classes}</td>
                          <td>{r.present_count}</td>
                          <td>{r.absent_count}</td>
                          <td>{r.late_count}</td>
                          <td>{r.excused_count}</td>
                          <td>{fmtPct(r.attendance_pct)}</td>
                          <td>{fmtPct(r.threshold_pct)}</td>
                          <td className={r.is_below_threshold ? 'error' : 'success'}>
                            {r.is_below_threshold ? 'Below threshold' : 'OK'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : null}
        </form>
      </Card>
    </DashboardLayout>
  )
}
