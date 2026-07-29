import { useState, useEffect } from 'react'

interface BrandImageBackgroundProps {
  brandName: string | null
  children: React.ReactNode
  style?: React.CSSProperties
}

// Quita acentos/diacríticos antes de mayusculizar, igual que el backend
// (unicodedata NFD + strip de diacríticos) — evita URLs de fondo de marca
// inconsistentes entre navegadores/sistemas operativos.
function normalizeForUrl(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
}

export function BrandImageBackground({ brandName, children, style }: BrandImageBackgroundProps) {
  const [bgFailed, setBgFailed] = useState(false)

  const brandBg = brandName
    ? `https://rosadelima-assets.s3.amazonaws.com/marcas/fondos/${normalizeForUrl(brandName)}.webp`
    : null

  // Un fallo con una marca anterior no debe persistir si brandBg cambia
  useEffect(() => {
    setBgFailed(false)
  }, [brandBg])

  const showBg = !!brandBg && !bgFailed

  return (
    <div style={{
      position: 'relative',
      backgroundColor: '#FFFFFF',
      backgroundImage: showBg ? `url(${brandBg})` : undefined,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      ...style,
    }}>
      {brandBg && !bgFailed && (
        <img
          src={brandBg}
          alt=""
          aria-hidden="true"
          onError={() => setBgFailed(true)}
          style={{ display: 'none' }}
        />
      )}
      {children}
    </div>
  )
}
