import { TopBar } from '../../components/TopBar'
import { theme } from '../../theme'

export function CatalogPage() {
  return (
    <div style={{ minHeight: '100vh', background: theme.semantic.bgPage }}>
      <TopBar />
      <div style={{ padding: '32px 24px', textAlign: 'center' }}>
        <h1 style={{ color: theme.semantic.textPrimary }}>Catálogo</h1>
        <p style={{ color: theme.semantic.textMuted }}>Próximamente — 3C</p>
      </div>
    </div>
  )
}