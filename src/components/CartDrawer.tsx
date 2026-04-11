import { useCart } from '../contexts/CartContext'
import { theme } from '../theme'

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
  onCheckout: () => void
}

export function CartDrawer({ isOpen, onClose, onCheckout }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, total, itemCount } = useCart()

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.3)',
            zIndex: 40,
          }}
        />
      )}

      {/* Panel */}
      <div style={{
        position: 'fixed',
        top: 0,
        right: 0,
        height: '100vh',
        width: '100%',
        maxWidth: '400px',
        background: theme.semantic.bgCard,
        borderLeft: `1px solid ${theme.semantic.border}`,
        zIndex: 50,
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
      }}>

        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: `1px solid ${theme.semantic.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <h2 style={{
              fontSize: '18px',
              fontWeight: 500,
              color: theme.semantic.textPrimary,
              margin: 0,
            }}>
              Mi carrito
            </h2>
            <p style={{
              fontSize: '13px',
              color: theme.semantic.textMuted,
              margin: '2px 0 0',
            }}>
              {itemCount} {itemCount === 1 ? 'producto' : 'productos'}
            </p>
          </div>
          <button
            onClick={onClose}
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

        {/* Items */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 24px',
        }}>
          {items.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '48px 0',
            }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>🛍️</div>
              <p style={{ color: theme.semantic.textMuted, fontSize: '14px' }}>
                Tu carrito está vacío
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.variant_id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '14px 0',
                  borderBottom: `1px solid ${theme.semantic.border}`,
                }}
              >
                {/* Info */}
                <div style={{ flex: 1 }}>
                  <p style={{
                    fontSize: '14px',
                    fontWeight: 500,
                    color: theme.semantic.textPrimary,
                    margin: '0 0 2px',
                  }}>
                    {item.product_name}
                  </p>
                  <p style={{
                    fontSize: '12px',
                    color: theme.semantic.textMuted,
                    margin: '0 0 8px',
                  }}>
                    {item.variant_name}
                  </p>
                  <p style={{
                    fontSize: '14px',
                    fontWeight: 500,
                    color: theme.semantic.actionPrimary,
                    margin: 0,
                  }}>
                    ${(item.unit_price * item.quantity).toFixed(2)}
                  </p>
                </div>

                {/* Cantidad y eliminar */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  gap: '8px',
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: theme.colors.neutral[50],
                    borderRadius: '8px',
                    padding: '4px 8px',
                  }}>
                    <button
                      onClick={() => updateQuantity(item.variant_id, item.quantity - 1)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '16px',
                        color: theme.semantic.textSecondary,
                        padding: '0 4px',
                        lineHeight: 1,
                      }}
                    >
                      −
                    </button>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: 500,
                      color: theme.semantic.textPrimary,
                      minWidth: '20px',
                      textAlign: 'center',
                    }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.variant_id, item.quantity + 1)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '16px',
                        color: theme.semantic.textSecondary,
                        padding: '0 4px',
                        lineHeight: 1,
                      }}
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.variant_id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '12px',
                      color: theme.semantic.textMuted,
                      padding: 0,
                    }}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer con total y checkout */}
        {items.length > 0 && (
          <div style={{
            padding: '20px 24px',
            borderTop: `1px solid ${theme.semantic.border}`,
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
            }}>
              <span style={{
                fontSize: '15px',
                color: theme.semantic.textSecondary,
              }}>
                Total
              </span>
              <span style={{
                fontSize: '20px',
                fontWeight: 500,
                color: theme.semantic.textPrimary,
              }}>
                ${total.toFixed(2)}
              </span>
            </div>
            <button
              onClick={onCheckout}
              style={{
                width: '100%',
                padding: '12px',
                background: theme.semantic.actionPrimary,
                color: theme.semantic.textOnPrimary,
                border: 'none',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = theme.semantic.actionPrimaryHover
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = theme.semantic.actionPrimary
              }}
            >
              Confirmar pedido
            </button>
          </div>
        )}

      </div>
    </>
  )
}