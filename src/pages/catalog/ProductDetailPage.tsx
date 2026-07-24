import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { TopBar } from '../../components/TopBar'
import { BrandImageBackground } from '../../components/BrandImageBackground'
import { useCart } from '../../contexts/CartContext'
import { useAuth } from '../../contexts/AuthContext'
import { getProduct } from '../../api/catalog'
import { theme } from '../../theme'
import type { Product, ProductVariant } from '../../types'

const probeImage = (url: string): Promise<string | null> =>
  new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(url)
    img.onerror = () => resolve(null)
    img.src = url
  })

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
  const [galleryIndex, setGalleryIndex] = useState(0)
  const [validGallery, setValidGallery] = useState<string[] | null>(null)

  const backPath = user?.role === 'wholesale' ? '/wholesale' : '/catalog'

  // Galería por variante — hasta 4 imágenes con SKU_2/_3/_4, verificadas
  // antes de mostrarse para saber cuántas existen realmente (necesario
  // para decidir si se muestran flechas/puntos de navegación)
  useEffect(() => {
    let cancelled = false
    setGalleryIndex(0)
    setValidGallery(null)

    if (!selectedVariant) {
      setValidGallery(product?.image_url ? [product.image_url] : [])
      return
    }

    const sku = selectedVariant.sku
    const candidates = [1, 2, 3, 4].map((n) =>
      n === 1
        ? `https://rosadelima-assets.s3.amazonaws.com/productos/${sku}.webp`
        : `https://rosadelima-assets.s3.amazonaws.com/productos/${sku}_${n}.webp`
    )

    Promise.all(candidates.map(probeImage)).then((results) => {
      if (cancelled) return
      setValidGallery(results.filter((url): url is string => url !== null))
    })

    return () => { cancelled = true }
  }, [selectedVariant?.id, product?.id])

  useEffect(() => {
    if (!id) return
    const load = async () => {
      try {
        const data = await getProduct(id)
        setProduct(data)
        // Siempre seleccionar la primera variante activa — el stock no es
        // un campo confiable ni bloqueante (el sistema no controla stock)
        const activeOnes = data.variants?.filter((v) => v.active) || []
        setSelectedVariant(activeOnes[0] || null)
      } catch {
        navigate(backPath)
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

      <div style={{
        maxWidth: '480px',
        margin: '0 auto',
        padding: '16px',
        paddingBottom: (user?.role === 'client' || user?.role === 'wholesale') ? '90px' : '16px',
      }}>

        {/* Volver */}
        <button
          onClick={() => navigate(backPath)}
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

        {/* Imagen grande con galería por variante */}
        <div style={{ marginBottom: '12px' }}>
          <BrandImageBackground
            brandName={product.brand_name}
            style={{
              height: '280px',
              borderRadius: '16px',
              border: `1px solid ${theme.semantic.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              padding: '12px',
              boxSizing: 'border-box',
            }}
          >
            {validGallery === null ? (
              <span style={{ fontSize: '13px', color: theme.semantic.textMuted, position: 'relative' }}>
                Cargando imagen...
              </span>
            ) : validGallery.length > 0 ? (
              <img
                src={validGallery[galleryIndex]}
                alt={product.name}
                loading="lazy"
                style={{ width: '100%', height: '100%', objectFit: 'contain', position: 'relative' }}
              />
            ) : (
              <span style={{ fontSize: '80px', position: 'relative' }}>🌸</span>
            )}

            {validGallery && validGallery.length > 1 && (
              <>
                <button
                  onClick={() => setGalleryIndex((i) => (i - 1 + validGallery.length) % validGallery.length)}
                  aria-label="Imagen anterior"
                  style={{
                    position: 'absolute',
                    left: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    border: 'none',
                    background: 'rgba(255,255,255,0.85)',
                    color: theme.semantic.textPrimary,
                    fontSize: '18px',
                    lineHeight: 1,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
                  }}
                >
                  ‹
                </button>
                <button
                  onClick={() => setGalleryIndex((i) => (i + 1) % validGallery.length)}
                  aria-label="Imagen siguiente"
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    border: 'none',
                    background: 'rgba(255,255,255,0.85)',
                    color: theme.semantic.textPrimary,
                    fontSize: '18px',
                    lineHeight: 1,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
                  }}
                >
                  ›
                </button>
              </>
            )}
          </BrandImageBackground>

          {validGallery && validGallery.length > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '8px' }}>
              {validGallery.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setGalleryIndex(i)}
                  aria-label={`Ir a imagen ${i + 1}`}
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    background: i === galleryIndex ? theme.semantic.actionPrimary : theme.semantic.border,
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>

          {/* Descripción */}
          {product.description && (
            <p style={{
              fontSize: '13px',
              color: theme.semantic.textSecondary,
              margin: '0 0 8px',
              lineHeight: 1.5,
              textAlign: 'center',
            }}>
              {product.description}
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

          {/* Modo de uso */}
          {product.modo_de_uso && (
            <div style={{ marginBottom: '16px' }}>
              <p style={{
                fontSize: '13px',
                fontWeight: 500,
                color: theme.semantic.textSecondary,
                margin: '0 0 6px',
              }}>
                Modo de uso
              </p>
              <p style={{
                fontSize: '13px',
                color: theme.semantic.textSecondary,
                margin: 0,
                lineHeight: 1.5,
              }}>
                {product.modo_de_uso}
              </p>
            </div>
          )}

          {/* Beneficios */}
          {product.beneficios && (
            <div style={{ marginBottom: '16px' }}>
              <p style={{
                fontSize: '13px',
                fontWeight: 500,
                color: theme.semantic.textSecondary,
                margin: '0 0 6px',
              }}>
                Beneficios
              </p>
              <p style={{
                fontSize: '13px',
                color: theme.semantic.textSecondary,
                margin: 0,
                lineHeight: 1.5,
              }}>
                {product.beneficios}
              </p>
            </div>
          )}

          {/* Ingredientes */}
          {product.ingredientes && (
            <div style={{ marginBottom: '16px' }}>
              <p style={{
                fontSize: '13px',
                fontWeight: 500,
                color: theme.semantic.textSecondary,
                margin: '0 0 6px',
              }}>
                Ingredientes
              </p>
              <p style={{
                fontSize: '13px',
                color: theme.semantic.textSecondary,
                margin: 0,
                lineHeight: 1.5,
              }}>
                {product.ingredientes}
              </p>
            </div>
          )}

          {/* Atributos */}
          {product.atributos && Object.keys(product.atributos).length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <p style={{
                fontSize: '13px',
                fontWeight: 500,
                color: theme.semantic.textSecondary,
                margin: '0 0 6px',
              }}>
                Detalles
              </p>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                border: `1px solid ${theme.semantic.border}`,
                borderRadius: '10px',
                padding: '10px 14px',
              }}>
                {Object.entries(product.atributos).map(([key, value]) => (
                  <div
                    key={key}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '13px',
                    }}
                  >
                    <span style={{ color: theme.semantic.textMuted }}>{key}</span>
                    <span style={{ color: theme.semantic.textPrimary, fontWeight: 500 }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

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
          {selectedVariant && (user?.role === 'client' || user?.role === 'wholesale') && (
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


        </div>
      </div>

      {/* Botón agregar — fijo, siempre visible sin necesidad de scrollear */}
      {(user?.role === 'client' || user?.role === 'wholesale') && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: theme.semantic.bgCard,
          borderTop: `1px solid ${theme.semantic.border}`,
          padding: '12px 16px',
          zIndex: 50,
        }}>
          <div style={{ maxWidth: '480px', margin: '0 auto' }}>
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
          </div>
        </div>
      )}
    </div>
  )
}