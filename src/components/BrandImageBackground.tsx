import { useState, useEffect } from 'react'

interface BrandImageBackgroundProps {
  brandName: string | null
  children: React.ReactNode
  style?: React.CSSProperties
}

export function BrandImageBackground({ brandName, children, style }: BrandImageBackgroundProps) {
  const [bgFailed, setBgFailed] = useState(false)

  const brandBg = brandName
    ? `https://rosadelima-assets.s3.amazonaws.com/marcas/fondos/${brandName.toUpperCase()}.webp`
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
