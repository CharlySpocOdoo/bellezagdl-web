import { formatDateTime } from '../../utils/date'
import { getOrder, acceptPartialOrder, requestReturn, cancelOrder } from '../../api/orders'
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { TopBar } from '../../components/TopBar'
import { theme } from '../../theme'
import type { Order, OrderStatus } from '../../types'
import { useAuth } from '../../contexts/AuthContext'

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

export function OrderDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isActing, setIsActing] = useState(false)
  const [actionError, setActionError] = useState('')
  const [actionSuccess, setActionSuccess] = useState('')

  useEffect(() => {
    if (!id) return
    const load = async () => {
      try {
        const data = await getOrder(id)
        setOrder(data)
      } catch {
        navigate('/orders')
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [id])

  const handlePartialAccept = async (accept: boolean) => {
    if (!order) return
    setIsActing(true)
    setActionError('')
    try {
      const updated = await acceptPartialOrder(order.id, accept)
      setOrder(updated)
      setActionSuccess(accept
        ? 'Pedido aceptado con los productos disponibles.'
        : 'Pedido cancelado correctamente.'
      )
    } catch (err: any) {
      setActionError(err.response?.data?.detail || 'No se pudo procesar la acción. Intenta de nuevo.')
    } finally {
      setIsActing(false)
    }
  }

  const handleRequestReturn = async () => {
    if (!order) return
    setIsActing(true)
    setActionError('')
    try {
      const updated = await requestReturn(order.id)
      setOrder(updated)
      setActionSuccess('Devolución solicitada correctamente.')
    } catch (err: any) {
      setActionError(err.response?.data?.detail || 'No se pudo solicitar la devolución. Intenta de nuevo.')
    } finally {
      setIsActing(false)
    }
  }

  const handleCancel = async () => {
    if (!order) return
    setIsActing(true)
    setActionError('')
    try {
      const updated = await cancelOrder(order.id)
      setOrder(updated)
      setActionSuccess('Pedido cancelado correctamente.')
    } catch (err: any) {
      setActionError(err.response?.data?.detail || 'No se pudo cancelar el pedido. Intenta de nuevo.')
    } finally {
      setIsActing(false)
    }
  }

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: theme.semantic.bgPage }}>
        <TopBar />
        <div style={{ textAlign: 'center', padding: '48px', color: theme.semantic.textMuted }}>
          Cargando pedido...
        </div>
      </div>
    )
  }

  if (!order) return null

  const colors = statusColors[order.status]

  return (
    <div style={{ minHeight: '100vh', background: theme.semantic.bgPage }}>
      <TopBar />
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '16px' }}>

        {/* Volver */}
        <button
          onClick={() => navigate(user?.role === 'vendor' ? '/vendor?tab=pedidos' : '/orders')}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: theme.semantic.textMuted,
            fontSize: '14px',
            padding: '0 0 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          ← Mis pedidos
        </button>

        {/* Header */}
        <div style={{
          background: theme.semantic.bgCard,
          borderRadius: '12px',
          border: `0.5px solid ${theme.semantic.border}`,
          padding: '16px 20px',
          marginBottom: '12px',
        }}>
          {/* Número + estado */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '4px',
          }}>
            <h1 style={{
              fontSize: '18px',
              fontWeight: 500,
              color: theme.semantic.textPrimary,
              margin: 0,
            }}>
              {shortOrderNumber(order.order_number)}
            </h1>
            <span style={{
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 500,
              background: colors.bg,
              color: colors.text,
            }}>
              {statusLabel[order.status]}
            </span>
          </div>

          {/* Fecha */}
          <p style={{
            fontSize: '12px',
            color: theme.semantic.textMuted,
            margin: '0 0 16px',
          }}>
            {formatDateTime(order.status === 'cancelled' && order.cancelled_at
              ? order.cancelled_at
              : order.created_at)}
          </p>




        </div>

        {/* Mensajes de éxito/error */}
        {actionSuccess && (
          <div style={{
            background: '#EAF3DE',
            border: '0.5px solid #C0DD97',
            borderRadius: '10px',
            padding: '10px 16px',
            marginBottom: '12px',
            fontSize: '13px',
            color: '#3B6D11',
          }}>
            {actionSuccess}
          </div>
        )}
        {actionError && (
          <div style={{
            background: '#FCEBEB',
            border: '0.5px solid #F7C1C1',
            borderRadius: '10px',
            padding: '10px 16px',
            marginBottom: '12px',
            fontSize: '13px',
            color: '#A32D2D',
          }}>
            {actionError}
          </div>
        )}

        {/* Acción — parcialmente disponible */}
        {order.status === 'partially_available' && user?.role === 'client' && (
          <div style={{
            background: '#FAEEDA',
            border: '0.5px solid #FAC775',
            borderRadius: '12px',
            padding: '16px 20px',
            marginBottom: '12px',
          }}>
            <p style={{
              fontSize: '13px',
              color: '#854F0B',
              margin: '0 0 12px',
              fontWeight: 500,
            }}>
              Algunos productos no están disponibles. ¿Qué deseas hacer?
            </p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={() => handlePartialAccept(true)}
                disabled={isActing}
                style={{
                  padding: '8px 16px',
                  background: theme.colors.secondary[800],
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: isActing ? 'not-allowed' : 'pointer',
                  fontSize: '13px',
                  fontWeight: 500,
                  opacity: isActing ? 0.7 : 1,
                }}
              >
                {isActing ? 'Procesando...' : 'Aceptar lo disponible'}
              </button>
              <button
                onClick={() => handlePartialAccept(false)}
                disabled={isActing}
                style={{
                  padding: '8px 16px',
                  background: 'transparent',
                  color: '#A32D2D',
                  border: '1px solid #F09595',
                  borderRadius: '8px',
                  cursor: isActing ? 'not-allowed' : 'pointer',
                  fontSize: '13px',
                  opacity: isActing ? 0.7 : 1,
                }}
              >
                Cancelar pedido
              </button>
            </div>
          </div>
        )}

        {/* Acción — cancelar */}
        {(order.status === 'pending' || order.status === 'confirmed') && user?.role === 'client' && (
          <div style={{
            background: theme.semantic.bgCard,
            border: `0.5px solid ${theme.semantic.border}`,
            borderRadius: '12px',
            padding: '14px 20px',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
          }}>
            <p style={{ fontSize: '13px', color: theme.semantic.textSecondary, margin: 0 }}>
              ¿Deseas cancelar este pedido?
            </p>
            <button
              onClick={handleCancel}
              disabled={isActing}
              style={{
                padding: '7px 16px',
                background: 'transparent',
                color: '#A32D2D',
                border: '1px solid #F09595',
                borderRadius: '8px',
                cursor: isActing ? 'not-allowed' : 'pointer',
                fontSize: '13px',
                opacity: isActing ? 0.7 : 1,
              }}
            >
              {isActing ? 'Procesando...' : 'Cancelar pedido'}
            </button>
          </div>
        )}


        {/* Productos */}
        <div style={{
          background: theme.semantic.bgCard,
          borderRadius: '12px',
          border: `0.5px solid ${theme.semantic.border}`,
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '12px 20px',
            borderBottom: `0.5px solid ${theme.semantic.border}`,
          }}>
            <h2 style={{
              fontSize: '14px',
              fontWeight: 500,
              color: theme.semantic.textPrimary,
              margin: 0,
            }}>
              Productos
            </h2>
          </div>

          {order.items?.map((item, index) => (
            <div
              key={item.id}
              style={{
                padding: '12px 20px',
                borderBottom: index < order.items.length - 1
                  ? `0.5px solid ${theme.semantic.border}`
                  : 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '8px',
                opacity: item.cancelled_in_partial ? 0.5 : 1,
                background: item.cancelled_in_partial ? theme.colors.neutral[50] : 'transparent',
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px', flexWrap: 'wrap' }}>
                  <p style={{
                    fontSize: '13px',
                    fontWeight: 500,
                    color: theme.semantic.textPrimary,
                    margin: 0,
                  }}>
                    {item.product_name_snapshot || `Producto ${index + 1}`}
                    {item.variant_name_snapshot ? ` — ${item.variant_name_snapshot}` : ''}
                  </p>
                  {item.cancelled_in_partial && (
                    <span style={{
                      fontSize: '10px',
                      padding: '2px 7px',
                      borderRadius: '12px',
                      background: '#FCEBEB',
                      color: '#A32D2D',
                      fontWeight: 500,
                    }}>
                      No disponible
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '11px', color: theme.semantic.textMuted, margin: 0 }}>
                  {item.quantity} × ${Number(item.unit_price).toFixed(2)}
                </p>
              </div>
              <p style={{
                fontSize: '14px',
                fontWeight: 500,
                color: item.cancelled_in_partial
                  ? theme.semantic.textMuted
                  : theme.semantic.actionPrimary,
                margin: 0,
                textDecoration: item.cancelled_in_partial ? 'line-through' : 'none',
                flexShrink: 0,
              }}>
                ${Number(item.subtotal).toFixed(2)}
              </p>
            </div>
          ))}
        </div>


          
        {/* Totales */}
        <div style={{
          background: theme.semantic.bgCard,
          borderRadius: '12px',
          border: `0.5px solid ${theme.semantic.border}`,
          padding: '14px 20px',
          marginTop: '12px',
          marginBottom: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span style={{ color: theme.semantic.textMuted }}>Subtotal</span>
              <span style={{ color: theme.semantic.textPrimary }}>${Number(order.subtotal).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span style={{ color: theme.semantic.textMuted }}>Envío</span>
              <span style={{ color: theme.semantic.textPrimary }}>
                {Number(order.shipping_cost) === 0 ? 'Gratis' : `$${Number(order.shipping_cost).toFixed(2)}`}
              </span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '15px',
              fontWeight: 500,
              borderTop: `0.5px solid ${theme.semantic.border}`,
              paddingTop: '8px',
              marginTop: '2px',
            }}>
              <span style={{ color: theme.semantic.textPrimary }}>Total</span>
              <span style={{ color: theme.semantic.actionPrimary }}>${Number(order.total).toFixed(2)}</span>
            </div>
          </div>

                  {/* Acción — devolución */}
        {(order.status === 'delivered_to_client' || order.status === 'delivered_to_vendor') && user?.role === 'client' && (
          <div style={{
            background: theme.semantic.bgCard,
            border: `0.5px solid ${theme.semantic.border}`,
            borderRadius: '12px',
            padding: '14px 20px',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
          }}>
            <p style={{ fontSize: '13px', color: theme.semantic.textSecondary, margin: 0 }}>
              ¿Necesitas devolver este pedido?
            </p>
            <button
              onClick={handleRequestReturn}
              disabled={isActing}
              style={{
                padding: '7px 16px',
                background: 'transparent',
                color: theme.semantic.actionPrimary,
                border: `1px solid ${theme.semantic.actionPrimary}`,
                borderRadius: '8px',
                cursor: isActing ? 'not-allowed' : 'pointer',
                fontSize: '13px',
                opacity: isActing ? 0.7 : 1,
              }}
            >
              {isActing ? 'Procesando...' : 'Solicitar devolución'}
            </button>
          </div>
        )}



      </div>
    </div>
  )
}