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
  const initial = firstName[0].toUpperCase()

  return (
    <div style={{
      width: '100%',
      background: theme.colors.secondary[800],
      padding: '0 16px',
      height: '56px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxSizing: 'border-box',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>

      {/* Logo */}
      <div
        onClick={() => navigate(user?.role === 'vendor' ? '/vendor' : '/catalog')}
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          border: '1.5px solid rgba(232,99,122,0.4)',
          cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        <img
          src={logoRosaLima}
          alt="Rosa de Lima"
          style={{ width: '32px', height: '32px', objectFit: 'contain' }}
        />
      </div>

      {/* Derecha: avatar + nombre + cerrar sesión */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

        {/* Avatar + nombre */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: 'rgba(232,99,122,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '11px',
            fontWeight: 700,
            color: theme.semantic.actionPrimary,
            flexShrink: 0,
          }}>
            {initial}
          </div>
          <span style={{
            fontSize: '13px',
            color: 'rgba(255,255,255,0.8)',
            fontWeight: 500,
          }}>
            {firstName}
          </span>
        </div>

        {/* Cerrar sesión */}
        <button
          onClick={handleLogout}
          style={{
            padding: '5px 10px',
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