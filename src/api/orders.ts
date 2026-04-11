import apiClient from './client'
import type { Order, CartItem } from '../types'

export const createOrder = async (items: CartItem[]): Promise<Order> => {
  const payload = {
    items: items.map((item) => ({
      variant_id: item.variant_id,
      quantity: item.quantity,
    })),
  }
  const res = await apiClient.post<Order>('/orders', payload)
  return res.data
}

export const getOrders = async (): Promise<Order[]> => {
  const res = await apiClient.get<Order[]>('/orders')
  return res.data
}

export const getOrder = async (id: string): Promise<Order> => {
  const res = await apiClient.get<Order>(`/orders/${id}`)
  return res.data
}

export const acceptPartialOrder = async (
  id: string,
  accept: boolean
): Promise<Order> => {
  const res = await apiClient.patch<Order>(`/orders/${id}/partial-accept`, { accept })
  return res.data
}

export const requestReturn = async (id: string): Promise<Order> => {
  const res = await apiClient.patch<Order>(`/orders/${id}/status`, {
    status: 'return_requested',
  })
  return res.data
}

export const addOrderNote = async (id: string, note: string): Promise<Order> => {
  const res = await apiClient.patch<Order>(`/orders/${id}/notes`, { note })
  return res.data
}

export const cancelOrder = async (id: string): Promise<Order> => {
  const res = await apiClient.patch<Order>(`/orders/${id}/status`, {
    status: 'cancelled',
  })
  return res.data
}