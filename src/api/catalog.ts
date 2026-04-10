import apiClient from './client'
import type { Product, Category, Brand } from '../types'

export const getProducts = async (params?: {
  category_id?: string
  brand_id?: string
  search?: string
}): Promise<Product[]> => {
  const res = await apiClient.get<Product[]>('/catalog/products', { params })
  return res.data
}

export const getProduct = async (id: string): Promise<Product> => {
  const res = await apiClient.get<Product>(`/catalog/products/${id}`)
  return res.data
}

export const getCategories = async (): Promise<Category[]> => {
  const res = await apiClient.get<Category[]>('/catalog/categories')
  return res.data
}

export const getBrands = async (): Promise<Brand[]> => {
  const res = await apiClient.get<Brand[]>('/catalog/brands')
  return res.data
}