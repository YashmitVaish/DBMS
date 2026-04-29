/* eslint-disable react-refresh/only-export-components */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { apiRequest } from '../api'

export type AuthUser = {
  user_id: number | string
  role: string
  email: string
  name: string
}

type LoginResponse = {
  access_token: string
  role: string
  user_id: number | string
}

type MeResponse = {
  user_id?: number | string
  id?: number | string
  role?: string
  email?: string
  name?: string
  full_name?: string
}

type AuthContextValue = {
  token: string | null
  user: AuthUser | null
  initializing: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const TOKEN_KEY = 'access_token'

function normalizeUser(me: MeResponse, fallback?: Partial<AuthUser>): AuthUser {
  const user_id =
    me.user_id ?? me.id ?? fallback?.user_id ?? ('' as unknown as string)
  const role = me.role ?? fallback?.role ?? ''
  const email = me.email ?? fallback?.email ?? ''
  const name = me.name ?? me.full_name ?? fallback?.name ?? ''

  return {
    user_id,
    role,
    email,
    name,
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_KEY),
  )
  const [user, setUser] = useState<AuthUser | null>(null)
  const initializing = Boolean(token && !user)

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    // cleanup from earlier scaffold
    localStorage.removeItem('role')
    localStorage.removeItem('user_id')

    setToken(null)
    setUser(null)
  }, [])

  const loadMe = useCallback(
    async (t: string) => {
      const me = await apiRequest<MeResponse>('/users/me', {}, t, logout)
      setUser((prev) => normalizeUser(me, prev ?? undefined))
    },
    [logout],
  )

  useEffect(() => {
    if (!token || user) return

    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadMe(token).catch(() => {
      // apiRequest handles 401 by calling logout()
    })
  }, [token, user, loadMe])

  const login = useCallback(
    async (email: string, password: string) => {
      const data = await apiRequest<LoginResponse>('/auth/login', {
        method: 'POST',
        json: { email, password },
      })

      localStorage.setItem(TOKEN_KEY, data.access_token)
      setToken(data.access_token)

      setUser({
        user_id: data.user_id,
        role: data.role,
        email,
        name: '',
      })

      await loadMe(data.access_token)
    },
    [loadMe],
  )

  const value = useMemo<AuthContextValue>(
    () => ({ token, user, initializing, login, logout }),
    [token, user, initializing, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
