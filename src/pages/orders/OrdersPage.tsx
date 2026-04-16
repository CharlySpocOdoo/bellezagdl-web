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
  pending: { bg: theme.colors.neutral[50], text: theme.colors.neutral[800] },
  partially_available: { bg: theme.colors.accent[50], text: theme.colors.accent[800] },
  confirmed: { bg: theme.colors.secondary[50], text: theme.colors.secondary[800] },
  preparing: { bg: theme.colors.secondary[50], text: theme.colors.secondary[800] },
  in_delivery: { bg: theme.colors.primary[50], text: theme.colors.primary[800] },
  delivery_failed: { bg: theme.colors.accent[50], text: theme.colors.accent[800] },
  delivered_to_vendor: { bg: theme.colors.primary[50], text: theme.colors.primary[800] },
  delivered_to_client: { bg: '#EAF3DE', text: '#27500A' },
  return_requested: { bg: theme.colors.accent[50], text: theme.colors.accent[800] },
  cancelled: { bg: theme.colors.neutral[50], text: theme.colors.neutral[600] },
}

export function OrdersPage() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

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

  return (
    <div style={{ minHeight: '100vh', background: theme.semantic.bgPage }}>
      <TopBar />
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px 16px' }}>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <h1 style={{ fontSize: '22px', fontWeight: 500, color: theme.semantic.textPrimary, margin: 0 }}>
            Mis pedidos
          </h1>
          <button
            onClick={() => navigate('/catalog')}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              color: theme.semantic.actionPrimary,
              background: theme.semantic.actionPrimaryLight,
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            Ir al catálogo
          </button>
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '48px', color: theme.semantic.textMuted }}>
            Cargando pedidos...
          </div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📦</div>
            <p style={{ color: theme.semantic.textMuted }}>Aun no tienes pedidos</p>
            <button
              onClick={() => navigate('/catalog')}
              style={{
                marginTop: '16px',
                padding: '10px 24px',
                background: theme.semantic.actionPrimary,
                color: theme.semantic.textOnPrimary,
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              Ver catálogo
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {orders.map((order) => (
              <div
                key={order.id}
                onClick={() => navigate('/orders/' + order.id)}
                style={{
                  background: theme.semantic.bgCard,
                  borderRadius: '12px',
                  border: '1px solid ' + theme.semantic.border,
                  padding: '16px 20px',
                  cursor: 'pointer',
                  transition: 'transform 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)' }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <p style={{ fontSize: '15px', fontWeight: 500, color: theme.semantic.textPrimary, margin: '0 0 4px' }}>
                      {order.order_number}
                    </p>
                    <p style={{ fontSize: '12px', color: theme.semantic.textMuted, margin: 0 }}>
                      {formatShortDate(order.created_at)}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 500,
                      background: statusColors[order.status]?.bg,
                      color: statusColors[order.status]?.text,
                    }}>
                      {statusLabel[order.status]}
                    </span>
                    <span style={{ fontSize: '16px', fontWeight: 500, color: theme.semantic.textPrimary }}>
                      ${Number(order.total).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}