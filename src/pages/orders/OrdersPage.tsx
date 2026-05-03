import { formatShortDate } from '../../utils/date'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { TopBar } from '../../components/TopBar'
import { getOrders } from '../../api/orders'
import { theme } from '../../theme'
import type { Order, OrderStatus } from '../../types'

const statusLabel: Record<OrderStatus, string> = {
  pending: 'Pendiente',
  partially_available: 'Revisar disponibilidad',
  confirmed: 'Confirmado',
  preparing: 'Preparando',
  in_delivery: 'En camino',
  delivery_failed: 'Entrega fallida',
  delivered_to_vendor: 'Entregado al vendedor',
  delivered_to_client: 'Entregado',
  return_requested: 'Devolución solicitada',
  cancelled: 'Cancelado',
}

const statusColors: Record<OrderStatus, { bg: string; text: string }> = {
  pending:              { bg: '#E6F1FB', text: '#185FA5' },
  partially_available:  { bg: '#FAEEDA', text: '#854F0B' },
  confirmed:            { bg: '#E6F1FB', text: '#185FA5' },
  preparing:            { bg: '#E6F1FB', text: '#185FA5' },
  in_delivery:          { bg: '#FBEAF0', text: '#993556' },
  delivery_failed:      { bg: '#FCEBEB', text: '#A32D2D' },
  delivered_to_vendor:  { bg: '#FBEAF0', text: '#993556' },
  delivered_to_client:  { bg: '#EAF3DE', text: '#3B6D11' },
  return_requested:     { bg: '#FAEEDA', text: '#854F0B' },
  cancelled:            { bg: '#F1EFE8', text: '#5F5E5A' },
}

const shortOrderNumber = (orderNumber: string) =>
  `ORD-${orderNumber.split('-').slice(-1)[0]}`

const ALL_FILTER = 'all'

export function OrdersPage() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<string>(ALL_FILTER)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getOrders()
        setOrders(data)
      } catch (err) {
        console.error('Error cargando pedidos:', err)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  // Extraer los estados únicos que existen en los pedidos
  const availableStatuses = Array.from(new Set(orders.map((o) => o.status)))

  const filtered = activeFilter === ALL_FILTER
    ? orders
    : orders.filter((o) => o.status === activeFilter)

  return (
    <div style={{ minHeight: '100vh', background: theme.semantic.bgPage }}>
      <TopBar />

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '16px' }}>

        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
        }}>
          <button
            onClick={() => navigate('/catalog')}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: theme.semantic.textMuted,
              fontSize: '14px',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            ← Catálogo
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{
              fontSize: '18px',
              fontWeight: 500,
              color: theme.semantic.textPrimary,
              margin: 0,
            }}>
              Mis pedidos
            </h1>
            {!isLoading && (
              <span style={{
                fontSize: '12px',
                color: theme.semantic.textMuted,
                background: theme.semantic.bgPage,
                border: `0.5px solid ${theme.semantic.border}`,
                padding: '2px 10px',
                borderRadius: '20px',
              }}>
                {filtered.length}
              </span>
            )}
          </div>
        </div>

        {/* Filtros de estado */}
        {!isLoading && orders.length > 0 && (
          <div style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '12px',
            marginBottom: '8px',
            scrollbarWidth: 'none',
          }}>
            {/* Pill "Todos" */}
            <button
              onClick={() => setActiveFilter(ALL_FILTER)}
              style={{
                padding: '6px 14px',
                fontSize: '12px',
                borderRadius: '20px',
                border: `1.5px solid ${activeFilter === ALL_FILTER ? theme.colors.secondary[800] : theme.semantic.border}`,
                background: activeFilter === ALL_FILTER ? theme.colors.secondary[800] : 'transparent',
                color: activeFilter === ALL_FILTER ? 'white' : theme.semantic.textSecondary,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                fontWeight: activeFilter === ALL_FILTER ? 500 : 400,
                flexShrink: 0,
              }}
            >
              Todos
            </button>

            {/* Pills por estado */}
            {availableStatuses.map((status) => {
              const isActive = activeFilter === status
              const colors = statusColors[status]
              return (
                <button
                  key={status}
                  onClick={() => setActiveFilter(status)}
                  style={{
                    padding: '6px 14px',
                    fontSize: '12px',
                    borderRadius: '20px',
                    border: `1.5px solid ${isActive ? colors.text : theme.semantic.border}`,
                    background: isActive ? colors.bg : 'transparent',
                    color: isActive ? colors.text : theme.semantic.textSecondary,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    fontWeight: isActive ? 500 : 400,
                    flexShrink: 0,
                  }}
                >
                  {statusLabel[status]}
                </button>
              )
            })}
          </div>
        )}

        {/* Contenido */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '48px', color: theme.semantic.textMuted }}>
            Cargando pedidos...
          </div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📦</div>
            <p style={{ color: theme.semantic.textMuted }}>Aún no tienes pedidos</p>
            <button
              onClick={() => navigate('/catalog')}
              style={{
                marginTop: '16px',
                padding: '10px 24px',
                background: theme.colors.secondary[800],
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              Ver catálogo
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: theme.semantic.textMuted }}>
            No hay pedidos con ese estado
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filtered.map((order) => (
              <div
                key={order.id}
                onClick={() => navigate('/orders/' + order.id)}
                style={{
                  background: theme.semantic.bgCard,
                  borderRadius: '12px',
                  border: `0.5px solid ${theme.semantic.border}`,
                  padding: '14px 16px',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(30,58,95,0.08)' }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none' }}
              >
                {/* Top: número + total */}
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  marginBottom: '10px',
                }}>
                  <div>
                    <p style={{
                      fontSize: '14px',
                      fontWeight: 500,
                      color: theme.semantic.textPrimary,
                      margin: '0 0 3px',
                    }}>
                      {shortOrderNumber(order.order_number)}
                    </p>
                    <p style={{
                      fontSize: '11px',
                      color: theme.semantic.textMuted,
                      margin: 0,
                    }}>
                      {formatShortDate(order.created_at)}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{
                      fontSize: '10px',
                      color: theme.semantic.textMuted,
                      margin: '0 0 2px',
                    }}>
                      Total
                    </p>
                    <p style={{
                      fontSize: '16px',
                      fontWeight: 500,
                      color: theme.semantic.textPrimary,
                      margin: 0,
                    }}>
                      ${Number(order.total).toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Bottom: estado + ver detalle */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTop: `0.5px solid ${theme.semantic.border}`,
                  paddingTop: '10px',
                }}>
                  <span style={{
                    padding: '3px 10px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: 500,
                    background: statusColors[order.status]?.bg,
                    color: statusColors[order.status]?.text,
                  }}>
                    {statusLabel[order.status]}
                  </span>
                  <span style={{
                    fontSize: '12px',
                    color: theme.semantic.textMuted,
                  }}>
                    Ver detalle →
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}