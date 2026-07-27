import { useEffect, useRef, useState } from 'react'

const LOAD_TIMEOUT_MS = 6000

interface ProductImageProps {
  sources: (string | null | undefined)[]
  alt: string
  style?: React.CSSProperties
  fallback: React.ReactNode
}

// Intenta cada URL candidata en orden. Mientras no se confirme la carga con
// onLoad, el <img> se mantiene con opacity: 0 y el fallback queda visible
// debajo — así el ícono nativo de "imagen rota" del navegador nunca se
// pinta, sin importar la causa del fallo. Si onError nunca se dispara
// (URL que cuelga, CORS, archivo corrupto), un timeout de 6s avanza al
// siguiente candidato igual que lo haría un onError real.
// No usar loading="lazy": provoca que un <img> con una URL ya cacheada
// (p.ej. el mismo fallback repetido entre productos) nunca dispare onLoad,
// dejando el componente colgado hasta el timeout.
//
// Tampoco basta con onLoad/onError solos: si el navegador ya tiene la
// imagen en caché (usuario que ya navegó el catálogo antes), puede
// completarla antes de que React alcance a adjuntar los listeners, y el
// evento nunca llega — por eso el ref callback revisa img.complete al
// montar y resuelve manualmente en ese caso.
export function ProductImage({ sources, alt, style, fallback }: ProductImageProps) {
  const validSources = sources.filter((s): s is string => !!s)
  const [attemptIndex, setAttemptIndex] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const currentSrc = validSources[attemptIndex]

  useEffect(() => {
    setLoaded(false)
    if (!currentSrc) return

    timerRef.current = setTimeout(() => {
      setAttemptIndex((i) => i + 1)
    }, LOAD_TIMEOUT_MS)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [currentSrc])

  const handleLoad = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setLoaded(true)
  }

  const handleError = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setAttemptIndex((i) => i + 1)
  }

  const checkAlreadyDone = (el: HTMLImageElement | null) => {
    if (!el || !el.complete) return
    if (el.naturalWidth > 0) {
      handleLoad()
    } else {
      handleError()
    }
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {!loaded && fallback}
      {currentSrc && (
        <img
          key={currentSrc}
          ref={checkAlreadyDone}
          src={currentSrc}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          style={{ ...style, position: 'absolute', inset: 0, opacity: loaded ? 1 : 0, transition: 'opacity 0.15s' }}
        />
      )}
    </div>
  )
}
