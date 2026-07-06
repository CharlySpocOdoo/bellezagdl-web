import { useState } from 'react'
import { theme } from '../theme'
import type { Brand } from '../types'

const ALL_BRANDS: Brand = { id: '', name: 'Todas las marcas', active: true, logo_url: null }

function FilterIcon({ color }: { color: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  )
}

interface BrandFilterTriggerProps {
  brands: Brand[]
  selectedBrand: string
  onClick: () => void
}

export function BrandFilterTrigger({ brands, selectedBrand, onClick }: BrandFilterTriggerProps) {
  const activeBrand = selectedBrand ? brands.find((b) => b.id === selectedBrand) : undefined

  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '9px 12px',
        borderRadius: '10px',
        border: `1.5px solid ${activeBrand ? theme.colors.secondary[800] : theme.semantic.border}`,
        background: activeBrand ? theme.colors.secondary[800] : theme.semantic.bgCard,
        color: activeBrand ? 'white' : theme.semantic.textSecondary,
        fontSize: '13px',
        fontWeight: activeBrand ? 600 : 400,
        cursor: 'pointer',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {activeBrand ? (
        <>
          {activeBrand.logo_url && (
            <img
              src={activeBrand.logo_url}
              alt={activeBrand.name}
              width={16}
              height={16}
              style={{ objectFit: 'contain', borderRadius: '2px', flexShrink: 0 }}
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
            />
          )}
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {activeBrand.name}
          </span>
        </>
      ) : (
        <>
          <FilterIcon color={theme.semantic.textSecondary} />
          <span>Todas las marcas</span>
        </>
      )}
      <span style={{ marginLeft: 'auto', fontSize: '10px', flexShrink: 0 }}>▾</span>
    </button>
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

interface BrandFilterSheetProps {
  isOpen: boolean
  onClose: () => void
  brands: Brand[]
  selectedBrand: string
  onSelect: (brandId: string) => void
}

export function BrandFilterSheet({ isOpen, onClose, brands, selectedBrand, onSelect }: BrandFilterSheetProps) {
  const [search, setSearch] = useState('')

  const filteredBrands = brands.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleSelect = (brandId: string) => {
    onSelect(brandId)
    setSearch('')
    onClose()
  }

  const handleClose = () => {
    setSearch('')
    onClose()
  }

  return (
    <>
      {isOpen && (
        <div
          onClick={handleClose}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 40 }}
        />
      )}

      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        margin: '0 auto',
        width: '100%',
        maxWidth: '480px',
        maxHeight: '80vh',
        background: theme.semantic.bgCard,
        borderTopLeftRadius: '20px',
        borderTopRightRadius: '20px',
        border: `1px solid ${theme.semantic.border}`,
        borderBottom: 'none',
        zIndex: 50,
        transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
      }}>

        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: `1px solid ${theme.semantic.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: 500, color: theme.semantic.textPrimary, margin: 0 }}>
            Marcas
          </h2>
          <button
            onClick={handleClose}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '22px',
              cursor: 'pointer',
              color: theme.semantic.textMuted,
              padding: '4px',
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>

        {/* Buscador */}
        <div style={{ padding: '14px 20px 10px', flexShrink: 0 }}>
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
            }}
          />
        </div>

        {/* Grid de marcas */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px 20px 24px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
            gap: '12px',
          }}>
            {/* "Todas las marcas" — fija, no se filtra por búsqueda */}
            <BrandTile
              brand={ALL_BRANDS}
              active={selectedBrand === ''}
              onClick={() => handleSelect('')}
            />
            {filteredBrands.map((brand) => (
              <BrandTile
                key={brand.id}
                brand={brand}
                active={selectedBrand === brand.id}
                onClick={() => handleSelect(brand.id)}
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
    </>
  )
}
