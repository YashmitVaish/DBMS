import React, { useEffect, useState } from 'react'
import { Users, BookOpen, ClipboardCheck, TrendingUp, AlertTriangle, Calendar } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { useAuth } from '../context/AuthContext'
import { userService } from '../services/userService'
import { courseService } from '../services/courseService'
import { reportService } from '../services/reportService'
import { attendanceService } from '../services/attendanceService'
import StatCard from '../components/common/StatCard'
import Card from '../components/common/Card'
import Spinner from '../components/common/Spinner'
import { StatusBadge } from '../components/common/Badge'
import { formatDate } from '../utils/helpers'

const PIE_COLORS = ['#34d399', '#f87171', '#fbbf24', '#60a5fa']

export default function DashboardPage() {
  const { user, isAdmin, isTeacher, isStudent } = useAuth()
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [dailyData, setDailyData] = useState([])
  const [myReport, setMyReport] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const today = new Date().toISOString().split('T')[0]

        if (isAdmin || isTeacher) {
          const [users, courses, daily] = await Promise.allSettled([
            userService.listUsers(),
            courseService.listCourses(),
            reportService.getDailyReport(today),
          ])
          const usersData = users.status === 'fulfilled' ? users.value : []
          const coursesData = courses.status === 'fulfilled' ? courses.value : []
          const dailyRecords = daily.status === 'fulfilled' ? daily.value : []

          const presentToday = dailyRecords.filter(r => r.status === 'present').length
          const absentToday = dailyRecords.filter(r => r.status === 'absent').length
          const lateToday = dailyRecords.filter(r => r.status === 'late').length
          const excusedToday = dailyRecords.filter(r => r.status === 'excused').length

          setStats({
            totalUsers: usersData.length,
            totalStudents: usersData.filter(u => u.role === 'student').length,
            totalTeachers: usersData.filter(u => u.role === 'teacher').length,
            totalCourses: coursesData.length,
            presentToday, absentToday, lateToday, excusedToday,
          })

          // Build pie data
          setDailyData([
            { name: 'Present', value: presentToday },
            { name: 'Absent', value: absentToday },
            { name: 'Late', value: lateToday },
            { name: 'Excused', value: excusedToday },
          ].filter(d => d.value > 0))
        }

        if (isStudent) {
          const [courses, report] = await Promise.allSettled([
            courseService.listCourses(),
            reportService.getMyReport(1),
          ])
          const coursesData = courses.status === 'fulfilled' ? courses.value : []
          const reportData = report.status === 'fulfilled' ? report.value : null
          setStats({ totalCourses: coursesData.length })
          if (reportData) setMyReport(reportData)
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [isAdmin, isTeacher, isStudent])

  if (loading) return <Spinner fullPage />

  const avgAttendance = myReport?.rows?.length
    ? (myReport.rows.reduce((a, r) => a + r.attendance_pct, 0) / myReport.rows.length).toFixed(1)
    : null

  const belowThreshold = myReport?.rows?.filter(r => r.is_below_threshold).length || 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeIn 0.4s ease' }}>
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(79,142,247,0.15), rgba(45,212,191,0.08))',
        border: '1px solid rgba(79,142,247,0.2)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px 28px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: 4 }}>
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]} 👋
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            Here's what's happening with attendance today.
          </p>
        </div>
      </div>

      {/* Admin/Teacher Stats */}
      {(isAdmin || isTeacher) && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
            {isAdmin && (
              <>
                <StatCard label="Total Users" value={stats.totalUsers || 0} icon={Users} accent="var(--accent-primary)" />
                <StatCard label="Students" value={stats.totalStudents || 0} icon={Users} accent="var(--success)" />
                <StatCard label="Teachers" value={stats.totalTeachers || 0} icon={Users} accent="var(--accent-teal)" />
              </>
            )}
            <StatCard label="Active Courses" value={stats.totalCourses || 0} icon={BookOpen} accent="var(--accent-amber)" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
            <StatCard label="Present Today" value={stats.presentToday || 0} icon={ClipboardCheck} accent="var(--success)" />
            <StatCard label="Absent Today"  value={stats.absentToday  || 0} icon={ClipboardCheck} accent="var(--danger)"  />
            <StatCard label="Late Today"    value={stats.lateToday    || 0} icon={ClipboardCheck} accent="var(--warning)" />
            <StatCard label="Excused Today" value={stats.excusedToday || 0} icon={ClipboardCheck} accent="var(--info)"    />
          </div>

          {dailyData.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <Card>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', marginBottom: 20 }}>
                  Today's Attendance Breakdown
                </h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={dailyData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                      {dailyData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 13 }} />
                    <Legend wrapperStyle={{ fontSize: 12, color: 'var(--text-secondary)' }} />
                  </PieChart>
                </ResponsiveContainer>
              </Card>

              <Card>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', marginBottom: 20 }}>
                  Status Distribution
                </h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={dailyData} barSize={36}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                    <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 13 }} />
                    <Bar dataKey="value" fill="var(--accent-primary)" radius={[4, 4, 0, 0]}>
                      {dailyData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>
          )}
        </>
      )}

      {/* Student Stats */}
      {isStudent && myReport && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
            <StatCard label="My Courses"     value={stats.totalCourses || 0} icon={BookOpen} accent="var(--accent-primary)" />
            <StatCard label="Avg Attendance" value={avgAttendance ? `${avgAttendance}%` : '—'} icon={TrendingUp} accent="var(--success)" />
            <StatCard label="Below Threshold" value={belowThreshold} icon={AlertTriangle} accent={belowThreshold > 0 ? 'var(--danger)' : 'var(--success)'} />
          </div>

          <Card>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', marginBottom: 16 }}>
              My Course Attendance
            </h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={myReport.rows} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="course_code" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => `${v}%`} contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 13 }} />
                <Bar dataKey="attendance_pct" name="Attendance %" radius={[4, 4, 0, 0]}>
                  {myReport.rows.map((r, i) => (
                    <Cell key={i} fill={r.is_below_threshold ? '#f87171' : r.attendance_pct >= 85 ? '#34d399' : '#4f8ef7'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
              {[['#34d399', '≥85%'], ['#4f8ef7', '75-84%'], ['#f87171', '<75%']].map(([c, l]) => (
                <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-muted)' }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: c }} />{l}
                </span>
              ))}
              <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}>Threshold: 75%</span>
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
