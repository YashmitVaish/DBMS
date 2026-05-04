import api from './api'

export const attendanceService = {
  markOne: async (payload) => {
    const { data } = await api.post('/attendance/mark', payload)
    return data
  },
  bulkMark: async (payload) => {
    const { data } = await api.post('/attendance/bulk', payload)
    return data
  },
  updateAttendance: async (attendanceId, payload) => {
    const { data } = await api.put(`/attendance/${attendanceId}`, payload)
    return data
  },
}
