import api from './api'

export const adminService = {
  enrollStudent: async (payload) => {
    const { data } = await api.post('/admin/enroll', payload)
    return data
  },
  assignTeacher: async (payload) => {
    const { data } = await api.post('/admin/assign-teacher', payload)
    return data
  },
}
