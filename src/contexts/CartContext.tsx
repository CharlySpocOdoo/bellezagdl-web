import { createContext, useContext, useState } from 'react'
import type { CartItem } from '../types'

interface CartContextType {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (variant_id: string) => void
  updateQuantity: (variant_id: string, quantity: number) => void
  clearCart: () => void
  total: number
  itemCount: number
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  const addItem = (newItem: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.variant_id === newItem.variant_id)
      if (existing) {
        return prev.map((i) =>
          i.variant_id === newItem.variant_id
            ? { ...i, quantity: i.quantity + newItem.quantity }
            : i
        )
      }
      return [...prev, newItem]
    })
  }

  const removeItem = (variant_id: string) => {
    setItems((prev) => prev.filter((i) => i.variant_id !== variant_id))
  }

  const updateQuantity = (variant_id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(variant_id)
      return
    }
    setItems((prev) =>
      prev.map((i) => (i.variant_id === variant_id ? { ...i, quantity } : i))
    )
  }

  const clearCart = () => setItems([])

  const total = items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0)
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <CartContext.Provider value={{
      items, addItem, removeItem, updateQuantity, clearCart, total, itemCount
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart debe usarse dentro de CartProvider')
  return context
}