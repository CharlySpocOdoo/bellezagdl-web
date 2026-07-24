import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { theme } from '../theme'

interface TopBarProps {
  cartItemCount?: number
  onCartClick?: () => void
}

export function TopBar({ cartItemCount, onCartClick }: TopBarProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = async () => {
    setIsMenuOpen(false)
    await logout()
    navigate('/login')
  }

  const handleUserClick = () => {
    if (user?.role === 'client') navigate('/profile')
    else if (user?.role === 'vendor') navigate('/vendor?tab=perfil')
    // wholesale / oferta / admin: sin pantalla de perfil todavía
  }

  const showMisPedidos = user?.role === 'client' || user?.role === 'wholesale'

  return (
    <div style={{
      width: '100%',
      background: theme.colors.secondary[800],
      padding: '0 16px',
      height: '60px',
      display: 'grid',
      gridTemplateColumns: '1fr auto 1fr',
      alignItems: 'center',
      boxSizing: 'border-box',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>

      {/* Izquierda: hamburguesa + WhatsApp */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '8px' }}>
        <button
          onClick={() => setIsMenuOpen((v) => !v)}
          aria-label="Menú"
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <a
          href="https://wa.me/523318657712"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            background: '#25D366',
            textDecoration: 'none',
            flexShrink: 0,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
            <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm0 1.5c4.65 0 8.41 3.76 8.41 8.41s-3.76 8.41-8.41 8.41c-1.51 0-2.99-.4-4.29-1.16l-.31-.18-3.19.84.85-3.11-.2-.32a8.36 8.36 0 0 1-1.28-4.48c0-4.65 3.77-8.41 8.42-8.41zm-3.11 4.7c-.16 0-.42.06-.64.31s-.85.83-.85 2.02.87 2.35.99 2.51c.12.16 1.7 2.72 4.16 3.71 2.05.83 2.47.66 2.92.62.44-.04 1.43-.58 1.63-1.15.2-.56.2-1.04.14-1.15-.06-.1-.22-.16-.46-.28-.24-.12-1.43-.71-1.65-.79-.22-.08-.38-.12-.55.12-.16.24-.63.79-.77.96-.14.16-.28.18-.52.06-.24-.12-1.02-.38-1.94-1.2-.72-.64-1.2-1.44-1.34-1.68-.14-.24-.02-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.55-1.32-.75-1.81-.2-.48-.4-.42-.55-.42h-.47z"/>
          </svg>
        </a>

        {isMenuOpen && (
          <>
            <div
              onClick={() => setIsMenuOpen(false)}
              style={{ position: 'fixed', inset: 0, zIndex: 59 }}
            />
            <div style={{
              position: 'absolute',
              top: '60px',
              left: '16px',
              background: theme.semantic.bgCard,
              borderRadius: '10px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
              minWidth: '170px',
              overflow: 'hidden',
              zIndex: 60,
            }}>
              {showMisPedidos && (
                <button
                  onClick={() => {
                    setIsMenuOpen(false)
                    navigate(user?.role === 'wholesale' ? '/wholesale/orders' : '/orders')
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '12px 16px',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: `1px solid ${theme.semantic.border}`,
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: theme.semantic.textPrimary,
                  }}
                >
                  Mis pedidos
                </button>
              )}
              <button
                onClick={handleLogout}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '12px 16px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: theme.semantic.textPrimary,
                }}
              >
                Cerrar sesión
              </button>
            </div>
          </>
        )}
      </div>

      {/* Centro: marca */}
      <div
        onClick={() => {
          if (user?.role === 'vendor') navigate('/vendor')
          else if (user?.role === 'wholesale') navigate('/wholesale')
          else navigate('/catalog')
        }}
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
          {user?.role === 'oferta' ? 'CELAVI' : 'Rosa de Lima'}
        </span>
        {/* Línea coral */}
        <div style={{
          width: '100%',
          height: '1.5px',
          background: theme.semantic.actionPrimary,
          margin: '2px 0',
        }} />
        {user?.role !== 'oferta' && (
          <span style={{
            fontSize: '9px',
            color: 'rgba(255,255,255,0.7)',
            letterSpacing: '4px',
            textTransform: 'uppercase',
            fontWeight: 400,
          }}>
            Cosméticos
          </span>
        )}
      </div>

      {/* Derecha: usuario + carrito */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
        <button
          onClick={handleUserClick}
          aria-label="Perfil"
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'rgba(232,99,122,0.15)',
            border: '1.5px solid rgba(232,99,122,0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            cursor: user?.role === 'client' || user?.role === 'vendor' ? 'pointer' : 'default',
            padding: 0,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E8637A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </button>

        {onCartClick && (
          <button
            onClick={onCartClick}
            aria-label="Carrito"
            style={{
              position: 'relative',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '20px',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
            }}
          >
            🛍️
            {!!cartItemCount && (
              <span style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                background: theme.semantic.actionPrimary,
                color: 'white',
                borderRadius: '10px',
                minWidth: '16px',
                height: '16px',
                fontSize: '10px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 3px',
              }}>
                {cartItemCount}
              </span>
            )}
          </button>
        )}
      </div>

    </div>
  )
}
