import apiClient from './client'
import type { Client } from '../types'

export const getClientProfile = async (): Promise<Client> => {
  const res = await apiClient.get<Client>('/clients/me')
  return res.data
}

export const updateClientProfile = async (data: {
  phone?: string
  delivery_address?: string
}): Promise<Client> => {
  const res = await apiClient.patch<Client>('/clients/me', data)
  return res.data
}
