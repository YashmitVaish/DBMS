import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Plus, BookOpen } from 'lucide-react'
import { courseService } from '../services/courseService'
import { getErrorMessage } from '../utils/helpers'
import Button from '../components/common/Button'
import Modal from '../components/common/Modal'
import Card from '../components/common/Card'
import Spinner from '../components/common/Spinner'
import { FormField, Input } from '../components/common/FormField'
import { useAuth } from '../context/AuthContext'

export default function CoursesPage() {
  const { isAdmin } = useAuth()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [creating, setCreating] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const load = async () => {
    setLoading(true)
    try { setCourses(await courseService.listCourses()) }
    catch (err) { toast.error(getErrorMessage(err)) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const onCreate = async (data) => {
    setCreating(true)
    try {
      await courseService.createCourse({
        ...data,
        department_id: Number(data.department_id),
        credits: Number(data.credits),
        max_students: Number(data.max_students),
      })
      toast.success('Course created')
      reset(); setShowModal(false); load()
    } catch (err) { toast.error(getErrorMessage(err)) }
    finally { setCreating(false) }
  }

  if (loading) return <Spinner fullPage />

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeIn 0.4s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: 2 }}>
            {courses.length} active course{courses.length !== 1 ? 's' : ''}
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setShowModal(true)}>
            <Plus size={15} /> New Course
          </Button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {courses.map(course => (
          <Card key={course.course_id} style={{ position: 'relative', overflow: 'hidden' }}>
            <div style={{
              position: 'absolute', top: 0, left: 0, width: 4, height: '100%',
              background: 'linear-gradient(180deg, var(--accent-primary), var(--accent-teal))',
            }} />
            <div style={{ paddingLeft: 12 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{
                  background: 'var(--accent-primary-muted)', color: 'var(--accent-primary)',
                  padding: '3px 10px', borderRadius: '99px', fontSize: '12px', fontWeight: 700,
                  fontFamily: 'var(--font-display)', letterSpacing: '0.05em',
                }}>
                  {course.code}
                </span>
                <span style={{
                  background: course.is_active ? 'var(--success-muted)' : 'var(--danger-muted)',
                  color: course.is_active ? 'var(--success)' : 'var(--danger)',
                  padding: '2px 8px', borderRadius: '99px', fontSize: '11px', fontWeight: 600,
                }}>
                  {course.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: 12, lineHeight: 1.3 }}>
                {course.name}
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[
                  ['Credits', course.credits],
                  ['Max Students', course.max_students],
                  ['Dept ID', course.department_id],
                  ['Course ID', course.course_id],
                ].map(([k, v]) => (
                  <div key={k}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: 2 }}>{k}</div>
                    <div style={{ fontSize: '14px', fontWeight: 600 }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}

        {courses.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            <BookOpen size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
            <div>No courses found</div>
          </div>
        )}
      </div>

      {isAdmin && (
        <Modal isOpen={showModal} onClose={() => { setShowModal(false); reset() }} title="Create Course">
          <form onSubmit={handleSubmit(onCreate)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <FormField label="Course Code" required error={errors.code?.message}>
              <Input register={register('code', { required: 'Code is required' })} placeholder="e.g. CS302" error={errors.code} />
            </FormField>
            <FormField label="Course Name" required error={errors.name?.message}>
              <Input register={register('name', { required: 'Name is required' })} placeholder="e.g. Operating Systems" error={errors.name} />
            </FormField>
            <FormField label="Department ID" required error={errors.department_id?.message}>
              <Input type="number" register={register('department_id', { required: 'Required' })} placeholder="1" error={errors.department_id} />
            </FormField>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <FormField label="Credits" required error={errors.credits?.message}>
                <Input type="number" register={register('credits', { required: 'Required', min: { value: 1, message: 'Min 1' }, max: { value: 10, message: 'Max 10' } })} placeholder="4" error={errors.credits} />
              </FormField>
              <FormField label="Max Students" required error={errors.max_students?.message}>
                <Input type="number" register={register('max_students', { required: 'Required', min: { value: 1, message: 'Min 1' } })} placeholder="60" error={errors.max_students} />
              </FormField>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
              <Button variant="ghost" onClick={() => { setShowModal(false); reset() }} type="button">Cancel</Button>
              <Button type="submit" loading={creating}>Create Course</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
