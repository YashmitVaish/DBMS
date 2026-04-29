import { useEffect, useMemo, useState } from 'react'
import { apiRequest } from '../../api'
import { useAuth } from '../../auth/AuthContext'
import Button from '../../components/Button'
import Card from '../../components/Card'
import Input from '../../components/Input'
import DashboardLayout from './DashboardLayout'

type Course = {
  course_id: number
  code: string
  name: string
  department_id: number
  credits: number
  max_students: number
  is_active: boolean
}

type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused'

type AttendanceRow = {
  student_id: string
  status: AttendanceStatus
}

type DailyReportRow = {
  date: string
  course_code: string
  course_name: string
  student_id: string
  student_name: string
  status: AttendanceStatus
  marked_by: string | null
  marked_by_email: string | null
  remarks: string | null
}

type LowAttendanceRow = {
  student_id: string
  student_name: string
  email: string
  total_classes: number
  attended: number
  percentage: number
}

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

const STATUS_OPTIONS: AttendanceStatus[] = ['present', 'absent', 'late', 'excused']

export default function TeacherDashboard() {
  const { token, logout } = useAuth()

  // Courses
  const [courses, setCourses] = useState<Course[]>([])
  const [coursesLoading, setCoursesLoading] = useState(false)
  const [coursesError, setCoursesError] = useState<string | null>(null)

  const [selectedCourseId, setSelectedCourseId] = useState<number | ''>('')

  // Bulk attendance
  const [periodId, setPeriodId] = useState(1)
  const [attendanceDate, setAttendanceDate] = useState(todayISO())
  const [remarks, setRemarks] = useState('')
  const [rows, setRows] = useState<AttendanceRow[]>([
    { student_id: '', status: 'present' },
  ])
  const [submitLoading, setSubmitLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)

  // Daily report
  const [dailyDate, setDailyDate] = useState(todayISO())
  const [dailyLoading, setDailyLoading] = useState(false)
  const [dailyError, setDailyError] = useState<string | null>(null)
  const [dailyRows, setDailyRows] = useState<DailyReportRow[]>([])

  // Low attendance
  const [lowPeriodId, setLowPeriodId] = useState(1)
  const [lowLoading, setLowLoading] = useState(false)
  const [lowError, setLowError] = useState<string | null>(null)
  const [lowRows, setLowRows] = useState<LowAttendanceRow[]>([])

  const selectedCourse = useMemo(
    () => courses.find((c) => c.course_id === selectedCourseId) ?? null,
    [courses, selectedCourseId],
  )

  async function reloadCourses() {
    if (!token) return

    setCoursesLoading(true)
    setCoursesError(null)

    try {
      const data = await apiRequest<Course[]>('/courses', {}, token, logout)
      setCourses(data)
      setSelectedCourseId((prev) => {
        if (prev !== '') return prev
        return data.length ? data[0].course_id : ''
      })
    } catch (err) {
      setCoursesError(err instanceof Error ? err.message : String(err))
    } finally {
      setCoursesLoading(false)
    }
  }

  useEffect(() => {
    if (!token) return
    const t = setTimeout(() => {
      reloadCourses().catch(() => {})
    }, 0)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  useEffect(() => {
    if (!token) return
    // initial daily load
    loadDaily(dailyDate).catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  function updateRow(i: number, patch: Partial<AttendanceRow>) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)))
  }

  function addRow() {
    setRows((prev) => [...prev, { student_id: '', status: 'present' }])
  }

  function removeRow(i: number) {
    setRows((prev) => prev.filter((_, idx) => idx !== i))
  }

  async function submitBulkAttendance(e: React.FormEvent) {
    e.preventDefault()
    setSubmitError(null)
    setSubmitSuccess(null)

    if (selectedCourseId === '') {
      setSubmitError('Please select a course.')
      return
    }

    const items = rows
      .map((r) => ({
        student_id: r.student_id.trim(),
        status: r.status,
      }))
      .filter((r) => r.student_id)

    if (!items.length) {
      setSubmitError('Add at least 1 student row (student_id is required).')
      return
    }

    setSubmitLoading(true)
    try {
      const res = await apiRequest<{ ok: boolean; count: number }>(
        '/attendance/bulk',
        {
          method: 'POST',
          json: {
            course_id: selectedCourseId,
            period_id: periodId,
            date: attendanceDate,
            items,
            remarks: remarks.trim() ? remarks.trim() : undefined,
          },
        },
        token,
        logout,
      )

      setSubmitSuccess(`Marked attendance for ${res.count} student(s).`)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : String(err))
    } finally {
      setSubmitLoading(false)
    }
  }

  async function loadDaily(dateISO: string) {
    setDailyLoading(true)
    setDailyError(null)

    try {
      const qs = new URLSearchParams({ date: dateISO })
      const data = await apiRequest<DailyReportRow[]>(
        `/reports/daily?${qs.toString()}`,
        {},
        token,
        logout,
      )
      setDailyRows(data)
    } catch (err) {
      setDailyError(err instanceof Error ? err.message : String(err))
      setDailyRows([])
    } finally {
      setDailyLoading(false)
    }
  }

  async function loadLowAttendance() {
    if (selectedCourseId === '') {
      setLowError('Please select a course.')
      return
    }

    setLowLoading(true)
    setLowError(null)

    try {
      const qs = new URLSearchParams({
        course_id: String(selectedCourseId),
        period_id: String(lowPeriodId),
      })
      const data = await apiRequest<LowAttendanceRow[]>(
        `/reports/low-attendance?${qs.toString()}`,
        {},
        token,
        logout,
      )
      setLowRows(data)
    } catch (err) {
      setLowError(err instanceof Error ? err.message : String(err))
      setLowRows([])
    } finally {
      setLowLoading(false)
    }
  }

  return (
    <DashboardLayout title="Teacher Dashboard">
      <div className="stack">
        <div className="pageHeader">
          <h1 className="pageTitle">Teacher</h1>
          <p className="pageSubtitle">
            Courses, bulk attendance marking, and reports.
          </p>
        </div>

        <Card title="Courses">
          <div className="stack">
            <div className="field">
              <label className="label" htmlFor="course-select">
                Course
              </label>
              <select
                id="course-select"
                className="input"
                value={selectedCourseId === '' ? '' : String(selectedCourseId)}
                onChange={(e) => {
                  const v = e.target.value
                  setSelectedCourseId(v ? Number(v) : '')
                }}
                disabled={coursesLoading || !courses.length}
              >
                {!courses.length ? <option value="">No courses</option> : null}
                {courses.map((c) => (
                  <option key={c.course_id} value={c.course_id}>
                    {c.code} — {c.name}
                  </option>
                ))}
              </select>
              <div className="muted small">
                GET <code>/courses</code>
                {selectedCourse ? (
                  <span>
                    {' '}
                    • Selected: <code>{selectedCourse.code}</code>
                  </span>
                ) : null}
              </div>
              {coursesError ? <div className="error small">{coursesError}</div> : null}
            </div>

            <div className="row">
              <Button
                variant="secondary"
                onClick={() => {
                  reloadCourses().catch(() => {})
                }}
                disabled={coursesLoading}
              >
                {coursesLoading ? 'Loading…' : 'Reload courses'}
              </Button>
            </div>
          </div>
        </Card>

        <Card title="Bulk attendance">
          <form onSubmit={submitBulkAttendance} className="stack">
            <div className="row">
              <div style={{ flex: '1 1 320px' }}>
                <div className="field">
                  <label className="label" htmlFor="bulk-course">
                    Course
                  </label>
                  <select
                    id="bulk-course"
                    className="input"
                    value={selectedCourseId === '' ? '' : String(selectedCourseId)}
                    onChange={(e) => {
                      const v = e.target.value
                      setSelectedCourseId(v ? Number(v) : '')
                    }}
                    disabled={coursesLoading || !courses.length}
                  >
                    {!courses.length ? <option value="">No courses</option> : null}
                    {courses.map((c) => (
                      <option key={c.course_id} value={c.course_id}>
                        {c.code} — {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ flex: '1 1 140px' }}>
                <Input
                  id="period-id"
                  label="Period ID"
                  type="number"
                  min={1}
                  value={String(periodId)}
                  onChange={(e) => setPeriodId(Number(e.target.value || 1))}
                />
              </div>

              <div style={{ flex: '1 1 200px' }}>
                <Input
                  id="attendance-date"
                  label="Date"
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                />
              </div>
            </div>

            <div className="stack">
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <div className="muted small">
                  POST <code>/attendance/bulk</code>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={addRow}
                  disabled={submitLoading}
                >
                  Add row
                </Button>
              </div>

              {rows.map((r, i) => (
                <div key={i} className="row" style={{ alignItems: 'flex-end' }}>
                  <div style={{ flex: '1 1 360px' }}>
                    <Input
                      id={`student-${i}`}
                      label={i === 0 ? 'Student ID (UUID)' : undefined}
                      aria-label={`Student ID row ${i + 1}`}
                      placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
                      value={r.student_id}
                      onChange={(e) => updateRow(i, { student_id: e.target.value })}
                    />
                  </div>

                  <div style={{ flex: '0 0 180px' }}>
                    <div className="field">
                      {i === 0 ? (
                        <label className="label" htmlFor={`status-${i}`}>
                          Status
                        </label>
                      ) : null}
                      <select
                        id={`status-${i}`}
                        className="input"
                        aria-label={`Attendance status row ${i + 1}`}
                        value={r.status}
                        onChange={(e) =>
                          updateRow(i, { status: e.target.value as AttendanceStatus })
                        }
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div style={{ flex: '0 0 auto' }}>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => removeRow(i)}
                      disabled={submitLoading || rows.length === 1}
                      title={rows.length === 1 ? 'At least one row is required' : 'Remove row'}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}

              <div className="field">
                <label className="label" htmlFor="remarks">
                  Remarks (optional)
                </label>
                <textarea
                  id="remarks"
                  className="input"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows={3}
                  placeholder="Optional notes to attach to each marked attendance row"
                />
              </div>
            </div>

            <div className="row">
              <Button type="submit" disabled={submitLoading}>
                {submitLoading ? 'Submitting…' : 'Submit attendance'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setRows([{ student_id: '', status: 'present' }])
                  setRemarks('')
                  setSubmitError(null)
                  setSubmitSuccess(null)
                }}
                disabled={submitLoading}
              >
                Reset
              </Button>
            </div>

            {submitError ? <div className="error">{submitError}</div> : null}
            {submitSuccess ? <div className="success">{submitSuccess}</div> : null}
          </form>
        </Card>

        <Card title="Daily report">
          <div className="stack">
            <div className="row">
              <div style={{ flex: '1 1 220px' }}>
                <Input
                  id="daily-date"
                  label="Date"
                  type="date"
                  value={dailyDate}
                  onChange={(e) => setDailyDate(e.target.value)}
                />
              </div>
              <div style={{ alignSelf: 'flex-end' }}>
                <Button
                  onClick={() => loadDaily(dailyDate)}
                  disabled={dailyLoading}
                >
                  {dailyLoading ? 'Loading…' : 'Load report'}
                </Button>
              </div>
              <div className="muted small" style={{ alignSelf: 'flex-end' }}>
                GET <code>/reports/daily</code>
              </div>
            </div>

            {dailyError ? <div className="error">{dailyError}</div> : null}

            <div className="tableWrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Course</th>
                    <th>Student</th>
                    <th>Status</th>
                    <th>Marked by</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {!dailyRows.length ? (
                    <tr>
                      <td colSpan={6} className="muted">
                        {dailyLoading ? 'Loading…' : 'No rows.'}
                      </td>
                    </tr>
                  ) : (
                    dailyRows.map((r, idx) => (
                      <tr key={`${r.student_id}-${r.course_code}-${idx}`}>
                        <td>{String(r.date).slice(0, 10)}</td>
                        <td>
                          <div>
                            <strong>{r.course_code}</strong>
                          </div>
                          <div className="muted small">{r.course_name}</div>
                        </td>
                        <td>
                          <div>{r.student_name}</div>
                          <div className="muted small">
                            <code>{r.student_id}</code>
                          </div>
                        </td>
                        <td>{r.status}</td>
                        <td className="small">
                          {r.marked_by_email ? r.marked_by_email : '—'}
                        </td>
                        <td className="small">{r.remarks ? r.remarks : '—'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </Card>

        <Card title="Low attendance">
          <div className="stack">
            <div className="row">
              <div style={{ flex: '1 1 320px' }}>
                <div className="field">
                  <label className="label" htmlFor="low-course">
                    Course
                  </label>
                  <select
                    id="low-course"
                    className="input"
                    value={selectedCourseId === '' ? '' : String(selectedCourseId)}
                    onChange={(e) => {
                      const v = e.target.value
                      setSelectedCourseId(v ? Number(v) : '')
                    }}
                    disabled={coursesLoading || !courses.length}
                  >
                    {!courses.length ? <option value="">No courses</option> : null}
                    {courses.map((c) => (
                      <option key={c.course_id} value={c.course_id}>
                        {c.code} — {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ flex: '1 1 140px' }}>
                <Input
                  id="low-period"
                  label="Period ID"
                  type="number"
                  min={1}
                  value={String(lowPeriodId)}
                  onChange={(e) => setLowPeriodId(Number(e.target.value || 1))}
                />
              </div>

              <div style={{ alignSelf: 'flex-end' }}>
                <Button onClick={loadLowAttendance} disabled={lowLoading}>
                  {lowLoading ? 'Loading…' : 'Check'}
                </Button>
              </div>

              <div className="muted small" style={{ alignSelf: 'flex-end' }}>
                GET <code>/reports/low-attendance</code>
              </div>
            </div>

            {lowError ? <div className="error">{lowError}</div> : null}

            <div className="tableWrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Email</th>
                    <th>Total classes</th>
                    <th>Attended</th>
                    <th>%</th>
                  </tr>
                </thead>
                <tbody>
                  {!lowRows.length ? (
                    <tr>
                      <td colSpan={5} className="muted">
                        {lowLoading ? 'Loading…' : 'No rows.'}
                      </td>
                    </tr>
                  ) : (
                    lowRows.map((r) => (
                      <tr key={r.student_id}>
                        <td>
                          <div>{r.student_name}</div>
                          <div className="muted small">
                            <code>{r.student_id}</code>
                          </div>
                        </td>
                        <td className="small">{r.email}</td>
                        <td>{r.total_classes}</td>
                        <td>{r.attended}</td>
                        <td>{r.percentage}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
