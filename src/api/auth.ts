import apiClient, { setAccessToken } from './client'
import type { LoginResponse, User } from '../types'

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const res = await apiClient.post<LoginResponse>('/auth/login', { email, password })
  return res.data
}

export const refreshToken = async (refresh_token: string): Promise<LoginResponse> => {
  const res = await apiClient.post<LoginResponse>('/auth/refresh', { refresh_token })
  return res.data
}

export const logout = async (refresh_token: string): Promise<void> => {
  await apiClient.post('/auth/logout', { refresh_token })
  setAccessToken(null)
  localStorage.removeItem('refresh_token')
}

export const getMe = async (): Promise<User> => {
  const res = await apiClient.get<User>('/auth/me')
  return res.data
}

export const validateInviteToken = async (token: string) => {
  const encoded = encodeURIComponent(token)
  const res = await apiClient.get(`/auth/invite/${encoded}`)
  return res.data
}

export const registerClient = async (data: {
  token: string
  email: string
  password: string
  first_name: string
  last_name: string
  phone: string
  delivery_address: string
}): Promise<LoginResponse> => {
  const res = await apiClient.post<LoginResponse>('/auth/register/client', {
    invitation_token: data.token,
    email: data.email,
    password: data.password,
    first_name: data.first_name,
    last_name: data.last_name,
    phone: data.phone,
    delivery_address: data.delivery_address,
  })
  return res.data
}