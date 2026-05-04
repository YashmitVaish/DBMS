import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { AlertTriangle } from 'lucide-react'
import { reportService } from '../services/reportService'
import { courseService } from '../services/courseService'
import { getErrorMessage } from '../utils/helpers'
import DataTable from '../components/common/DataTable'
import Button from '../components/common/Button'
import Card from '../components/common/Card'
import { PctBadge } from '../components/common/Badge'

export default function LowAttendancePage() {
  const [courses, setCourses] = useState([])
  const [courseId, setCourseId] = useState('')
  const [periodId, setPeriodId] = useState('1')
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    courseService.listCourses().then(setCourses).catch(() => {})
  }, [])

  const load = async () => {
    if (!courseId) return toast.error('Select a course')
    setLoading(true)
    try {
      const data = await reportService.getLowAttendance(Number(courseId), Number(periodId))
      setRecords(data)
      if (data.length === 0) toast.success('No students below threshold!')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    { key: 'student_name', label: 'Student', render: (v, row) => (
      <div>
        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{v}</div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{row.email}</div>
      </div>
    )},
    { key: 'total_classes', label: 'Total Classes', align: 'center' },
    { key: 'attended',      label: 'Attended',      align: 'center', render: v => <span style={{ color: 'var(--success)', fontWeight: 600 }}>{v}</span> },
    { key: 'percentage',    label: 'Attendance',     align: 'center', render: v => <PctBadge pct={v} /> },
    { key: 'percentage',    label: 'Risk Level',     align: 'center', render: v => (
      <span style={{
        padding: '3px 10px', borderRadius: '99px', fontSize: '12px', fontWeight: 700,
        ...(v < 50 ? { background: 'var(--danger-muted)', color: 'var(--danger)' }
          : v < 65 ? { background: 'var(--warning-muted)', color: 'var(--warning)' }
          : { background: 'rgba(251,191,36,0.08)', color: 'var(--warning)' })
      }}>
        {v < 50 ? '🔴 Critical' : v < 65 ? '🟡 High' : '🟠 Moderate'}
      </span>
    )},
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeIn 0.4s ease' }}>
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <AlertTriangle size={20} style={{ color: 'var(--warning)' }} />
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px' }}>Low Attendance Filter</h3>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 240px' }}>
            <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>Course</div>
            <select
              value={courseId} onChange={e => setCourseId(e.target.value)}
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', padding: '10px 14px', fontSize: '14px', outline: 'none', width: '100%', appearance: 'none' }}
            >
              <option value="">Select course...</option>
              {courses.map(c => <option key={c.course_id} value={c.course_id}>{c.code} — {c.name}</option>)}
            </select>
          </div>
          <div style={{ flex: '0 1 140px' }}>
            <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>Period ID</div>
            <input
              type="number" min="1" value={periodId} onChange={e => setPeriodId(e.target.value)}
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', padding: '10px 14px', fontSize: '14px', outline: 'none', width: '100%' }}
            />
          </div>
          <Button onClick={load} loading={loading} style={{ flex: '0 0 auto' }}>
            <AlertTriangle size={14} /> Find Low Attendance
          </Button>
        </div>
      </Card>

      {records.length > 0 && (
        <div style={{ display: 'flex', gap: 12 }}>
          {[
            ['Critical (<50%)', records.filter(r => r.percentage < 50).length, 'var(--danger)'],
            ['High (50–64%)',   records.filter(r => r.percentage >= 50 && r.percentage < 65).length, 'var(--warning)'],
            ['Moderate (65–74%)', records.filter(r => r.percentage >= 65).length, 'var(--accent-amber)'],
          ].map(([label, count, color]) => count > 0 && (
            <div key={label} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '12px 20px' }}>
              <div style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'var(--font-display)', color }}>{count}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{label}</div>
            </div>
          ))}
        </div>
      )}

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 700 }}>
            Students Below 75% Threshold
            {records.length > 0 && <span style={{ color: 'var(--danger)', marginLeft: 8 }}>({records.length})</span>}
          </h3>
        </div>
        <DataTable columns={columns} data={records} loading={loading} emptyMessage="Select a course and period to view low attendance students" />
      </Card>
    </div>
  )
}
