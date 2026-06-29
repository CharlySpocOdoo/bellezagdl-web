import { createContext, useContext, useState, useRef, useEffect } from 'react'
import type { Product, Category, Brand } from '../types'
import { getProducts, getCategories, getBrands } from '../api/catalog'
import { useAuth } from './AuthContext'

interface CatalogContextType {
  products: Product[]
  categories: Category[]
  brands: Brand[]
  isLoading: boolean
  scrollPosition: number
  setScrollPosition: (pos: number) => void
  loadIfEmpty: (role: string) => Promise<void>
}

const CatalogContext = createContext<CatalogContextType | null>(null)

export function CatalogProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [scrollPosition, setScrollPosition] = useState(0)
  const loadedRef = useRef(false)
  const { user } = useAuth()

  // Limpiar catálogo al cerrar sesión — evita que el próximo usuario
  // vea precios calculados para el rol anterior
  useEffect(() => {
    if (!user) {
      loadedRef.current = false
      setProducts([])
      setCategories([])
      setBrands([])
    }
  }, [user])

  const loadIfEmpty = async (role: string) => {
    if (loadedRef.current) return
    loadedRef.current = true
    setIsLoading(true)
    try {
      const prods = await getProducts()
      setProducts(prods)

      if (role === 'oferta') {
        const uniqueBrands = Array.from(
          new Map(prods.map(p => [p.brand_id, { id: p.brand_id, name: p.brand_name || '', active: true }])).values()
        )
        setBrands(uniqueBrands)
        const uniqueCategories = Array.from(
          new Map(prods.map(p => [p.category_id, { id: p.category_id, name: p.category_name || '', slug: '', children: [] }])).values()
        )
        setCategories(uniqueCategories)
      } else {
        const [cats, brds] = await Promise.all([getCategories(), getBrands()])
        setCategories(cats)
        setBrands(brds)
      }
    } catch (err) {
      console.error('Error cargando catálogo:', err)
      loadedRef.current = false
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <CatalogContext.Provider value={{
      products, categories, brands, isLoading,
      scrollPosition, setScrollPosition, loadIfEmpty,
    }}>
      {children}
    </CatalogContext.Provider>
  )
}

export function useCatalog() {
  const context = useContext(CatalogContext)
  if (!context) throw new Error('useCatalog debe usarse dentro de CatalogProvider')
  return context
}