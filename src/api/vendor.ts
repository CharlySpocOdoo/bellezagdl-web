import apiClient from './client'
import type { Vendor, Client, CommissionPeriod } from '../types'

export const getVendorProfile = async (): Promise<Vendor> => {
  const res = await apiClient.get<Vendor>('/vendors/me')
  return res.data
}

export const getVendorClients = async (): Promise<Client[]> => {
  const res = await apiClient.get<Client[]>('/vendors/me/clients')
  return res.data
}

export const getVendorCommissions = async (): Promise<{
  current_week_commission: number
  pending_payment: number
  periods: CommissionPeriod[]
}> => {
  const res = await apiClient.get('/vendors/me/commissions')
  return res.data
}