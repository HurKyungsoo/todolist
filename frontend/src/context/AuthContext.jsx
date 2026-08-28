import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { getToken, setToken } from '../api/client'
import * as authApi from '../api/auth'

const USER_KEY = 'todolist.user'
const AuthContext = createContext(null)

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY)) || null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() => getToken())
  const [user, setUser] = useState(readStoredUser)

  const login = useCallback(async (credentials) => {
    const res = await authApi.login(credentials)
    const nextUser = { id: res.userId, username: res.username }
    setToken(res.token)
    setTokenState(res.token)
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser))
    setUser(nextUser)
    return res
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setTokenState(null)
    localStorage.removeItem(USER_KEY)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ token, user, isAuthenticated: Boolean(token), login, logout, signup: authApi.signup }),
    [token, user, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
  return ctx
}
