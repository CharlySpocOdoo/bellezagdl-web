// ─── Auth ───────────────────────────────────────────────────────────────────

export interface LoginResponse {
  access_token: string
  refresh_token: string
  token_type: string
}

export interface User {
  id: string
  email: string
  role: 'admin' | 'vendor' | 'client'
  active: boolean
  profile_id: string | null
}

// ─── Vendor ─────────────────────────────────────────────────────────────────

export interface Vendor {
  id: string
  display_name: string
  first_name: string
  last_name: string
  phone: string
  address: string | null
  workplace: string | null
  invitation_link: string
  invitation_code: string
  commission_percentage: number
  active: boolean
  email: string
}

export interface Client {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  delivery_address: string
  active: boolean
}

// ─── Catalog ─────────────────────────────────────────────────────────────────

export interface Category {
  id: string
  name: string
  slug: string
  children: Category[]
}

export interface Brand {
  id: string
  name: string
  active: boolean
}

export interface ProductVariant {
  id: string
  sku: string
  variant_name: string
  stock_qty: number
  returned_stock_qty: number
  active: boolean
  image_url: string | null
}

export interface Product {
  id: string
  name: string
  slug: string
  category_id: string
  brand_id: string
  brand_name: string | null
  category_name: string | null
  display_price: number
  tags: string[]
  variants: ProductVariant[]
  images: ProductImage[]
  image_url: string | null
}

export interface ProductImage {
  id: string
  url: string
  thumb_url: string
  is_primary: boolean
}

// ─── Orders ──────────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'pending'
  | 'partially_available'
  | 'confirmed'
  | 'preparing'
  | 'in_delivery'
  | 'delivery_failed'
  | 'delivered_to_vendor'
  | 'delivered_to_client'
  | 'return_requested'
  | 'cancelled'

export interface OrderItem {
  id: string
  variant_id: string
  unit_price: number
  quantity: number
  subtotal: number
  product_name_snapshot: string | null
  variant_name_snapshot: string | null
  cancelled_in_partial: boolean
}

export interface Order {
  id: string
  order_number: string
  status: OrderStatus
  subtotal: number
  shipping_cost: number
  total: number
  created_at: string
  items: OrderItem[]
  vendor_notes: string | null
  client_name: string | null
  cancelled_at: string | null
}

// ─── Commissions ─────────────────────────────────────────────────────────────

export interface CommissionPeriod {
  id: string
  week_start: string
  week_end: string
  gross_sales_amount: number
  commission_base_amount: number
  commission_amount: number
  commission_rate: number
  shipping_charges: number
  net_commission: number
  status: 'pending' | 'paid'
  paid_at: string | null
}

// ─── Cart (local — sin tabla en BD) ──────────────────────────────────────────

export interface CartItem {
  variant_id: string
  product_name: string
  variant_name: string
  unit_price: number
  quantity: number
}