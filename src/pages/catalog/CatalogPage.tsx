import logoRosa from '../../assets/logorosa.png'
import { useState, useEffect } from 'react'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { TopBar } from '../../components/TopBar'
import { CartDrawer } from '../../components/CartDrawer'
import { BrandFilterTrigger } from '../../components/BrandFilterTrigger'
import { useCart } from '../../contexts/CartContext'
import { useAuth } from '../../contexts/AuthContext'
import { useCatalog } from '../../contexts/CatalogContext'
import { createOrder } from '../../api/orders'
import { theme } from '../../theme'
import type { Product } from '../../types'

export function CatalogPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { itemCount, clearCart, items } = useCart()
  const { user } = useAuth()

  const { products, categories, brands, isLoading, scrollPosition, setScrollPosition, loadIfEmpty } = useCatalog()

  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedBrand, setSelectedBrand] = useState('')

  const [isCartOpen, setIsCartOpen] = useState(false)

  const [isOrdering, setIsOrdering] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [orderError, setOrderError] = useState('')

useEffect(() => {
  if (user?.role) loadIfEmpty(user.role)
}, [user?.role])

useEffect(() => {
  const brandFromUrl = searchParams.get('brand')
  if (brandFromUrl !== null) setSelectedBrand(brandFromUrl)
}, [searchParams])

useEffect(() => {
  if (!isLoading && scrollPosition > 0) {
    window.scrollTo({ top: scrollPosition, behavior: 'instant' })
  }
}, [isLoading])

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchCat = selectedCategory ? p.category_id === selectedCategory : true
    const matchBrand = selectedBrand ? p.brand_id === selectedBrand : true
    return matchSearch && matchCat && matchBrand
  })

  const handleProductClick = (id: string) => {
  setScrollPosition(window.scrollY)
  navigate(`/catalog/${id}`)
  }
  
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

        {/* Buscador con logo / X */}
        <div style={{ position: 'relative', marginBottom: '10px' }}>
          <input
            type="text"
            placeholder="Buscar producto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 44px 10px 14px',
              fontSize: '16px',
              border: `1.5px solid ${theme.semantic.border}`,
              borderRadius: '10px',
              background: theme.semantic.bgCard,
              color: theme.semantic.textPrimary,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />

          {/* Logo o X al extremo derecho */}
          <div style={{
            position: 'absolute',
            right: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {search.length > 0 ? (
              <button
                onClick={() => setSearch('')}
                style={{
                  background: theme.semantic.textMuted,
                  border: 'none',
                  borderRadius: '50%',
                  width: '22px',
                  height: '22px',
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
            ) : (
              <img
                src={logoRosa}
                alt="Rosa de Lima"
                style={{ width: '30px', height: '30px', objectFit: 'contain' }}
              />
            )}
          </div>
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
          gridTemplateColumns: user?.role === 'oferta' ? '1fr' : '1fr 1fr',
          gap: '10px',
          marginBottom: '16px',
        }}>

          <BrandFilterTrigger
            brands={brands}
            selectedBrand={selectedBrand}
            onClick={() => navigate(`/catalog/marcas?brand=${selectedBrand}`)}
          />

          {user?.role !== 'oferta' && (
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
                width: '100%',
                boxSizing: 'border-box',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              <option value="">Todas las categorías</option>
              {categories.map((cat) => {
                const label = cat.name.includes(' / ') ? cat.name.split(' / ').slice(1).join(' / ') : cat.name
                return <option key={cat.id} value={cat.id}>{label}</option>
              })}
            </select>
          )}

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
                onClick={() => handleProductClick(product.id)}
              />
            ))}
          </div>
        )}
      </div>

      {user?.role === 'oferta' && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'white',
          borderTop: `1px solid ${theme.semantic.border}`,
          padding: '12px 16px',
          zIndex: 50,
        }}>
          <p style={{ textAlign: 'center', fontSize: '13px', fontWeight: 600, color: theme.semantic.textSecondary, margin: '0 0 8px' }}>
            Contacta a tu vendedor
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '5px', flexWrap: 'nowrap' }}>
            {[
              { name: 'Diana Larios', number: '523332507661' },
              { name: 'Judith Trujillo', number: '523334882895' },
              { name: 'Victor Corona', number: '523331794362' },
            ].map((contact) => (
              
              <a key={contact.number}
                href={`https://wa.me/${contact.number}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ background: '#25D366', color: 'white', padding: '7px 9px', borderRadius: '24px', fontSize: '10px', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                💬 {contact.name}
              </a>
            ))}
          </div>
        </div>
      )}

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
  const [failedPrimary, setFailedPrimary] = useState(false)
  const [failedFallback, setFailedFallback] = useState(false)

  const primarySrc = product.image_url
  const fallbackSrc = product.variants?.find(v => v.active)?.image_url || null

  const showPrimary = !!primarySrc && !failedPrimary
  const showFallback = !showPrimary && !!fallbackSrc && !failedFallback

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
          {product.sku_template && (
            <span style={{
              display: 'block',
              fontSize: '11px',
              color: theme.semantic.textMuted,
              margin: '2px 0 0',
            }}>
              SKU: {product.sku_template}
            </span>
          )}
          
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
        {showPrimary ? (
          <img
            src={primarySrc!}
            alt={product.name}
            loading="lazy"
            onError={() => setFailedPrimary(true)}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        ) : showFallback ? (
          <img
            src={fallbackSrc!}
            alt={product.name}
            loading="lazy"
            onError={() => setFailedFallback(true)}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        ) : (
          <span style={{ fontSize: '32px' }}>🌸</span>
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
          borderTop: `0.5px solid ${theme.semantic.border}`,
          paddingTop: '8px',
          marginTop: 'auto',
          textAlign: 'center',
        }}>
          {(product.variants?.length ?? 0) > 1 && (
            <span style={{
              fontSize: '10px',
              color: theme.semantic.textMuted,
              display: 'block',
              marginBottom: '2px',
            }}>
              {product.variants.length} variantes
            </span>
          )}
          <span style={{
            fontSize: '14px',
            fontWeight: 600,
            color: theme.semantic.actionPrimary,
          }}>
            ${Number(product.display_price)?.toFixed(2)}
          </span>
        </div>

      </div>
    </div>




  )
}