import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import AppLayout from './components/layout/AppLayout'
import Spinner from './components/common/Spinner'

import LoginPage          from './pages/LoginPage'
import ProfilePage        from './pages/ProfilePage'
import DashboardPage      from './pages/DashboardPage'
import UsersPage          from './pages/UsersPage'
import CoursesPage        from './pages/CoursesPage'
import AttendancePage     from './pages/AttendancePage'
import DailyReportPage    from './pages/DailyReportPage'
import StudentReportsPage from './pages/StudentReportsPage'
import LowAttendancePage  from './pages/LowAttendancePage'
import AdminPage          from './pages/AdminPage'
import NotFoundPage       from './pages/NotFoundPage'

function PrivateRoute({ children, roles }) {
  const { user, loading } = useAuth()
  if (loading) return <Spinner fullPage />
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />
  return children
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <Spinner fullPage />
  if (user) return <Navigate to="/dashboard" replace />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />

      <Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/users"     element={<PrivateRoute roles={['admin']}><UsersPage /></PrivateRoute>} />
        <Route path="/courses"   element={<CoursesPage />} />
        <Route path="/attendance" element={<PrivateRoute roles={['admin', 'teacher']}><AttendancePage /></PrivateRoute>} />
        <Route path="/reports/daily"   element={<PrivateRoute roles={['admin', 'teacher']}><DailyReportPage /></PrivateRoute>} />
        <Route path="/reports/student" element={<StudentReportsPage />} />
        <Route path="/reports/low"     element={<PrivateRoute roles={['admin', 'teacher', 'dept_head']}><LowAttendancePage /></PrivateRoute>} />
        <Route path="/admin"           element={<PrivateRoute roles={['admin']}><AdminPage /></PrivateRoute>} />
        <Route path="/profile"         element={<ProfilePage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
