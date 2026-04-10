import { createContext, useContext, useEffect, useState } from 'react'
import type { User } from '../types'
import { getMe, login as loginApi, logout as logoutApi } from '../api/auth'
import { setAccessToken } from '../api/client'

// ─── Tipos del contexto ───────────────────────────────────────────────────────

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

// ─── Contexto ─────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | null>(null)

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Al arrancar la app — intentar restaurar sesión con refresh token
  useEffect(() => {
    const restoreSession = async () => {
      const refreshToken = localStorage.getItem('refresh_token')

      if (!refreshToken) {
        setIsLoading(false)
        return
      }

      try {
        // Renovar JWT usando el refresh token guardado
        const res = await fetch('http://127.0.0.1:8000/v1/auth/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refreshToken }),
        })

        if (!res.ok) throw new Error('Session expired')

        const data = await res.json()
        setAccessToken(data.access_token)
        localStorage.setItem('refresh_token', data.refresh_token)

        // Obtener perfil del usuario
        const me = await getMe()
        setUser(me)
      } catch {
        // Sesión inválida — limpiar
        setAccessToken(null)
        localStorage.removeItem('refresh_token')
      } finally {
        setIsLoading(false)
      }
    }

    restoreSession()
  }, [])

  // ─── Login ────────────────────────────────────────────────────────────────

  const login = async (email: string, password: string) => {
    const data = await loginApi(email, password)

    // JWT en memoria — nunca en localStorage
    setAccessToken(data.access_token)

    // Refresh token en localStorage — sobrevive al cerrar el navegador
    localStorage.setItem('refresh_token', data.refresh_token)

    // Obtener perfil completo
    const me = await getMe()
    setUser(me)
  }

  // ─── Logout ───────────────────────────────────────────────────────────────

  const logout = async () => {
    const refreshToken = localStorage.getItem('refresh_token')
    if (refreshToken) {
      await logoutApi(refreshToken)
    }
    setUser(null)
    setAccessToken(null)
    localStorage.removeItem('refresh_token')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return context
}