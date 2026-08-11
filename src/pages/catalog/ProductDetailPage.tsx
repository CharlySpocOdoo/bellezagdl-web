import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { TopBar } from '../../components/TopBar'
import { useCart } from '../../contexts/CartContext'
import { useAuth } from '../../contexts/AuthContext'
import { getProduct } from '../../api/catalog'
import { theme } from '../../theme'
import { stripBrandFromName } from '../../utils/productName'
import { stripDiacritics } from '../../utils/text'
import type { Product, ProductVariant } from '../../types'

const PROBE_TIMEOUT_MS = 6000

// Si onload/onerror nunca se disparan (URL que cuelga, CORS, archivo
// corrupto), el timeout resuelve como fallo — evita que Promise.all()
// se quede esperando para siempre y la galería nunca salga de "Cargando".
const probeImage = (url: string): Promise<string | null> =>
  new Promise((resolve) => {
    let settled = false
    const settle = (result: string | null) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      resolve(result)
    }
    const timer = setTimeout(() => settle(null), PROBE_TIMEOUT_MS)
    const img = new Image()
    img.onload = () => settle(url)
    img.onerror = () => settle(null)
    img.src = url
  })

export function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { addItem } = useCart()
  const { user } = useAuth()

  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const [galleryIndex, setGalleryIndex] = useState(0)
  const [validGallery, setValidGallery] = useState<string[] | null>(null)
  const [dragPx, setDragPx] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [pendingJump, setPendingJump] = useState<{ index: number; dir: 1 | -1 } | null>(null)
  const galleryRef = useRef<HTMLDivElement>(null)
  const dragStartX = useRef<number | null>(null)
  const lastDragPx = useRef(0)
  const galleryIndexRef = useRef(0)
  const pendingJumpRef = useRef<{ index: number; dir: 1 | -1 } | null>(null)
  const animationFallbackRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [variantScroll, setVariantScroll] = useState({ canLeft: false, canRight: false })
  const variantScrollRef = useRef<HTMLDivElement>(null)

  const brandFromUrl = searchParams.get('brand')
  const backPath = (user?.role === 'wholesale' ? '/wholesale' : '/catalog') + (brandFromUrl ? `?brand=${brandFromUrl}` : '')

  const SWIPE_THRESHOLD_RATIO = 0.35
  const ANIMATION_MS = 250

  // Arrastre en tiempo real (translateX 1:1 con el dedo, sin transición) —
  // al soltar, completeSwipe()/springBack() activan la transición y
  // animan hasta el destino. finishTransition() confirma el cambio de
  // índice al terminar — vía onTransitionEnd, con un setTimeout de
  // respaldo (mismo patrón que PROBE_TIMEOUT_MS) por si el evento no se
  // dispara (pestaña en segundo plano, navegador que lo omite, etc.).
  const handleGalleryTouchStart = (e: React.TouchEvent) => {
    if (!validGallery || validGallery.length <= 1 || isAnimating) return
    dragStartX.current = e.touches[0].clientX
  }

  const handleGalleryTouchMove = (e: React.TouchEvent) => {
    if (dragStartX.current === null) return
    const delta = e.touches[0].clientX - dragStartX.current
    lastDragPx.current = delta
    setDragPx(delta)
  }

  const scheduleAnimationFallback = () => {
    if (animationFallbackRef.current) clearTimeout(animationFallbackRef.current)
    animationFallbackRef.current = setTimeout(finishTransition, ANIMATION_MS + 100)
  }

  const finishTransition = () => {
    if (animationFallbackRef.current) {
      clearTimeout(animationFallbackRef.current)
      animationFallbackRef.current = null
    }
    setIsAnimating(false)
    const finalDrag = lastDragPx.current
    if (finalDrag !== 0 && validGallery) {
      const length = validGallery.length
      const pj = pendingJumpRef.current
      const newIndex = finalDrag < 0
        ? (pj ? pj.index : (galleryIndexRef.current + 1) % length)
        : (pj ? pj.index : (galleryIndexRef.current - 1 + length) % length)
      galleryIndexRef.current = newIndex
      setGalleryIndex(newIndex)
      pendingJumpRef.current = null
      setPendingJump(null)
    }
    lastDragPx.current = 0
    setDragPx(0)
  }

  const completeSwipe = (dir: 1 | -1) => {
    const width = galleryRef.current?.clientWidth || 1
    const target = dir === 1 ? -width : width
    lastDragPx.current = target
    setIsAnimating(true)
    setDragPx(target)
    scheduleAnimationFallback()
  }

  const springBack = () => {
    lastDragPx.current = 0
    setIsAnimating(true)
    setDragPx(0)
    scheduleAnimationFallback()
  }

  const handleGalleryTouchEnd = () => {
    if (dragStartX.current === null || !validGallery) return
    dragStartX.current = null
    const finalDrag = lastDragPx.current
    const width = galleryRef.current?.clientWidth || 1
    if (Math.abs(finalDrag) >= width * SWIPE_THRESHOLD_RATIO) {
      completeSwipe(finalDrag < 0 ? 1 : -1)
    } else {
      springBack()
    }
  }

  const handleTrackTransitionEnd = (e: React.TransitionEvent) => {
    if (e.propertyName !== 'transform') return
    finishTransition()
  }

  // Usado por flechas y puntos — misma animación de slide que el swipe.
  // Si el destino no es el vecino inmediato (ej. saltar del punto 1 al 4),
  // ese vecino se sustituye temporalmente por la imagen destino para que
  // la franja anime en la dirección correcta hacia ella.
  const goToIndex = (targetIndex: number) => {
    if (!validGallery || isAnimating || targetIndex === galleryIndex) return
    const length = validGallery.length
    const nextIndex = (galleryIndex + 1) % length
    const prevIndex = (galleryIndex - 1 + length) % length
    const width = galleryRef.current?.clientWidth || 1
    if (targetIndex !== nextIndex && targetIndex !== prevIndex) {
      const pj = { index: targetIndex, dir: (targetIndex > galleryIndex ? 1 : -1) as 1 | -1 }
      pendingJumpRef.current = pj
      setPendingJump(pj)
    }
    const target = targetIndex === prevIndex ? width : -width
    lastDragPx.current = target
    setIsAnimating(true)
    setDragPx(target)
    scheduleAnimationFallback()
  }

  const updateVariantScrollState = () => {
    const el = variantScrollRef.current
    if (!el) return
    setVariantScroll({
      canLeft: el.scrollLeft > 0,
      canRight: el.scrollLeft + el.clientWidth < el.scrollWidth - 1,
    })
  }

  // Galería por variante — hasta 5 imágenes con SKU_2/_3/_4/_5, verificadas
  // antes de mostrarse para saber cuántas existen realmente (necesario
  // para decidir si se muestran flechas/puntos de navegación)
  useEffect(() => {
    let cancelled = false
    if (animationFallbackRef.current) {
      clearTimeout(animationFallbackRef.current)
      animationFallbackRef.current = null
    }
    galleryIndexRef.current = 0
    pendingJumpRef.current = null
    lastDragPx.current = 0
    setGalleryIndex(0)
    setValidGallery(null)
    setDragPx(0)
    setIsAnimating(false)
    setPendingJump(null)

    if (!selectedVariant || !product?.brand_name) {
      setValidGallery(product?.image_url ? [product.image_url] : [])
      return
    }

    const sku = selectedVariant.sku
    const brandFolder = encodeURIComponent(stripDiacritics(product.brand_name))
    const candidates = [1, 2, 3, 4, 5].map((n) =>
      n === 1
        ? `https://rosadelima-assets.s3.amazonaws.com/productos/${brandFolder}/${sku}.webp`
        : `https://rosadelima-assets.s3.amazonaws.com/productos/${brandFolder}/${sku}_${n}.webp`
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

  // Estado inicial de los degradados del carrusel de variantes — se
  // recalcula también en cada scroll (onScroll en el contenedor)
  useEffect(() => {
    updateVariantScrollState()
  }, [product?.id])

  const handleAddToCart = () => {
    if (!product || !selectedVariant) return
    addItem({
      variant_id: selectedVariant.id,
      product_name: stripBrandFromName(product.name, product.brand_name),
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
  const displayName = stripBrandFromName(product.name, product.brand_name)

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
          margin: '0 0 4px',
          lineHeight: 1.3,
          textAlign: 'center',
        }}>
          {displayName}
        </h1>

        {/* Código */}
        {selectedVariant && (
          <p style={{
            fontSize: '12px',
            color: theme.semantic.textMuted,
            margin: '0 0 4px',
            textAlign: 'center',
          }}>
            Código: {selectedVariant.sku}
          </p>
        )}

        {/* Marca */}
        {product.brand_name && (
          <p style={{
            fontSize: '10px',
            fontWeight: 500,
            color: theme.semantic.textMuted,
            margin: '0 0 10px',
            textAlign: 'center',
            textTransform: 'uppercase',
            letterSpacing: '0.03em',
          }}>
            {product.brand_name}
          </p>
        )}

        {/* Imagen grande con galería por variante */}
        <div style={{ marginBottom: '12px' }}>
          <div
            ref={galleryRef}
            onTouchStart={handleGalleryTouchStart}
            onTouchMove={handleGalleryTouchMove}
            onTouchEnd={handleGalleryTouchEnd}
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '1',
              background: '#FFFFFF',
              borderRadius: '16px',
              border: `1px solid ${theme.semantic.border}`,
              overflow: 'hidden',
              boxSizing: 'border-box',
              touchAction: 'pan-y',
            }}
          >
            {validGallery === null ? (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '13px', color: theme.semantic.textMuted }}>
                  Cargando imagen...
                </span>
              </div>
            ) : validGallery.length > 1 ? (
              <div
                onTransitionEnd={handleTrackTransitionEnd}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '300%',
                  height: '100%',
                  display: 'flex',
                  transform: `translateX(calc(-33.3333% + ${dragPx}px))`,
                  transition: isAnimating ? 'transform 0.25s ease-out' : 'none',
                }}
              >
                {(() => {
                  const length = validGallery.length
                  const prevIndex = (galleryIndex - 1 + length) % length
                  const nextIndex = (galleryIndex + 1) % length
                  const prevSrc = pendingJump && pendingJump.dir === -1 ? validGallery[pendingJump.index] : validGallery[prevIndex]
                  const nextSrc = pendingJump && pendingJump.dir === 1 ? validGallery[pendingJump.index] : validGallery[nextIndex]
                  return [prevSrc, validGallery[galleryIndex], nextSrc].map((src, slot) => (
                    <div
                      key={slot}
                      style={{
                        width: '33.3333%',
                        height: '100%',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '12px',
                        boxSizing: 'border-box',
                      }}
                    >
                      <img
                        src={src}
                        alt={displayName}
                        draggable={false}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    </div>
                  ))
                })()}
              </div>
            ) : validGallery.length === 1 ? (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px', boxSizing: 'border-box' }}>
                <img
                  src={validGallery[0]}
                  alt={displayName}
                  loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>
            ) : (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '80px' }}>🌸</span>
              </div>
            )}

          </div>

          {validGallery && validGallery.length > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '12px' }}>
              {validGallery.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToIndex(i)}
                  aria-label={`Ir a imagen ${i + 1}`}
                  style={{
                    width: i === galleryIndex ? '20px' : '8px',
                    height: '8px',
                    borderRadius: '4px',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    background: i === galleryIndex ? theme.semantic.actionPrimary : theme.semantic.border,
                    transition: 'width 0.15s',
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>

          {/* Variante */}
          {selectedVariant?.variant_name && (
            <p style={{
              fontSize: '12px',
              color: theme.semantic.textMuted,
              margin: '0 0 8px',
              textAlign: 'center',
            }}>
              Variante: {selectedVariant.variant_name}
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
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '8px', margin: '0 0 16px' }}>
            {product.precio_original != null && (
              <span style={{
                fontSize: '16px',
                color: '#9CA3AF',
                textDecoration: 'line-through',
              }}>
                ${Number(product.precio_original).toFixed(2)}
              </span>
            )}
            <p style={{
              fontSize: '28px',
              fontWeight: 600,
              color: theme.semantic.actionPrimary,
              margin: 0,
            }}>
              ${Number(product.display_price).toFixed(2)}
            </p>
          </div>

          {/* Descripción */}
          {product.description && (
            <p style={{
              fontSize: '13px',
              color: theme.semantic.textSecondary,
              margin: '0 0 16px',
              lineHeight: 1.5,
              textAlign: 'center',
            }}>
              {product.description}
            </p>
          )}

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
                background: theme.semantic.bgPage,
                borderRadius: '12px',
                padding: '0 14px',
              }}>
                {Object.entries(product.atributos).map(([key, value], i, arr) => (
                  <div
                    key={key}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 0',
                      borderBottom: i < arr.length - 1 ? `1px solid ${theme.semantic.border}` : 'none',
                    }}
                  >
                    <span style={{
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.02em',
                      color: theme.semantic.textMuted,
                    }}>
                      {key}
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: theme.semantic.textPrimary }}>{value}</span>
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
              <div style={{ position: 'relative' }}>
                <div
                  ref={variantScrollRef}
                  onScroll={updateVariantScrollState}
                  style={{ display: 'flex', flexWrap: 'nowrap', overflowX: 'auto', gap: '8px', paddingBottom: '4px' }}
                >
                  {activeVariants.map((variant) => {
                    const isSelected = selectedVariant?.id === variant.id
                    return (
                        <button
                          key={variant.id}
                          onClick={() => setSelectedVariant(variant)}
                          style={{
                            flexShrink: 0,
                            whiteSpace: 'nowrap',
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
                <div style={{
                  position: 'absolute', top: 0, bottom: 0, left: 0, width: '28px',
                  background: 'linear-gradient(to left, transparent, #FFFFFF)',
                  pointerEvents: 'none',
                  opacity: variantScroll.canLeft ? 1 : 0,
                  transition: 'opacity 0.15s',
                }} />
                <div style={{
                  position: 'absolute', top: 0, bottom: 0, right: 0, width: '28px',
                  background: 'linear-gradient(to right, transparent, #FFFFFF)',
                  pointerEvents: 'none',
                  opacity: variantScroll.canRight ? 1 : 0,
                  transition: 'opacity 0.15s',
                }} />
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