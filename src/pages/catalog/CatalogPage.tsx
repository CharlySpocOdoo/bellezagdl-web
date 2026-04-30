import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { TopBar } from '../../components/TopBar'
import { CartDrawer } from '../../components/CartDrawer'
import { useCart } from '../../contexts/CartContext'
import { useAuth } from '../../contexts/AuthContext'
import { getProducts, getCategories, getBrands } from '../../api/catalog'
import { createOrder } from '../../api/orders'
import { theme } from '../../theme'
import type { Product, Category, Brand } from '../../types'

export function CatalogPage() {
  const navigate = useNavigate()
  const { itemCount, clearCart, items } = useCart()
  const { user } = useAuth()

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])

  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedBrand, setSelectedBrand] = useState('')

  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isOrdering, setIsOrdering] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [orderError, setOrderError] = useState('')

  useEffect(() => {
    const loadData = async () => {
      try {
        const [prods, cats, brds] = await Promise.all([
          getProducts(),
          getCategories(),
          getBrands(),
        ])
        setProducts(prods)
        setCategories(cats)
        setBrands(brds)
      } catch (err) {
        console.error('Error cargando catálogo:', err)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  // Filtrar productos
  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchCat = selectedCategory ? p.category_id === selectedCategory : true
    const matchBrand = selectedBrand ? p.brand_id === selectedBrand : true
    return matchSearch && matchCat && matchBrand
  })

  const handleCheckout = async () => {
    setIsOrdering(true)
    setOrderError('')
    try {
      await createOrder(items)
      clearCart()
      setIsCartOpen(false)
      setOrderSuccess(true)
      setTimeout(() => {
        setOrderSuccess(false)
        navigate('/orders')
      }, 2000)

    } catch (err: any) {
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail
        if (typeof detail === 'string') {
          setOrderError(detail)
        } else if (Array.isArray(detail)) {
          setOrderError('Error al crear el pedido. Verifica los productos seleccionados.')
        }
      } else {
        setOrderError('No se pudo crear el pedido. Intenta de nuevo.')
      }
    } finally {
      setIsOrdering(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: theme.semantic.bgPage }}>
      <TopBar />

      {/* Banner de pedido exitoso */}
      {orderSuccess && (
        <div style={{
          background: theme.semantic.statusDone,
          color: theme.semantic.statusDoneText,
          padding: '12px 24px',
          textAlign: 'center',
          fontSize: '14px',
          fontWeight: 500,
        }}>
          ¡Pedido creado exitosamente! Redirigiendo a tus pedidos...
        </div>
      )}

      {/* Banner de error en pedido */}
      {orderError && (
        <div style={{
          background: theme.semantic.statusAlert,
          color: theme.semantic.statusAlertText,
          padding: '12px 24px',
          textAlign: 'center',
          fontSize: '14px',
        }}>
          {orderError}
        </div>
      )}

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '24px 16px',
      }}>

        {/* Header con título y carrito */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <h1 style={{
            fontSize: '22px',
            fontWeight: 500,
            color: theme.semantic.textPrimary,
            margin: 0,
          }}>
            Catálogo
          </h1>

          {/* Botón carrito */}
          {user?.role === 'client' && (
            <button
              onClick={() => setIsCartOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                background: itemCount > 0 ? theme.semantic.actionPrimary : 'transparent',
                color: itemCount > 0 ? theme.semantic.textOnPrimary : theme.semantic.textSecondary,
                border: `1px solid ${itemCount > 0 ? theme.semantic.actionPrimary : theme.semantic.border}`,
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500,
                transition: 'all 0.15s',
              }}
            >
              🛍️ Carrito
              {itemCount > 0 && (
                <span style={{
                  background: 'rgba(255,255,255,0.3)',
                  borderRadius: '12px',
                  padding: '2px 8px',
                  fontSize: '12px',
                }}>
                  {itemCount}
                </span>
              )}
            </button>
          )}
        </div>

        {/* Filtros */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          marginBottom: '24px',
        }}>
          {/* Búsqueda */}
          <input
            type="text"
            placeholder="Buscar producto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: '10px 14px',
              fontSize: '14px',
              border: `1px solid ${theme.semantic.border}`,
              borderRadius: '8px',
              background: theme.semantic.bgCard,
              color: theme.semantic.textPrimary,
              outline: 'none',
            }}
          />

          {/* Categoría */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              padding: '10px 14px',
              fontSize: '14px',
              border: `1px solid ${theme.semantic.border}`,
              borderRadius: '8px',
              background: theme.semantic.bgCard,
              color: selectedCategory ? theme.semantic.textPrimary : theme.semantic.textMuted,
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="">Todas las categorías</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          {/* Marca */}
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            style={{
              padding: '10px 14px',
              fontSize: '14px',
              border: `1px solid ${theme.semantic.border}`,
              borderRadius: '8px',
              background: theme.semantic.bgCard,
              color: selectedBrand ? theme.semantic.textPrimary : theme.semantic.textMuted,
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="">Todas las marcas</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>{brand.name}</option>
            ))}
          </select>
        </div>

        {/* Estado de carga */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '48px', color: theme.semantic.textMuted }}>
            Cargando productos...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔍</div>
            <p style={{ color: theme.semantic.textMuted }}>
              No se encontraron productos con esos filtros
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '16px',
          }}>
            {filtered.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => navigate(`/catalog/${product.id}`)}
              />
            ))}
          </div>
        )}

      </div>

      {/* Carrito */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={handleCheckout}
      />

      {/* Overlay de procesando pedido */}
      {isOrdering && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
        }}>
          <div style={{
            background: theme.semantic.bgCard,
            borderRadius: '16px',
            padding: '32px',
            textAlign: 'center',
          }}>
            <p style={{ color: theme.semantic.textPrimary, fontSize: '16px', margin: 0 }}>
              Creando pedido...
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Tarjeta de producto ──────────────────────────────────────────────────────

function ProductCard({ product, onClick }: { product: Product; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: theme.semantic.bgCard,
        borderRadius: '12px',
        border: `1px solid ${theme.semantic.border}`,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'transform 0.15s, box-shadow 0.15s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {/* Imagen */}
      <div style={{
        height: '180px',
        background: theme.colors.primary[50],
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}>
	{product.image_url ? (
  	  <img
    	    src={product.image_url}
    	    alt={product.name}
    	    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
  	  />
	) : (
  	  <span style={{ fontSize: '40px' }}>🌸</span>
	)}
      </div>

      {/* Info */}
      <div style={{ padding: '14px' }}>
        <p style={{
          fontSize: '14px',
          fontWeight: 500,
          color: theme.semantic.textPrimary,
          margin: '0 0 4px',
          lineHeight: 1.3,
        }}>
          {product.name}
        </p>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '8px',
        }}>
          <span style={{
            fontSize: '16px',
            fontWeight: 500,
            color: theme.semantic.actionPrimary,
          }}>
            ${Number(product.display_price)?.toFixed(2)}
          </span>

        </div>
      </div>
    </div>
  )
}
