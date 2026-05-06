import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/v1'

export async function getVitrina(brandSlug: string) {
  const res = await axios.get(`${baseURL}/public/vitrina/${brandSlug}`)
  return res.data
}

export async function getVitrinaProduct(brandSlug: string, productId: string) {
  const res = await axios.get(`${baseURL}/public/vitrina/${brandSlug}/products/${productId}`)
  return res.data
}