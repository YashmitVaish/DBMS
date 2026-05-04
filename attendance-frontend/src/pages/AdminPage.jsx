import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { UserCheck, BookOpen } from 'lucide-react'
import { adminService } from '../services/adminService'
import { userService } from '../services/userService'
import { courseService } from '../services/courseService'
import { getErrorMessage } from '../utils/helpers'
import Button from '../components/common/Button'
import Card from '../components/common/Card'
import { FormField, Select } from '../components/common/FormField'

export default function AdminPage() {
  const [users, setUsers] = useState([])
  const [courses, setCourses] = useState([])
  const [enrolling, setEnrolling] = useState(false)
  const [assigning, setAssigning] = useState(false)

  const { register: regEnroll, handleSubmit: handleEnroll, reset: resetEnroll, formState: { errors: errEnroll } } = useForm()
  const { register: regAssign, handleSubmit: handleAssign, reset: resetAssign, formState: { errors: errAssign } } = useForm()

  useEffect(() => {
    Promise.all([userService.listUsers(), courseService.listCourses()])
      .then(([u, c]) => { setUsers(u); setCourses(c) })
      .catch(() => {})
  }, [])

  const students = users.filter(u => u.role === 'student')
  const teachers = users.filter(u => u.role === 'teacher')

  const onEnroll = async (data) => {
    setEnrolling(true)
    try {
      await adminService.enrollStudent({
        student_id: data.student_id,
        course_id: Number(data.course_id),
        is_active: true,
      })
      toast.success('Student enrolled successfully')
      resetEnroll()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally { setEnrolling(false) }
  }

  const onAssign = async (data) => {
    setAssigning(true)
    try {
      const res = await adminService.assignTeacher({
        teacher_id: data.teacher_id,
        course_id: Number(data.course_id),
        period_id: Number(data.period_id),
      })
      toast.success(res.created ? 'Teacher assigned successfully' : 'Assignment already exists')
      resetAssign()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally { setAssigning(false) }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeIn 0.4s ease' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>
        {/* Enroll Student */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ background: 'var(--success-muted)', borderRadius: 'var(--radius-sm)', padding: 8 }}>
              <UserCheck size={18} style={{ color: 'var(--success)' }} />
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: 700 }}>Enroll Student</h3>
          </div>

          <form onSubmit={handleEnroll(onEnroll)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <FormField label="Student" required error={errEnroll.student_id?.message}>
              <Select register={regEnroll('student_id', { required: 'Select a student' })} error={errEnroll.student_id}>
                <option value="">Select student...</option>
                {students.map(s => <option key={s.user_id} value={s.user_id}>{s.name} — {s.email}</option>)}
              </Select>
            </FormField>
            <FormField label="Course" required error={errEnroll.course_id?.message}>
              <Select register={regEnroll('course_id', { required: 'Select a course' })} error={errEnroll.course_id}>
                <option value="">Select course...</option>
                {courses.map(c => <option key={c.course_id} value={c.course_id}>{c.code} — {c.name}</option>)}
              </Select>
            </FormField>
            <Button type="submit" loading={enrolling} fullWidth>
              <UserCheck size={15} /> Enroll Student
            </Button>
          </form>
        </Card>

        {/* Assign Teacher */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ background: 'var(--accent-teal-muted)', borderRadius: 'var(--radius-sm)', padding: 8 }}>
              <BookOpen size={18} style={{ color: 'var(--accent-teal)' }} />
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: 700 }}>Assign Teacher</h3>
          </div>

          <form onSubmit={handleAssign(onAssign)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <FormField label="Teacher" required error={errAssign.teacher_id?.message}>
              <Select register={regAssign('teacher_id', { required: 'Select a teacher' })} error={errAssign.teacher_id}>
                <option value="">Select teacher...</option>
                {teachers.map(t => <option key={t.user_id} value={t.user_id}>{t.name} — {t.email}</option>)}
              </Select>
            </FormField>
            <FormField label="Course" required error={errAssign.course_id?.message}>
              <Select register={regAssign('course_id', { required: 'Select a course' })} error={errAssign.course_id}>
                <option value="">Select course...</option>
                {courses.map(c => <option key={c.course_id} value={c.course_id}>{c.code} — {c.name}</option>)}
              </Select>
            </FormField>
            <FormField label="Period ID" required error={errAssign.period_id?.message}>
              <input
                type="number" min="1" defaultValue="1"
                {...regAssign('period_id', { required: 'Required', min: { value: 1, message: 'Min 1' } })}
                style={{ background: 'var(--bg-elevated)', border: `1px solid ${errAssign.period_id ? 'var(--danger)' : 'var(--border-default)'}`, borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', padding: '10px 14px', fontSize: '14px', outline: 'none', width: '100%' }}
              />
              {errAssign.period_id && <span style={{ fontSize: '12px', color: 'var(--danger)' }}>{errAssign.period_id.message}</span>}
            </FormField>
            <Button type="submit" loading={assigning} fullWidth>
              <BookOpen size={15} /> Assign Teacher
            </Button>
          </form>
        </Card>
      </div>

      {/* Info cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        {[
          ['Total Users', users.length, 'var(--accent-primary)'],
          ['Students', students.length, 'var(--success)'],
          ['Teachers', teachers.length, 'var(--accent-teal)'],
          ['Courses', courses.length, 'var(--accent-amber)'],
        ].map(([label, count, color]) => (
          <div key={label} style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)', padding: '20px 24px',
            borderTop: `3px solid ${color}`,
          }}>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: 6 }}>{label}</div>
            <div style={{ fontSize: '32px', fontWeight: 800, fontFamily: 'var(--font-display)', color }}>{count}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
