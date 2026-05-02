import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
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
  const location = useLocation()
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

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px' }}>

        {/* Buscador con X */}
        <div style={{ position: 'relative', marginBottom: '10px' }}>
          <span style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '15px',
            pointerEvents: 'none',
          }}>🔍</span>
          <input
            type="text"
            placeholder="Buscar producto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 38px 10px 38px',
              fontSize: '16px',
              border: `1.5px solid ${theme.semantic.border}`,
              borderRadius: '10px',
              background: theme.semantic.bgCard,
              color: theme.semantic.textPrimary,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          {search.length > 0 && (
            <button
              onClick={() => setSearch('')}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: theme.semantic.textMuted,
                border: 'none',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                padding: 0,
                flexShrink: 0,
              }}
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <line x1="1" y1="1" x2="9" y2="9" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
                <line x1="9" y1="1" x2="1" y2="9" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </button>
          )}
        </div>

        {/* Nav + Carrito */}
        {user?.role === 'client' && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '10px',
          }}>
            {[
              { label: 'Catálogo', path: '/catalog' },
              { label: 'Mis pedidos', path: '/orders' },
            ].map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  padding: '7px 16px',
                  fontSize: '13px',
                  fontWeight: location.pathname.startsWith(item.path) ? 600 : 400,
                  background: location.pathname.startsWith(item.path) ? theme.colors.secondary[800] : 'transparent',
                  color: location.pathname.startsWith(item.path) ? 'white' : theme.semantic.textSecondary,
                  border: `1.5px solid ${location.pathname.startsWith(item.path) ? theme.colors.secondary[800] : theme.semantic.border}`,
                  borderRadius: '20px',
                  cursor: 'pointer',
                }}
              >
                {item.label}
              </button>
            ))}

            {/* Carrito al extremo derecho */}
            <button
              onClick={() => setIsCartOpen(true)}
              style={{
                marginLeft: 'auto',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                background: itemCount > 0 ? theme.colors.secondary[800] : 'transparent',
                color: itemCount > 0 ? 'white' : theme.semantic.textSecondary,
                border: `1.5px solid ${itemCount > 0 ? theme.colors.secondary[800] : theme.semantic.border}`,
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 500,
              }}
            >
              🛍️ Carrito
              {itemCount > 0 && (
                <span style={{
                  background: theme.semantic.actionPrimary,
                  color: 'white',
                  borderRadius: '10px',
                  minWidth: '16px',
                  height: '16px',
                  fontSize: '10px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 4px',
                }}>
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        )}

        {/* Filtros Marcas + Categorías */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '10px',
          marginBottom: '16px',
        }}>
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            style={{
              padding: '9px 10px',
              fontSize: '13px',
              border: `1.5px solid ${theme.semantic.border}`,
              borderRadius: '10px',
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

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              padding: '9px 10px',
              fontSize: '13px',
              border: `1.5px solid ${theme.semantic.border}`,
              borderRadius: '10px',
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
        </div>

        {/* Contador */}
        <p style={{
          fontSize: '13px',
          fontWeight: 500,
          color: theme.colors.secondary[800],
          margin: '0 0 12px',
        }}>
          {isLoading ? 'Cargando...' : `${filtered.length} producto${filtered.length !== 1 ? 's' : ''}`}
        </p>

        {/* Grid productos */}
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
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px',
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

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={handleCheckout}
      />

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

function ProductCard({ product, onClick }: { product: Product; onClick: () => void }) {
  
  return (
<div
      onClick={onClick}
      style={{
        background: '#FFFFFF',
        borderRadius: '12px',
        border: `1px solid ${theme.semantic.border}`,
        overflow: 'hidden',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(30,58,95,0.10)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {/* Nombre arriba centrado */}
      <div style={{
        padding: '10px 10px 6px',
        borderBottom: `0.5px solid ${theme.semantic.border}`,
      }}>
        <p style={{
          fontSize: '12px',
          fontWeight: 500,
          color: theme.semantic.textPrimary,
          margin: 0,
          lineHeight: 1.35,
          textAlign: 'center',
        }}>
          {product.name}
        </p>
      </div>

      {/* Imagen con badge de marca */}
      <div style={{
        height: '120px',
        background: '#F9F5F7',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        padding: '8px',
        boxSizing: 'border-box',
        position: 'relative',
        flexShrink: 0,
      }}>
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        ) : (
          <span style={{ fontSize: '32px' }}>🌸</span>
        )}
        {product.brand_name && (
          <span style={{
            position: 'absolute',
            top: '7px',
            left: '7px',
            background: theme.colors.secondary[800],
            color: 'white',
            fontSize: '10px',
            padding: '2px 7px',
            borderRadius: '20px',
            fontWeight: 500,
            letterSpacing: '0.3px',
          }}>
            {product.brand_name}
          </span>
        )}
      </div>

      {/* Cuerpo */}
      <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', flex: 1 }}>

        {/* Categoría */}
        {product.category_name && (
          <p style={{
            fontSize: '10px',
            color: theme.semantic.textMuted,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            margin: '0 0 4px',
          }}>
            {product.category_name}
          </p>
        )}

        {/* Descripción */}
        {product.description && (
          <p style={{
            fontSize: '11px',
            color: theme.semantic.textSecondary,
            margin: '0 0 6px',
            lineHeight: 1.4,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}>
            {product.description}
          </p>
        )}

        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '6px' }}>
            {product.tags.slice(0, 2).map((tag) => (
              <span key={tag} style={{
                fontSize: '10px',
                background: theme.colors.primary[50],
                color: theme.colors.primary[800],
                padding: '2px 6px',
                borderRadius: '20px',
              }}>
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer: precio + variantes */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: `0.5px solid ${theme.semantic.border}`,
          paddingTop: '8px',
          marginTop: 'auto',
        }}>
          <span style={{
            fontSize: '14px',
            fontWeight: 600,
            color: theme.semantic.actionPrimary,
          }}>
            ${Number(product.display_price)?.toFixed(2)}
          </span>
          {(product.variants?.length ?? 0) > 1 && (
            <span style={{
              fontSize: '10px',
              color: theme.semantic.textMuted,
              background: theme.semantic.bgPage,
              padding: '2px 7px',
              borderRadius: '20px',
            }}>
              {product.variants.length} presentaciones
            </span>
          )}
        </div>

      </div>
    </div>




  )
}