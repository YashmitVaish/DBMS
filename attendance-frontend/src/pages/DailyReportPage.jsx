import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { reportService } from '../services/reportService'
import { getErrorMessage, formatDate } from '../utils/helpers'
import DataTable from '../components/common/DataTable'
import Card from '../components/common/Card'
import { StatusBadge } from '../components/common/Badge'
import UpdateAttendanceModal from '../components/common/UpdateAttendanceModal'

export default function DailyReportPage() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(false)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])

  const load = async (d) => {
    setLoading(true)
    try {
      const data = await reportService.getDailyReport(d)
      setRecords(data)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load(date) }, [])

  const summary = {
    present: records.filter(r => r.status === 'present').length,
    absent:  records.filter(r => r.status === 'absent').length,
    late:    records.filter(r => r.status === 'late').length,
    excused: records.filter(r => r.status === 'excused').length,
  }

  const columns = [
    { key: 'student_name', label: 'Student', render: v => <strong style={{ color: 'var(--text-primary)' }}>{v}</strong> },
    { key: 'course_code',  label: 'Course', render: v => (
      <span style={{ background: 'var(--accent-primary-muted)', color: 'var(--accent-primary)', padding: '2px 8px', borderRadius: '99px', fontSize: '12px', fontWeight: 700 }}>{v}</span>
    )},
    { key: 'course_name',  label: 'Course Name' },
    { key: 'status',       label: 'Status', render: v => <StatusBadge status={v} /> },
    { key: 'marked_by_email', label: 'Marked By', render: v => <span style={{ fontSize: '13px' }}>{v || '—'}</span> },
    { key: 'remarks',      label: 'Remarks', render: v => <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{v || '—'}</span> },
    { key: 'attendance_id', label: 'Actions', render: (v, row) => (
      <UpdateAttendanceModal
        attendanceId={v}
        currentStatus={row.status}
        onSuccess={() => load(date)}
      />
    )},
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeIn 0.4s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <input
          type="date"
          value={date}
          onChange={e => { setDate(e.target.value); load(e.target.value) }}
          style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)', color: 'var(--text-primary)',
            padding: '10px 14px', fontSize: '14px', outline: 'none', colorScheme: 'dark',
          }}
        />
        <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          {records.length} record{records.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Summary chips */}
      {records.length > 0 && (
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {[
            ['Present', summary.present, 'var(--success)', 'var(--success-muted)'],
            ['Absent',  summary.absent,  'var(--danger)',  'var(--danger-muted)'],
            ['Late',    summary.late,    'var(--warning)', 'var(--warning-muted)'],
            ['Excused', summary.excused, 'var(--info)',    'var(--info-muted)'],
          ].map(([label, count, color, bg]) => (
            <div key={label} style={{
              background: bg, border: `1px solid ${color}33`, borderRadius: 'var(--radius-md)',
              padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span style={{ fontSize: '22px', fontWeight: 800, fontFamily: 'var(--font-display)', color }}>{count}</span>
              <span style={{ fontSize: '13px', color, fontWeight: 500 }}>{label}</span>
            </div>
          ))}
        </div>
      )}

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 700 }}>
            Daily Attendance — {formatDate(date)}
          </h3>
        </div>
        <DataTable columns={columns} data={records} loading={loading} emptyMessage="No attendance records for this date" />
      </Card>
    </div>
  )
}
