import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { theme } from '../theme'

export function TopBar() {
  const { user, logout, displayName } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const firstName = (displayName || user?.email || '?').split(' ')[0].split('@')[0]

  return (
    <div style={{
      width: '100%',
      background: theme.colors.secondary[800],
      padding: '0 16px',
      height: '60px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxSizing: 'border-box',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>

      {/* Marca */}
      <div
        onClick={() => navigate(user?.role === 'vendor' ? '/vendor' : '/catalog')}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          cursor: 'pointer',
        }}
      >
        <span style={{
          fontSize: '15px',
          fontWeight: 800,
          color: '#FFFFFF',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          lineHeight: 1.2,
        }}>
          Rosa de Lima
        </span>
        {/* Línea coral */}
        <div style={{
          width: '100%',
          height: '1.5px',
          background: theme.semantic.actionPrimary,
          margin: '2px 0',
        }} />
        <span style={{
          fontSize: '9px',
          color: 'rgba(255,255,255,0.7)',
          letterSpacing: '4px',
          textTransform: 'uppercase',
          fontWeight: 400,
        }}>
          Cosméticos
        </span>
      </div>
      {/* Derecha: ícono persona + nombre + cerrar sesión */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'rgba(232,99,122,0.15)',
            border: '1.5px solid rgba(232,99,122,0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E8637A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <span style={{
            fontSize: '13px',
            color: 'rgba(255,255,255,0.85)',
            fontWeight: 500,
          }}>
            {firstName}
          </span>
        </div>

        <button
          onClick={handleLogout}
          style={{
            padding: '5px 12px',
            fontSize: '12px',
            color: 'rgba(255,255,255,0.65)',
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '8px',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = theme.semantic.actionPrimary
            e.currentTarget.style.color = theme.semantic.actionPrimary
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
            e.currentTarget.style.color = 'rgba(255,255,255,0.65)'
          }}
        >
          Cerrar sesión
        </button>
      </div>

    </div>
  )
}