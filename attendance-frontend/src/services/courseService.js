import api from './api'

export const courseService = {
  listCourses: async () => {
    const { data } = await api.get('/courses')
    return data
  },
  createCourse: async (payload) => {
    const { data } = await api.post('/courses', payload)
    return data
  },
}
