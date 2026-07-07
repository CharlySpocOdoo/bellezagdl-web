import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useCatalog } from '../../contexts/CatalogContext'
import { theme } from '../../theme'
import type { Brand } from '../../types'

const ALL_BRANDS: Brand = { id: '', name: 'Todas las marcas', active: true, logo_url: null }

function FilterIcon({ color }: { color: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  )
}

function BrandTile({ brand, active, onClick }: { brand: Brand; active: boolean; onClick: () => void }) {
  const [failed, setFailed] = useState(false)
  const showLogo = !!brand.logo_url && !failed
  const isAllBrands = brand.id === ''

  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
        padding: '10px 6px',
        borderRadius: '12px',
        border: `1.5px solid ${active ? theme.colors.secondary[800] : theme.semantic.border}`,
        background: active ? theme.colors.secondary[50] : theme.semantic.bgCard,
        cursor: 'pointer',
      }}
    >
      <div style={{
        width: '56px',
        height: '56px',
        borderRadius: '10px',
        background: theme.semantic.bgInput,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        flexShrink: 0,
      }}>
        {showLogo ? (
          <img
            src={brand.logo_url!}
            alt={brand.name}
            loading="lazy"
            onError={() => setFailed(true)}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        ) : isAllBrands ? (
          <FilterIcon color={theme.colors.secondary[800]} />
        ) : (
          <span style={{ fontSize: '18px', fontWeight: 600, color: theme.semantic.textMuted }}>
            {brand.name.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      <span style={{
        fontSize: '11px',
        fontWeight: active ? 600 : 400,
        color: active ? theme.colors.secondary[800] : theme.semantic.textSecondary,
        textAlign: 'center',
        lineHeight: 1.2,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        wordBreak: 'break-word',
      }}>
        {brand.name}
      </span>
    </button>
  )
}

export function BrandSelectPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { brands } = useCatalog()
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState('')

  const backPath = user?.role === 'wholesale' ? '/wholesale' : '/catalog'
  const currentBrand = searchParams.get('brand') || ''

  const goBackWith = (brandId: string) => {
    navigate(brandId ? `${backPath}?brand=${brandId}` : backPath)
  }

  const filteredBrands = brands.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ minHeight: '100vh', background: theme.semantic.bgPage }}>

      {/* Header mínimo — solo volver + título */}
      <div style={{
        position: 'sticky',
        top: 0,
        background: theme.semantic.bgCard,
        borderBottom: `1px solid ${theme.semantic.border}`,
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        zIndex: 10,
      }}>
        <button
          onClick={() => goBackWith(currentBrand)}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: theme.semantic.textPrimary,
            fontSize: '20px',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            lineHeight: 1,
          }}
        >
          ←
        </button>
        <h1 style={{ fontSize: '18px', fontWeight: 500, color: theme.semantic.textPrimary, margin: 0 }}>
          Seleccionar marca
        </h1>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '16px' }}>

        {/* Buscador */}
        <input
          type="text"
          placeholder="Buscar marca..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 14px',
            fontSize: '16px',
            border: `1.5px solid ${theme.semantic.border}`,
            borderRadius: '10px',
            background: theme.semantic.bgInput,
            color: theme.semantic.textPrimary,
            outline: 'none',
            boxSizing: 'border-box',
            marginBottom: '16px',
          }}
        />

        {/* Grid de marcas */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
          gap: '12px',
        }}>
          {/* "Todas las marcas" — fija, no se filtra por búsqueda */}
          <BrandTile
            brand={ALL_BRANDS}
            active={currentBrand === ''}
            onClick={() => goBackWith('')}
          />
          {filteredBrands.map((brand) => (
            <BrandTile
              key={brand.id}
              brand={brand}
              active={currentBrand === brand.id}
              onClick={() => goBackWith(brand.id)}
            />
          ))}
        </div>

        {filteredBrands.length === 0 && search.length > 0 && (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>🔍</div>
            <p style={{ color: theme.semantic.textMuted, fontSize: '13px', margin: 0 }}>
              No se encontraron marcas
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
