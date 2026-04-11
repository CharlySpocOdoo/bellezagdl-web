import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { theme } from '../theme'

export function TopBar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const roleLabel = {
    admin: 'Administrador',
    vendor: 'Vendedor',
    client: 'Cliente',
  }

  return (
    <div style={{
      width: '100%',
      background: theme.semantic.bgCard,
      borderBottom: `1px solid ${theme.semantic.border}`,
      padding: '0 24px',
      height: '56px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxSizing: 'border-box',
    }}>

      {/* Logo */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        <span style={{ fontSize: '20px' }}>🌸</span>
        <span style={{
          fontSize: '16px',
          fontWeight: 500,
          color: theme.semantic.textPrimary,
        }}>
          BellezaGDL
        </span>
      </div>

      {/* Usuario y logout */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
      }}>
        <div style={{ textAlign: 'right' }}>
          <p style={{
            fontSize: '13px',
            fontWeight: 500,
            color: theme.semantic.textPrimary,
            margin: 0,
          }}>
            {user?.email}
          </p>
          <p style={{
            fontSize: '11px',
            color: theme.semantic.textMuted,
            margin: 0,
          }}>
            {user ? roleLabel[user.role] : ''}
          </p>
        </div>
        <button
          onClick={handleLogout}
          style={{
            padding: '6px 14px',
            fontSize: '13px',
            color: theme.semantic.textSecondary,
            background: 'transparent',
            border: `1px solid ${theme.semantic.border}`,
            borderRadius: '8px',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = theme.semantic.actionPrimary
            e.currentTarget.style.color = theme.semantic.actionPrimary
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = theme.semantic.border
            e.currentTarget.style.color = theme.semantic.textSecondary
          }}
        >
          Cerrar sesión
        </button>
      </div>

    </div>
  )
}