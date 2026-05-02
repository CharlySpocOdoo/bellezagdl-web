import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { theme } from '../theme'
import logoRosaLima from '../assets/logorosalima.png'

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

      {/* Logo más grande */}
      <div
        onClick={() => navigate(user?.role === 'vendor' ? '/vendor' : '/catalog')}
        style={{
          width: '46px',
          height: '46px',
          borderRadius: '50%',
          background: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          border: '2px solid rgba(232,99,122,0.4)',
          cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        <img
          src={logoRosaLima}
          alt="Rosa de Lima"
          style={{ width: '42px', height: '42px', objectFit: 'contain' }}
        />
      </div>

      {/* Derecha: ícono persona + nombre + cerrar sesión */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

        {/* Ícono persona + nombre */}
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

        {/* Cerrar sesión */}
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