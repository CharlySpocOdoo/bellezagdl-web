import { useSlowNetwork } from '../hooks/useSlowNetwork'
import { theme } from '../theme'

export function NetworkStatusBanner() {
  const isSlow = useSlowNetwork()

  if (!isSlow) return null

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexWrap: 'wrap',
      gap: '12px',
      padding: '10px 16px',
      background: theme.semantic.statusAlert,
      color: theme.semantic.statusAlertText,
      animation: 'network-banner-fade-in 0.15s ease-out',
    }}>
      <span style={{ fontSize: '13px', fontWeight: 500 }}>
        Conexión inestable, reintentando...
      </span>
      <button
        onClick={() => window.location.reload()}
        style={{
          padding: '6px 14px',
          borderRadius: '20px',
          border: 'none',
          background: theme.semantic.statusAlertText,
          color: '#FFFFFF',
          fontSize: '12px',
          fontWeight: 500,
          cursor: 'pointer',
        }}
      >
        Recargar página
      </button>
    </div>
  )
}
