import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Search, TrendingUp, TrendingDown } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts'
import { reportService } from '../services/reportService'
import { userService } from '../services/userService'
import { getErrorMessage, formatPct } from '../utils/helpers'
import { useAuth } from '../context/AuthContext'
import Button from '../components/common/Button'
import Card from '../components/common/Card'
import Spinner from '../components/common/Spinner'
import { PctBadge } from '../components/common/Badge'

export default function StudentReportsPage() {
  const { isStudent, user } = useAuth()
  const [students, setStudents] = useState([])
  const [selectedStudent, setSelectedStudent] = useState('')
  const [periodId, setPeriodId] = useState('1')
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const [fetchingStudents, setFetchingStudents] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!isStudent) {
      setFetchingStudents(true)
      userService.listUsers()
        .then(users => setStudents(users.filter(u => u.role === 'student')))
        .catch(() => {})
        .finally(() => setFetchingStudents(false))
    } else {
      // Auto-load own report
      loadMyReport()
    }
  }, [isStudent])

  const loadMyReport = async () => {
    setLoading(true)
    try {
      const data = await reportService.getMyReport(Number(periodId))
      setReport(data)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const loadStudentReport = async () => {
    if (!selectedStudent) return toast.error('Select a student first')
    setLoading(true)
    try {
      const data = await reportService.getStudentReport(selectedStudent, Number(periodId))
      setReport(data)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const filteredStudents = students.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  )

  const avg = report?.rows?.length
    ? (report.rows.reduce((a, r) => a + r.attendance_pct, 0) / report.rows.length).toFixed(1)
    : null

  return (
    <div style={{ display: 'flex', gap: 24, flexDirection: 'column', animation: 'fadeIn 0.4s ease' }}>
      {!isStudent && (
        <Card>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', marginBottom: 16 }}>
            Select Student & Period
          </h3>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ flex: '1 1 260px' }}>
              <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>Student</div>
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search students..."
                  style={{
                    background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-md)', color: 'var(--text-primary)',
                    padding: '9px 14px 9px 32px', fontSize: '14px', outline: 'none', width: '100%',
                  }}
                />
              </div>
              {search && (
                <div style={{
                  background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-md)', marginTop: 4, maxHeight: 180, overflowY: 'auto',
                }}>
                  {filteredStudents.slice(0, 8).map(s => (
                    <div key={s.user_id}
                      onClick={() => { setSelectedStudent(s.user_id); setSearch(s.name) }}
                      style={{
                        padding: '10px 14px', cursor: 'pointer', fontSize: '14px',
                        borderBottom: '1px solid var(--border-subtle)',
                        background: selectedStudent === s.user_id ? 'var(--accent-primary-muted)' : 'transparent',
                        color: selectedStudent === s.user_id ? 'var(--accent-primary)' : 'var(--text-primary)',
                        transition: 'background var(--transition-fast)',
                      }}
                      onMouseEnter={e => { if (selectedStudent !== s.user_id) e.currentTarget.style.background = 'var(--bg-hover)' }}
                      onMouseLeave={e => { if (selectedStudent !== s.user_id) e.currentTarget.style.background = 'transparent' }}
                    >
                      <div style={{ fontWeight: 500 }}>{s.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{s.email}</div>
                    </div>
                  ))}
                  {filteredStudents.length === 0 && (
                    <div style={{ padding: '12px 14px', color: 'var(--text-muted)', fontSize: '13px' }}>No matches</div>
                  )}
                </div>
              )}
            </div>

            <div style={{ flex: '0 1 140px' }}>
              <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>Period ID</div>
              <input
                type="number" min="1" value={periodId} onChange={e => setPeriodId(e.target.value)}
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', padding: '9px 14px', fontSize: '14px', outline: 'none', width: '100%' }}
              />
            </div>

            <Button onClick={loadStudentReport} loading={loading} style={{ flex: '0 0 auto', marginTop: 24 }}>
              Load Report
            </Button>
          </div>
        </Card>
      )}

      {isStudent && (
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>Period ID</div>
            <input
              type="number" min="1" value={periodId} onChange={e => setPeriodId(e.target.value)}
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', padding: '9px 14px', fontSize: '14px', outline: 'none' }}
            />
          </div>
          <Button onClick={loadMyReport} loading={loading}>Load My Report</Button>
        </div>
      )}

      {loading && <Spinner />}

      {report && !loading && (
        <>
          {/* Summary */}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '16px 22px', flex: '1 1 160px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: 4 }}>Avg Attendance</div>
              <div style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'var(--font-display)' }}>{avg}%</div>
            </div>
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '16px 22px', flex: '1 1 160px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: 4 }}>Courses</div>
              <div style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'var(--font-display)' }}>{report.rows.length}</div>
            </div>
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '16px 22px', flex: '1 1 160px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: 4 }}>Below Threshold</div>
              <div style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'var(--font-display)', color: report.rows.filter(r => r.is_below_threshold).length > 0 ? 'var(--danger)' : 'var(--success)' }}>
                {report.rows.filter(r => r.is_below_threshold).length}
              </div>
            </div>
          </div>

          {/* Chart */}
          <Card>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', marginBottom: 20 }}>Attendance by Course</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={report.rows} barSize={38}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="course_code" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <ReferenceLine y={75} stroke="var(--warning)" strokeDasharray="4 4" label={{ value: '75% threshold', fill: 'var(--warning)', fontSize: 11 }} />
                <Tooltip
                  formatter={(v, n, p) => [`${v.toFixed(1)}%`, 'Attendance']}
                  contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 13 }}
                />
                <Bar dataKey="attendance_pct" radius={[4, 4, 0, 0]}>
                  {report.rows.map((r, i) => (
                    <Cell key={i} fill={r.is_below_threshold ? '#f87171' : r.attendance_pct >= 85 ? '#34d399' : '#4f8ef7'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Table */}
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 700 }}>Detailed Breakdown</h3>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-default)' }}>
                    {['Course', 'Total', 'Present', 'Absent', 'Late', 'Excused', 'Attendance %', 'Status'].map(h => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {report.rows.map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '14px' }}>{row.course_code}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{row.course_name}</div>
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '14px' }}>{row.total_classes}</td>
                      <td style={{ padding: '12px 16px', color: 'var(--success)', fontSize: '14px', fontWeight: 600 }}>{row.present_count}</td>
                      <td style={{ padding: '12px 16px', color: 'var(--danger)', fontSize: '14px', fontWeight: 600 }}>{row.absent_count}</td>
                      <td style={{ padding: '12px 16px', color: 'var(--warning)', fontSize: '14px', fontWeight: 600 }}>{row.late_count}</td>
                      <td style={{ padding: '12px 16px', color: 'var(--info)', fontSize: '14px', fontWeight: 600 }}>{row.excused_count}</td>
                      <td style={{ padding: '12px 16px' }}><PctBadge pct={row.attendance_pct} /></td>
                      <td style={{ padding: '12px 16px' }}>
                        {row.is_below_threshold ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--danger)', fontSize: '12px', fontWeight: 600 }}>
                            <TrendingDown size={14} /> Below
                          </span>
                        ) : (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--success)', fontSize: '12px', fontWeight: 600 }}>
                            <TrendingUp size={14} /> OK
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
