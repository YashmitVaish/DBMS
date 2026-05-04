import api from './api'

export const userService = {
  listUsers: async () => {
    const { data } = await api.get('/users/')
    return data
  },
  createUser: async (payload) => {
    const { data } = await api.post('/users', payload)
    return data
  },
}
