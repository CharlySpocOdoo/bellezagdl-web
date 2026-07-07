import { theme } from '../theme'
import type { Brand } from '../types'

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
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={theme.semantic.textSecondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          <span>Todas las marcas</span>
        </>
      )}
      <span style={{ marginLeft: 'auto', fontSize: '10px', flexShrink: 0 }}>▾</span>
    </button>
  )
}
