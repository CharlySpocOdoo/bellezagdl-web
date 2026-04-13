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
        const firstAvailable = data.variants?.find(
          (v) => v.active && (v.stock_qty + v.returned_stock_qty) > 0
        )
        setSelectedVariant(firstAvailable || null)
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

  const primaryImage = product?.images?.find((img) => img.is_primary) || product?.images?.[0]
  const variantStock = selectedVariant
    ? selectedVariant.stock_qty + selectedVariant.returned_stock_qty
    : 0

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

  return (
    <div style={{ minHeight: '100vh', background: theme.semantic.bgPage }}>
      <TopBar />
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px 16px' }}>
        <button
          onClick={() => navigate('/catalog')}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: theme.semantic.textMuted,
            fontSize: '14px',
            padding: '0 0 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          ← Volver al catálogo
        </button>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '32px',
          background: theme.semantic.bgCard,
          borderRadius: '16px',
          border: '1px solid ' + theme.semantic.border,
          overflow: 'hidden',
        }}>
          <div style={{
            background: theme.colors.primary[50],
            minHeight: '300px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {primaryImage ? (
              <img
                src={primaryImage.url}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <span style={{ fontSize: '80px' }}>🌸</span>
            )}
          </div>

          <div style={{ padding: '28px 24px' }}>
            <h1 style={{
              fontSize: '22px',
              fontWeight: 500,
              color: theme.semantic.textPrimary,
              margin: '0 0 8px',
              lineHeight: 1.3,
            }}>
              {product.name}
            </h1>

            <p style={{
              fontSize: '28px',
              fontWeight: 500,
              color: theme.semantic.actionPrimary,
              margin: '0 0 24px',
            }}>
              ${Number(product.display_price).toFixed(2)}
            </p>

            {product.variants && product.variants.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <p style={{
                  fontSize: '13px',
                  fontWeight: 500,
                  color: theme.semantic.textSecondary,
                  margin: '0 0 8px',
                }}>
                  Presentación
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {product.variants.filter((v) => v.active).map((variant) => {
                    const stock = variant.stock_qty + variant.returned_stock_qty
                    const isSelected = selectedVariant?.id === variant.id
                    const hasStock = stock > 0
                    return (
                      <button
                        key={variant.id}
                        onClick={() => { if (hasStock) setSelectedVariant(variant) }}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '8px',
                          fontSize: '13px',
                          cursor: hasStock ? 'pointer' : 'not-allowed',
                          border: '1px solid ' + (isSelected ? theme.semantic.actionPrimary : theme.semantic.border),
                          background: isSelected ? theme.semantic.actionPrimaryLight : 'transparent',
                          color: isSelected ? theme.semantic.actionPrimary : hasStock ? theme.semantic.textPrimary : theme.semantic.textMuted,
                          opacity: hasStock ? 1 : 0.5,
                        }}
                      >
                        {variant.variant_name}{!hasStock && ' (agotado)'}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {selectedVariant && (
              <div style={{ marginBottom: '24px' }}>
                <p style={{
                  fontSize: '13px',
                  fontWeight: 500,
                  color: theme.semantic.textSecondary,
                  margin: '0 0 8px',
                }}>
                  Cantidad
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    background: theme.colors.neutral[50],
                    borderRadius: '8px',
                    padding: '6px 12px',
                  }}>
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px', color: theme.semantic.textSecondary, lineHeight: 1 }}
                    >
                      −
                    </button>
                    <span style={{ fontSize: '16px', fontWeight: 500, color: theme.semantic.textPrimary, minWidth: '24px', textAlign: 'center' }}>
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(variantStock, quantity + 1))}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px', color: theme.semantic.textSecondary, lineHeight: 1 }}
                    >
                      +
                    </button>
                  </div>
                  <span style={{ fontSize: '12px', color: theme.semantic.textMuted }}>
                    {variantStock} disponibles
                  </span>
                </div>
              </div>
            )}

            {user?.role !== 'admin' && (
              <button
                onClick={handleAddToCart}
                disabled={!selectedVariant || variantStock === 0}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: added ? theme.semantic.statusDone : theme.semantic.actionPrimary,
                  color: added ? theme.semantic.statusDoneText : theme.semantic.textOnPrimary,
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: 500,
                  cursor: selectedVariant ? 'pointer' : 'not-allowed',
                  opacity: selectedVariant ? 1 : 0.6,
                  transition: 'background 0.2s',
                }}
              >
                {added ? '¡Agregado al carrito!' : 'Agregar al carrito'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
