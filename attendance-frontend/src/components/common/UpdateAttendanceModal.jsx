import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Edit2 } from 'lucide-react'
import { attendanceService } from '../../services/attendanceService'
import { getErrorMessage } from '../../utils/helpers'
import Modal from './Modal'
import Button from './Button'
import { FormField, Select, Input } from './FormField'

export default function UpdateAttendanceModal({ attendanceId, currentStatus, onSuccess }) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { new_status: currentStatus, reason: '' }
  })

  const onSubmit = async (data) => {
    if (!attendanceId) return toast.error('No attendance ID')
    setSaving(true)
    try {
      await attendanceService.updateAttendance(attendanceId, {
        new_status: data.new_status,
        reason: data.reason || undefined,
      })
      toast.success('Attendance updated')
      setOpen(false)
      reset()
      onSuccess?.()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Edit attendance"
        style={{
          background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)', padding: '5px 8px',
          color: 'var(--text-secondary)', cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', gap: 4,
          fontSize: '12px', transition: 'all var(--transition-fast)',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; e.currentTarget.style.color = 'var(--accent-primary)' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
      >
        <Edit2 size={12} /> Edit
      </button>

      <Modal isOpen={open} onClose={() => { setOpen(false); reset() }} title="Update Attendance" width={400}>
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <FormField label="New Status" required error={errors.new_status?.message}>
            <Select register={register('new_status', { required: 'Required' })} error={errors.new_status}>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
              <option value="excused">Excused</option>
            </Select>
          </FormField>
          <FormField label="Reason / Notes">
            <Input register={register('reason')} placeholder="e.g. Medical leave, official duty..." />
          </FormField>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
            <Button variant="ghost" type="button" onClick={() => { setOpen(false); reset() }}>Cancel</Button>
            <Button type="submit" loading={saving}>Save Changes</Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
