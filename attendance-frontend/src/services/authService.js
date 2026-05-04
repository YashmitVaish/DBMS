import api from './api'

export const authService = {
  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    return data
  },
  getMe: async () => {
    const { data } = await api.get('/users/me')
    return data
  },
}
