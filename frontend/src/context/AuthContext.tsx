import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react'
import { apiRequest } from '../lib/api'

export type Role = 'admin' | 'user'

export interface CurrentUser {
  id: string
  role: Role
  name: string
  email: string
  blocked: boolean
  plan: string
  usageMinutes: number
  usageLimit: number | null
  tenantId: string
}

interface AuthContextValue {
  user: CurrentUser | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

const TOKEN_KEY = 'autoniv-token'
const USER_KEY = 'autoniv-user'

function readStoredUser(): CurrentUser | null {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as CurrentUser
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(readStoredUser)
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function hydrate() {
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const response = await apiRequest<{ user: CurrentUser }>('/auth/me', {}, token)
        setUser(response.user)
        localStorage.setItem(USER_KEY, JSON.stringify(response.user))
      } catch {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(USER_KEY)
        setUser(null)
        setToken(null)
      } finally {
        setLoading(false)
      }
    }

    hydrate()
  }, [token])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      loading,
      login: async (email, password) => {
        const response = await apiRequest<{ token: string; user: CurrentUser }>('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        })

        setUser(response.user)
        setToken(response.token)
        localStorage.setItem(TOKEN_KEY, response.token)
        localStorage.setItem(USER_KEY, JSON.stringify(response.user))
      },
      logout: () => {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(USER_KEY)
        setUser(null)
        setToken(null)
      },
    }),
    [loading, token, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}
