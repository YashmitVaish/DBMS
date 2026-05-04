import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { CheckCircle, XCircle, Clock, FileText, Save, Zap } from 'lucide-react'
import { courseService } from '../services/courseService'
import { userService } from '../services/userService'
import { attendanceService } from '../services/attendanceService'
import { getErrorMessage } from '../utils/helpers'
import Button from '../components/common/Button'
import Card from '../components/common/Card'
import Spinner from '../components/common/Spinner'
import { Select, FormField } from '../components/common/FormField'
import { StatusBadge } from '../components/common/Badge'

const STATUS_OPTIONS = ['present', 'absent', 'late', 'excused']

const STATUS_ICONS = {
  present: <CheckCircle size={15} />,
  absent:  <XCircle size={15} />,
  late:    <Clock size={15} />,
  excused: <FileText size={15} />,
}

const STATUS_COLORS = {
  present: { bg: 'var(--success-muted)', color: 'var(--success)', border: 'rgba(52,211,153,0.3)' },
  absent:  { bg: 'var(--danger-muted)',  color: 'var(--danger)',  border: 'rgba(248,113,113,0.3)' },
  late:    { bg: 'var(--warning-muted)', color: 'var(--warning)', border: 'rgba(251,191,36,0.3)' },
  excused: { bg: 'var(--info-muted)',    color: 'var(--info)',    border: 'rgba(96,165,250,0.3)' },
}

export default function AttendancePage() {
  const [courses, setCourses] = useState([])
  const [students, setStudents] = useState([])
  const [loadingCourses, setLoadingCourses] = useState(true)

  const [courseId, setCourseId] = useState('')
  const [periodId, setPeriodId] = useState('1')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [remarks, setRemarks] = useState('')

  const [attendance, setAttendance] = useState({}) // studentId -> status
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const [c, u] = await Promise.all([courseService.listCourses(), userService.listUsers()])
        setCourses(c)
        setStudents(u.filter(u => u.role === 'student'))
      } catch (err) {
        toast.error(getErrorMessage(err))
      } finally {
        setLoadingCourses(false)
      }
    }
    load()
  }, [])

  const markAll = (status) => {
    const next = {}
    students.forEach(s => { next[s.user_id] = status })
    setAttendance(next)
  }

  const toggle = (studentId, status) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }))
  }

  const handleBulkSubmit = async () => {
    if (!courseId) return toast.error('Please select a course')
    const items = students.map(s => ({
      student_id: s.user_id,
      status: attendance[s.user_id] || 'absent',
    }))
    if (items.length === 0) return toast.error('No students found')
    setSubmitting(true)
    try {
      const res = await attendanceService.bulkMark({
        course_id: Number(courseId),
        period_id: Number(periodId),
        date,
        items,
        remarks: remarks || undefined,
      })
      toast.success(`Attendance marked for ${res.count} student(s)`)
      setAttendance({})
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  const summary = {
    total: students.length,
    present: Object.values(attendance).filter(s => s === 'present').length,
    absent:  Object.values(attendance).filter(s => s === 'absent').length,
    late:    Object.values(attendance).filter(s => s === 'late').length,
    excused: Object.values(attendance).filter(s => s === 'excused').length,
    unmarked: students.length - Object.keys(attendance).length,
  }

  if (loadingCourses) return <Spinner fullPage />

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeIn 0.4s ease' }}>
      {/* Config bar */}
      <Card>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', marginBottom: 16 }}>Session Configuration</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
          <FormField label="Course" required>
            <Select value={courseId} onChange={e => setCourseId(e.target.value)}>
              <option value="">Select course...</option>
              {courses.map(c => <option key={c.course_id} value={c.course_id}>{c.code} — {c.name}</option>)}
            </Select>
          </FormField>
          <FormField label="Period ID">
            <input
              type="number" min="1" value={periodId}
              onChange={e => setPeriodId(e.target.value)}
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', padding: '10px 14px', fontSize: '14px', outline: 'none', width: '100%' }}
            />
          </FormField>
          <FormField label="Date">
            <input
              type="date" value={date} onChange={e => setDate(e.target.value)}
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', padding: '10px 14px', fontSize: '14px', outline: 'none', width: '100%', colorScheme: 'dark' }}
            />
          </FormField>
          <FormField label="Remarks">
            <input
              type="text" value={remarks} onChange={e => setRemarks(e.target.value)}
              placeholder="Optional note..."
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', padding: '10px 14px', fontSize: '14px', outline: 'none', width: '100%' }}
            />
          </FormField>
        </div>
      </Card>

      {/* Summary bar */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        {Object.entries({ present: summary.present, absent: summary.absent, late: summary.late, excused: summary.excused }).map(([s, c]) => (
          <div key={s} style={{ ...STATUS_COLORS[s], border: `1px solid ${STATUS_COLORS[s].border}`, borderRadius: 'var(--radius-md)', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 6, fontSize: '13px', fontWeight: 600 }}>
            {STATUS_ICONS[s]}
            {c} {s}
          </div>
        ))}
        {summary.unmarked > 0 && (
          <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', padding: '8px 16px', fontSize: '13px', color: 'var(--text-muted)' }}>
            {summary.unmarked} unmarked
          </div>
        )}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', alignSelf: 'center' }}>Mark all:</span>
          {STATUS_OPTIONS.map(s => (
            <button key={s} onClick={() => markAll(s)}
              style={{ ...STATUS_COLORS[s], border: `1px solid ${STATUS_COLORS[s].border}`, borderRadius: 'var(--radius-sm)', padding: '5px 12px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Zap size={12} /> {s}
            </button>
          ))}
        </div>
      </div>

      {/* Student list */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 700 }}>
            Students ({students.length})
          </h3>
        </div>
        <div style={{ maxHeight: 480, overflowY: 'auto' }}>
          {students.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No students found</div>
          ) : students.map((student, idx) => (
            <div key={student.user_id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 20px',
              borderBottom: idx < students.length - 1 ? '1px solid var(--border-subtle)' : 'none',
              transition: 'background var(--transition-fast)',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-teal))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '13px', fontWeight: 700, color: '#fff', flexShrink: 0,
                }}>
                  {student.name?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{student.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{student.email}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 6 }}>
                {STATUS_OPTIONS.map(s => {
                  const active = attendance[student.user_id] === s
                  return (
                    <button
                      key={s}
                      onClick={() => toggle(student.user_id, s)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '12px', fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)',
                        display: 'flex', alignItems: 'center', gap: 4,
                        ...(active ? STATUS_COLORS[s] : {
                          background: 'var(--bg-elevated)',
                          color: 'var(--text-muted)',
                          border: '1px solid var(--border-subtle)',
                        }),
                      }}
                    >
                      {STATUS_ICONS[s]}
                      <span style={{ display: 'none', '@media (min-width: 768px)': { display: 'inline' } }}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button onClick={handleBulkSubmit} loading={submitting} size="lg" style={{ minWidth: 200 }}>
          <Save size={16} />
          Submit Attendance ({summary.total})
        </Button>
      </div>
    </div>
  )
}
