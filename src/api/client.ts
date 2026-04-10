import axios from 'axios'

// ─── Instancia base ───────────────────────────────────────────────────────────

const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:8000/v1',
  headers: {
    'Content-Type': 'application/json',
  },
})

// ─── Token en memoria ────────────────────────────────────────────────────────
// El JWT nunca toca localStorage — vive solo en memoria

let accessToken: string | null = null

export const setAccessToken = (token: string | null) => {
  accessToken = token
}

export const getAccessToken = () => accessToken

// ─── Interceptor de request ──────────────────────────────────────────────────
// Adjunta el JWT automáticamente en cada llamada

apiClient.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

// ─── Interceptor de response ─────────────────────────────────────────────────
// Si la API devuelve 401, renueva el JWT y reintenta el request original

let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (error: unknown) => void
}> = []

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token!)
    }
  })
  failedQueue = []
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Si no es 401 o ya reintentamos — propagar el error
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }

    // Si ya estamos renovando el token — encolar el request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return apiClient(originalRequest)
        })
        .catch((err) => Promise.reject(err))
    }

    originalRequest._retry = true
    isRefreshing = true

    const refreshToken = localStorage.getItem('refresh_token')

    if (!refreshToken) {
      isRefreshing = false
      // Sin refresh token — limpiar sesión
      setAccessToken(null)
      localStorage.removeItem('refresh_token')
      window.location.href = '/login'
      return Promise.reject(error)
    }

    try {
      // Llamada directa con fetch para evitar el interceptor
      const res = await fetch('http://127.0.0.1:8000/v1/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      })

      if (!res.ok) throw new Error('Refresh failed')

      const data = await res.json()
      const newToken = data.access_token

      setAccessToken(newToken)
      processQueue(null, newToken)

      originalRequest.headers.Authorization = `Bearer ${newToken}`
      return apiClient(originalRequest)
    } catch (refreshError) {
      processQueue(refreshError, null)
      setAccessToken(null)
      localStorage.removeItem('refresh_token')
      window.location.href = '/login'
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)

export default apiClient