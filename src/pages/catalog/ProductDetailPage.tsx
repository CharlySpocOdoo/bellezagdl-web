import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { TopBar } from '../../components/TopBar'
import { useCart } from '../../contexts/CartContext'
import { useAuth } from '../../contexts/AuthContext'
import { getProduct } from '../../api/catalog'
import { theme } from '../../theme'
import type { Product, ProductVariant } from '../../types'

export function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const { user } = useAuth()

  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    if (!id) return
    const load = async () => {
      try {
        const data = await getProduct(id)
        setProduct(data)
        const activeOnes = data.variants?.filter((v) => v.active) || []
        const firstAvailable = activeOnes.find(
          (v) => (v.stock_qty + v.returned_stock_qty) > 0
        )
        // Si solo hay una variante activa, seleccionarla automáticamente
        const autoSelect = activeOnes.length === 1 ? activeOnes[0] : firstAvailable || null
        setSelectedVariant(autoSelect)
      } catch {
        navigate('/catalog')
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [id])

  const handleAddToCart = () => {
    if (!product || !selectedVariant) return
    addItem({
      variant_id: selectedVariant.id,
      product_name: product.name,
      variant_name: selectedVariant.variant_name,
      unit_price: Number(product.display_price),
      quantity,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }
  
  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: theme.semantic.bgPage }}>
        <TopBar />
        <div style={{ textAlign: 'center', padding: '48px', color: theme.semantic.textMuted }}>
          Cargando producto...
        </div>
      </div>
    )
  }

  if (!product) return null

  const activeVariants = product.variants?.filter((v) => v.active) || []

  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF' }}>
      <TopBar />

      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '16px' }}>

        {/* Volver */}
        <button
          onClick={() => navigate('/catalog')}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: theme.semantic.textMuted,
            fontSize: '14px',
            padding: '0 0 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          ← Volver al catálogo
        </button>

        {/* Nombre arriba */}
        <h1 style={{
          fontSize: '20px',
          fontWeight: 600,
          color: theme.semantic.textPrimary,
          margin: '0 0 10px',
          lineHeight: 1.3,
          textAlign: 'center',
        }}>
          {product.name}
        </h1>

        {/* Imagen grande */}
        <div style={{
          height: '280px',
          background: '#FFFFFF',
          borderRadius: '16px',
          border: `1px solid ${theme.semantic.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          padding: '12px',
          boxSizing: 'border-box',
          marginBottom: '12px',
        }}>
          {(selectedVariant?.image_url || product.image_url) ? (
            <img
              src={selectedVariant?.image_url || product.image_url || undefined}
              alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          ) : (
            <span style={{ fontSize: '80px' }}>🌸</span>
          )}
        </div>

        {/* Info */}
        <div>

          {/* Descripción */}
          {(product as any).description && (
            <p style={{
              fontSize: '13px',
              color: theme.semantic.textSecondary,
              margin: '0 0 8px',
              lineHeight: 1.5,
              textAlign: 'center',
            }}>
              {(product as any).description}
            </p>
          )}

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px', justifyContent: 'center', }}>
              {product.tags.map((tag) => (
                <span key={tag} style={{
                  fontSize: '11px',
                  background: theme.colors.primary[50],
                  color: theme.colors.primary[800],
                  padding: '2px 8px',
                  borderRadius: '20px',
                }}>
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Precio */}
          <p style={{
            fontSize: '28px',
            fontWeight: 600,
            color: theme.semantic.actionPrimary,
            margin: '0 0 16px',
            textAlign: 'center',
          }}>
            ${Number(product.display_price).toFixed(2)}
          </p>

          {/* Variantes */}
          {activeVariants.length > 0 && activeVariants.some(v => v.variant_name) && (
            <div style={{ marginBottom: '20px' }}>
              <p style={{
                fontSize: '13px',
                fontWeight: 500,
                color: theme.semantic.textSecondary,
                margin: '0 0 8px',
              }}>
                Presentación
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {activeVariants.map((variant) => {
                  const isSelected = selectedVariant?.id === variant.id
                  return (
                      <button
                        key={variant.id}
                        onClick={() => setSelectedVariant(variant)}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '20px',
                          fontSize: '13px',
                          cursor: 'pointer',
                          border: `1.5px solid ${isSelected ? theme.semantic.actionPrimary : theme.semantic.border}`,
                          background: isSelected ? theme.semantic.actionPrimaryLight : 'transparent',
                          color: isSelected ? theme.semantic.actionPrimary : theme.semantic.textPrimary,
                          fontWeight: isSelected ? 500 : 400,
                        }}
                      >
                        {variant.variant_name}
                      </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Cantidad */}
          {selectedVariant && user?.role === 'client' && (
            <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <p style={{
                fontSize: '13px',
                fontWeight: 500,
                color: theme.semantic.textSecondary,
                margin: '0 0 8px',
              }}>
                Cantidad
              </p>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                border: `1.5px solid ${theme.semantic.border}`,
                borderRadius: '10px',
                overflow: 'hidden',
              }}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{
                    background: theme.semantic.bgPage,
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '20px',
                    color: theme.semantic.textSecondary,
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  −
                </button>
                <span style={{
                  fontSize: '16px',
                  fontWeight: 500,
                  color: theme.semantic.textPrimary,
                  minWidth: '40px',
                  textAlign: 'center',
                  borderLeft: `1px solid ${theme.semantic.border}`,
                  borderRight: `1px solid ${theme.semantic.border}`,
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  style={{
                    background: theme.semantic.bgPage,
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '20px',
                    color: theme.semantic.textSecondary,
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  +
                </button>
              </div>
            </div>
          )}


          {/* Botón agregar */}
          <div style={{ borderTop: `1px solid ${theme.semantic.border}`, marginBottom: '16px' }} />
          {user?.role === 'client' && (
            <button
              onClick={handleAddToCart}
              disabled={!selectedVariant}
              style={{
                width: '100%',
                padding: '14px',
                background: added
                  ? theme.semantic.statusDone
                  : selectedVariant
                    ? theme.colors.secondary[800]
                    : theme.semantic.border,
                color: added
                  ? theme.semantic.statusDoneText
                  : selectedVariant
                    ? 'white'
                    : theme.semantic.textMuted,
                border: 'none',
                borderRadius: '10px',
                fontSize: '15px',
                fontWeight: 500,
                cursor: selectedVariant ? 'pointer' : 'not-allowed',
                transition: 'background 0.2s',
              }}
            >
              {added ? '¡Agregado al carrito! ✓' : 'Agregar al carrito'}
            </button>
          )}

        </div>
      </div>
    </div>
  )



}