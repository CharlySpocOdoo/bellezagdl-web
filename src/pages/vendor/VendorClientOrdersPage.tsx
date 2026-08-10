import { statusLabel, statusColors, getStatusLabel } from '../../utils/orderStatus'
import { formatShortDate } from '../../utils/date'
import { useState, useEffect } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { TopBar } from '../../components/TopBar'
import { getOrdersByClient } from '../../api/orders'
import { theme } from '../../theme'
import type { Order } from '../../types'

const shortOrderNumber = (orderNumber: string) =>
  `ORD-${orderNumber.split('-').slice(-1)[0]}`

const ALL_FILTER = 'all'

export function VendorClientOrdersPage() {
  const navigate = useNavigate()
  const { clientId } = useParams<{ clientId: string }>()
  const location = useLocation()
  const clientName = (location.state as any)?.clientName as string | undefined

  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<string>(ALL_FILTER)

  useEffect(() => {
    if (!clientId) return
    const load = async () => {
      try {
        const data = await getOrdersByClient(clientId)
        setOrders(data)
      } catch {
        navigate('/vendor?tab=clientes', { replace: true })
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [clientId])

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
            onClick={() => navigate('/vendor?tab=clientes')}
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
            ← Mis Clientes
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{
              fontSize: '18px',
              fontWeight: 500,
              color: theme.semantic.textPrimary,
              margin: 0,
            }}>
              {clientName || 'Pedidos del cliente'}
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
            <p style={{ color: theme.semantic.textMuted }}>Este cliente aún no tiene pedidos</p>
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
                    <p style={{ fontSize: '10px', color: theme.semantic.textMuted, margin: '0 0 2px' }}>
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
                    {getStatusLabel(order.status, order.sale_type)}
                  </span>
                  <span style={{ fontSize: '12px', color: theme.semantic.textMuted }}>
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
