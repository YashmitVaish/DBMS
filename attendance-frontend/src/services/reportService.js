import api from './api'

export const reportService = {
  getMyReport: async (periodId) => {
    const { data } = await api.get(`/reports/student/me?period_id=${periodId}`)
    return data
  },
  getStudentReport: async (studentId, periodId) => {
    const { data } = await api.get(`/reports/student/${studentId}?period_id=${periodId}`)
    return data
  },
  getLowAttendance: async (courseId, periodId) => {
    const { data } = await api.get(`/reports/low-attendance?course_id=${courseId}&period_id=${periodId}`)
    return data
  },
  getDailyReport: async (date) => {
    const url = date ? `/reports/daily?date=${date}` : '/reports/daily'
    const { data } = await api.get(url)
    return data
  },
}
