import { useEffect, useMemo, useState } from 'react'
import { apiRequest } from '../../api'
import { useAuth } from '../../auth/AuthContext'
import Button from '../../components/Button'
import Card from '../../components/Card'
import Input from '../../components/Input'
import DashboardLayout from './DashboardLayout'

type UserRole = 'student' | 'teacher' | 'admin' | 'dept_head'

type UserOut = {
  user_id: string
  name: string
  email: string
  role: UserRole
  department_id?: number | null
  is_active: boolean
}

type CourseOut = {
  course_id: number
  code: string
  name: string
  department_id: number
  credits: number
  max_students: number
  is_active: boolean
}

function errorMessage(err: unknown) {
  return err instanceof Error ? err.message : String(err)
}

function parseIntOrThrow(label: string, value: string) {
  const n = Number.parseInt(value, 10)
  if (!Number.isFinite(n)) throw new Error(`${label} is required`)
  return n
}

function parseOptionalInt(value: string) {
  if (!value.trim()) return undefined
  const n = Number.parseInt(value, 10)
  if (!Number.isFinite(n)) throw new Error('Invalid number')
  return n
}

export default function AdminDashboard() {
  const { token, logout } = useAuth()

  const [users, setUsers] = useState<UserOut[]>([])
  const [courses, setCourses] = useState<CourseOut[]>([])

  const [usersLoading, setUsersLoading] = useState(false)
  const [coursesLoading, setCoursesLoading] = useState(false)

  const [usersError, setUsersError] = useState<string | null>(null)
  const [coursesError, setCoursesError] = useState<string | null>(null)

  const [usersSuccess, setUsersSuccess] = useState<string | null>(null)
  const [coursesSuccess, setCoursesSuccess] = useState<string | null>(null)
  const [enrollSuccess, setEnrollSuccess] = useState<string | null>(null)
  const [assignSuccess, setAssignSuccess] = useState<string | null>(null)

  const students = useMemo(
    () => users.filter((u) => u.role === 'student' && u.is_active),
    [users],
  )
  const teachers = useMemo(
    () => users.filter((u) => u.role === 'teacher' && u.is_active),
    [users],
  )

  async function loadUsers() {
    if (!token) return
    setUsersLoading(true)
    setUsersError(null)
    try {
      const data = await apiRequest<UserOut[]>('/users/', {}, token, logout)
      setUsers(data)
    } catch (err) {
      setUsersError(errorMessage(err))
    } finally {
      setUsersLoading(false)
    }
  }

  async function loadCourses() {
    if (!token) return
    setCoursesLoading(true)
    setCoursesError(null)
    try {
      const data = await apiRequest<CourseOut[]>('/courses/', {}, token, logout)
      setCourses(data)
    } catch (err) {
      setCoursesError(errorMessage(err))
    } finally {
      setCoursesLoading(false)
    }
  }

  useEffect(() => {
    const t = setTimeout(() => {
      void loadUsers()
      void loadCourses()
    }, 0)

    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  // Create user
  const [newUserName, setNewUserName] = useState('')
  const [newUserEmail, setNewUserEmail] = useState('')
  const [newUserPassword, setNewUserPassword] = useState('')
  const [newUserRole, setNewUserRole] = useState<UserRole>('student')
  const [newUserDeptId, setNewUserDeptId] = useState('')
  const [createUserLoading, setCreateUserLoading] = useState(false)
  const [createUserError, setCreateUserError] = useState<string | null>(null)

  async function onCreateUser(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!token) return

    setCreateUserLoading(true)
    setCreateUserError(null)
    setUsersSuccess(null)

    try {
      const department_id = parseOptionalInt(newUserDeptId)

      await apiRequest<UserOut>(
        '/users/',
        {
          method: 'POST',
          json: {
            name: newUserName,
            email: newUserEmail,
            password: newUserPassword,
            role: newUserRole,
            department_id,
          },
        },
        token,
        logout,
      )

      setUsersSuccess('User created')
      setNewUserPassword('')
      await loadUsers()
    } catch (err) {
      setCreateUserError(errorMessage(err))
    } finally {
      setCreateUserLoading(false)
    }
  }

  // Create course
  const [newCourseCode, setNewCourseCode] = useState('')
  const [newCourseName, setNewCourseName] = useState('')
  const [newCourseDeptId, setNewCourseDeptId] = useState('')
  const [newCourseCredits, setNewCourseCredits] = useState('3')
  const [newCourseMaxStudents, setNewCourseMaxStudents] = useState('60')
  const [createCourseLoading, setCreateCourseLoading] = useState(false)
  const [createCourseError, setCreateCourseError] = useState<string | null>(null)

  async function onCreateCourse(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!token) return

    setCreateCourseLoading(true)
    setCreateCourseError(null)
    setCoursesSuccess(null)

    try {
      const payload = {
        code: newCourseCode,
        name: newCourseName,
        department_id: parseIntOrThrow('Department ID', newCourseDeptId),
        credits: parseIntOrThrow('Credits', newCourseCredits),
        max_students: parseIntOrThrow('Max students', newCourseMaxStudents),
      }

      await apiRequest<CourseOut>(
        '/courses/',
        { method: 'POST', json: payload },
        token,
        logout,
      )

      setCoursesSuccess('Course created')
      await loadCourses()
    } catch (err) {
      setCreateCourseError(errorMessage(err))
    } finally {
      setCreateCourseLoading(false)
    }
  }

  // Enroll/reactivate
  const [enrollStudentId, setEnrollStudentId] = useState('')
  const [enrollCourseId, setEnrollCourseId] = useState('')
  const [enrollIsActive, setEnrollIsActive] = useState(true)
  const [enrollLoading, setEnrollLoading] = useState(false)
  const [enrollError, setEnrollError] = useState<string | null>(null)

  async function onEnroll(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!token) return

    setEnrollLoading(true)
    setEnrollError(null)
    setEnrollSuccess(null)

    try {
      const course_id = parseIntOrThrow('Course ID', enrollCourseId)

      await apiRequest<{ student_id: string; course_id: number; is_active: boolean }>(
        '/admin/enroll',
        {
          method: 'POST',
          json: {
            student_id: enrollStudentId,
            course_id,
            is_active: enrollIsActive,
          },
        },
        token,
        logout,
      )

      setEnrollSuccess('Enrollment updated')
    } catch (err) {
      setEnrollError(errorMessage(err))
    } finally {
      setEnrollLoading(false)
    }
  }

  // Assign teacher
  const [assignTeacherId, setAssignTeacherId] = useState('')
  const [assignCourseId, setAssignCourseId] = useState('')
  const [assignPeriodId, setAssignPeriodId] = useState('')
  const [assignLoading, setAssignLoading] = useState(false)
  const [assignError, setAssignError] = useState<string | null>(null)

  async function onAssignTeacher(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!token) return

    setAssignLoading(true)
    setAssignError(null)
    setAssignSuccess(null)

    try {
      const course_id = parseIntOrThrow('Course ID', assignCourseId)
      const period_id = parseIntOrThrow('Period ID', assignPeriodId)

      await apiRequest<{ ok: boolean; created: boolean }>(
        '/admin/assign-teacher',
        {
          method: 'POST',
          json: {
            teacher_id: assignTeacherId,
            course_id,
            period_id,
          },
        },
        token,
        logout,
      )

      setAssignSuccess('Teacher assignment submitted')
    } catch (err) {
      setAssignError(errorMessage(err))
    } finally {
      setAssignLoading(false)
    }
  }

  return (
    <DashboardLayout title="Admin Dashboard">
      <div className="stack">
        <div className="pageHeader">
          <h1 className="pageTitle">Admin</h1>
          <p className="pageSubtitle">
            Manage users, courses, enrollments, and teacher assignments.
          </p>
        </div>

        <Card title="Users">
          <div className="stack">
            <div className="row">
              <Button
                variant="secondary"
                onClick={loadUsers}
                disabled={usersLoading}
              >
                {usersLoading ? 'Refreshing…' : 'Refresh'}
              </Button>
              {usersError ? <span className="error">{usersError}</span> : null}
              {usersSuccess ? (
                <span className="success">{usersSuccess}</span>
              ) : null}
            </div>

            <div className="tableWrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Dept</th>
                    <th>Active</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length ? (
                    users.map((u) => (
                      <tr key={u.user_id}>
                        <td>
                          <code>{u.user_id}</code>
                        </td>
                        <td>{u.name}</td>
                        <td>{u.email}</td>
                        <td>{u.role}</td>
                        <td>{u.department_id ?? '—'}</td>
                        <td>{u.is_active ? 'Yes' : 'No'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="muted">
                        {usersLoading ? 'Loading…' : 'No users loaded'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <Card title="Create user">
              <form onSubmit={onCreateUser} className="stack">
                <div className="row" style={{ alignItems: 'flex-end' }}>
                  <div style={{ flex: '1 1 260px' }}>
                    <Input
                      id="newUserName"
                      label="Name"
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      placeholder="Jane Doe"
                      required
                    />
                  </div>
                  <div style={{ flex: '1 1 260px' }}>
                    <Input
                      id="newUserEmail"
                      label="Email"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      placeholder="jane@university.edu"
                      required
                    />
                  </div>
                </div>

                <div className="row" style={{ alignItems: 'flex-end' }}>
                  <div style={{ flex: '1 1 200px' }}>
                    <Input
                      id="newUserPassword"
                      label="Password"
                      type="password"
                      value={newUserPassword}
                      onChange={(e) => setNewUserPassword(e.target.value)}
                      placeholder="min 6 chars"
                      required
                    />
                  </div>

                  <div style={{ flex: '1 1 200px' }}>
                    <div className="field">
                      <label className="label" htmlFor="newUserRole">
                        Role
                      </label>
                      <select
                        id="newUserRole"
                        className="input"
                        value={newUserRole}
                        onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                      >
                        <option value="student">student</option>
                        <option value="teacher">teacher</option>
                        <option value="dept_head">dept_head</option>
                        <option value="admin">admin</option>
                      </select>
                      <div className="muted small">
                        Must be one of: student, teacher, dept_head, admin.
                      </div>
                    </div>
                  </div>

                  <div style={{ flex: '1 1 160px' }}>
                    <Input
                      id="newUserDept"
                      label="Department ID (optional)"
                      type="number"
                      value={newUserDeptId}
                      onChange={(e) => setNewUserDeptId(e.target.value)}
                      placeholder="e.g. 1"
                    />
                  </div>
                </div>

                <div className="row">
                  <Button type="submit" disabled={createUserLoading}>
                    {createUserLoading ? 'Creating…' : 'Create user'}
                  </Button>
                  {createUserError ? (
                    <span className="error">{createUserError}</span>
                  ) : null}
                </div>
              </form>
            </Card>
          </div>
        </Card>

        <Card title="Courses">
          <div className="stack">
            <div className="row">
              <Button
                variant="secondary"
                onClick={loadCourses}
                disabled={coursesLoading}
              >
                {coursesLoading ? 'Refreshing…' : 'Refresh'}
              </Button>
              {coursesError ? <span className="error">{coursesError}</span> : null}
              {coursesSuccess ? (
                <span className="success">{coursesSuccess}</span>
              ) : null}
            </div>

            <div className="tableWrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Course ID</th>
                    <th>Code</th>
                    <th>Name</th>
                    <th>Dept</th>
                    <th>Credits</th>
                    <th>Max</th>
                    <th>Active</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.length ? (
                    courses.map((c) => (
                      <tr key={c.course_id}>
                        <td>
                          <code>{c.course_id}</code>
                        </td>
                        <td>{c.code}</td>
                        <td>{c.name}</td>
                        <td>{c.department_id}</td>
                        <td>{c.credits}</td>
                        <td>{c.max_students}</td>
                        <td>{c.is_active ? 'Yes' : 'No'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="muted">
                        {coursesLoading ? 'Loading…' : 'No courses loaded'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <Card title="Create course">
              <form onSubmit={onCreateCourse} className="stack">
                <div className="row" style={{ alignItems: 'flex-end' }}>
                  <div style={{ flex: '1 1 160px' }}>
                    <Input
                      id="newCourseCode"
                      label="Code"
                      value={newCourseCode}
                      onChange={(e) => setNewCourseCode(e.target.value)}
                      placeholder="CS101"
                      required
                    />
                  </div>
                  <div style={{ flex: '1 1 260px' }}>
                    <Input
                      id="newCourseName"
                      label="Name"
                      value={newCourseName}
                      onChange={(e) => setNewCourseName(e.target.value)}
                      placeholder="Intro to CS"
                      required
                    />
                  </div>
                  <div style={{ flex: '1 1 180px' }}>
                    <Input
                      id="newCourseDept"
                      label="Department ID"
                      type="number"
                      value={newCourseDeptId}
                      onChange={(e) => setNewCourseDeptId(e.target.value)}
                      placeholder="e.g. 1"
                      required
                    />
                  </div>
                </div>

                <div className="row" style={{ alignItems: 'flex-end' }}>
                  <div style={{ flex: '1 1 160px' }}>
                    <Input
                      id="newCourseCredits"
                      label="Credits (1-10)"
                      type="number"
                      value={newCourseCredits}
                      onChange={(e) => setNewCourseCredits(e.target.value)}
                      required
                    />
                  </div>
                  <div style={{ flex: '1 1 160px' }}>
                    <Input
                      id="newCourseMax"
                      label="Max students"
                      type="number"
                      value={newCourseMaxStudents}
                      onChange={(e) => setNewCourseMaxStudents(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="row">
                  <Button type="submit" disabled={createCourseLoading}>
                    {createCourseLoading ? 'Creating…' : 'Create course'}
                  </Button>
                  {createCourseError ? (
                    <span className="error">{createCourseError}</span>
                  ) : null}
                </div>
              </form>
            </Card>
          </div>
        </Card>

        <Card title="Enrollment">
          <form onSubmit={onEnroll} className="stack">
            <div className="row" style={{ alignItems: 'flex-end' }}>
              <div style={{ flex: '1 1 360px' }}>
                <Input
                  id="enrollStudentId"
                  label="Student ID (uuid)"
                  value={enrollStudentId}
                  onChange={(e) => setEnrollStudentId(e.target.value)}
                  placeholder="copy from Users list"
                  required
                />
              </div>
              <div style={{ flex: '1 1 180px' }}>
                <Input
                  id="enrollCourseId"
                  label="Course ID"
                  type="number"
                  value={enrollCourseId}
                  onChange={(e) => setEnrollCourseId(e.target.value)}
                  placeholder="e.g. 1"
                  required
                />
              </div>

              <label className="row" style={{ gap: 8 }}>
                <input
                  type="checkbox"
                  checked={enrollIsActive}
                  onChange={(e) => setEnrollIsActive(e.target.checked)}
                />
                <span>Active</span>
              </label>
            </div>

            <div className="row" style={{ alignItems: 'flex-end' }}>
              <div style={{ flex: '1 1 360px' }}>
                <div className="field">
                  <label className="label" htmlFor="pickStudent">
                    Bonus: pick a student
                  </label>
                  <select
                    id="pickStudent"
                    className="input"
                    value={enrollStudentId}
                    onChange={(e) => setEnrollStudentId(e.target.value)}
                  >
                    <option value="">Select…</option>
                    {students.map((s) => (
                      <option key={s.user_id} value={s.user_id}>
                        {s.name} ({s.email}) — {s.user_id}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ flex: '1 1 260px' }}>
                <div className="field">
                  <label className="label" htmlFor="pickCourseEnroll">
                    Bonus: pick a course
                  </label>
                  <select
                    id="pickCourseEnroll"
                    className="input"
                    value={enrollCourseId}
                    onChange={(e) => setEnrollCourseId(e.target.value)}
                  >
                    <option value="">Select…</option>
                    {courses.map((c) => (
                      <option key={c.course_id} value={String(c.course_id)}>
                        {c.code} — {c.name} (id {c.course_id})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="row">
              <Button type="submit" disabled={enrollLoading}>
                {enrollLoading ? 'Submitting…' : 'Enroll / Update'}
              </Button>
              {enrollError ? <span className="error">{enrollError}</span> : null}
              {enrollSuccess ? (
                <span className="success">{enrollSuccess}</span>
              ) : null}
            </div>
          </form>
        </Card>

        <Card title="Teacher assignment">
          <form onSubmit={onAssignTeacher} className="stack">
            <div className="row" style={{ alignItems: 'flex-end' }}>
              <div style={{ flex: '1 1 360px' }}>
                <Input
                  id="assignTeacherId"
                  label="Teacher ID (uuid)"
                  value={assignTeacherId}
                  onChange={(e) => setAssignTeacherId(e.target.value)}
                  placeholder="copy from Users list"
                  required
                />
              </div>
              <div style={{ flex: '1 1 180px' }}>
                <Input
                  id="assignCourseId"
                  label="Course ID"
                  type="number"
                  value={assignCourseId}
                  onChange={(e) => setAssignCourseId(e.target.value)}
                  placeholder="e.g. 1"
                  required
                />
              </div>
              <div style={{ flex: '1 1 180px' }}>
                <Input
                  id="assignPeriodId"
                  label="Period ID"
                  type="number"
                  value={assignPeriodId}
                  onChange={(e) => setAssignPeriodId(e.target.value)}
                  placeholder="e.g. 1"
                  required
                />
              </div>
            </div>

            <div className="row" style={{ alignItems: 'flex-end' }}>
              <div style={{ flex: '1 1 360px' }}>
                <div className="field">
                  <label className="label" htmlFor="pickTeacher">
                    Bonus: pick a teacher
                  </label>
                  <select
                    id="pickTeacher"
                    className="input"
                    value={assignTeacherId}
                    onChange={(e) => setAssignTeacherId(e.target.value)}
                  >
                    <option value="">Select…</option>
                    {teachers.map((t) => (
                      <option key={t.user_id} value={t.user_id}>
                        {t.name} ({t.email}) — {t.user_id}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ flex: '1 1 260px' }}>
                <div className="field">
                  <label className="label" htmlFor="pickCourseAssign">
                    Bonus: pick a course
                  </label>
                  <select
                    id="pickCourseAssign"
                    className="input"
                    value={assignCourseId}
                    onChange={(e) => setAssignCourseId(e.target.value)}
                  >
                    <option value="">Select…</option>
                    {courses.map((c) => (
                      <option key={c.course_id} value={String(c.course_id)}>
                        {c.code} — {c.name} (id {c.course_id})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="row">
              <Button type="submit" disabled={assignLoading}>
                {assignLoading ? 'Submitting…' : 'Assign teacher'}
              </Button>
              {assignError ? <span className="error">{assignError}</span> : null}
              {assignSuccess ? (
                <span className="success">{assignSuccess}</span>
              ) : null}
            </div>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  )
}
