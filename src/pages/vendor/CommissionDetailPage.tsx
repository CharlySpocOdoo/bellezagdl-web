import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { TopBar } from '../../components/TopBar'
import { getCommissionOrders } from '../../api/vendor'
import { theme } from '../../theme'
import { formatShortDate, formatMonthRange } from '../../utils/date'
import type { CommissionPeriodDetail } from '../../types'

export function CommissionDetailPage() {
  const { periodId } = useParams<{ periodId: string }>()
  const navigate = useNavigate()

  const [detail, setDetail] = useState<CommissionPeriodDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!periodId) return
    const load = async () => {
      try {
        const data = await getCommissionOrders(periodId)
        setDetail(data)
      } catch {
        navigate('/vendor?tab=comisiones', { replace: true })
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [periodId])

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: theme.semantic.bgPage }}>
        <TopBar />
        <div style={{ textAlign: 'center', padding: '48px', color: theme.semantic.textMuted }}>
          Cargando detalle...
        </div>
      </div>
    )
  }

  if (!detail) return null

  return (
    <div style={{ minHeight: '100vh', background: theme.semantic.bgPage }}>
      <TopBar />
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '16px' }}>

        {/* Volver */}
        <button
          onClick={() => navigate('/vendor?tab=comisiones')}
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
          ← Mis comisiones
        </button>

        {/* Header del período */}
        <div style={{
          background: theme.semantic.bgCard,
          borderRadius: '12px',
          border: `0.5px solid ${theme.semantic.border}`,
          padding: '16px 20px',
          marginBottom: '16px',
        }}>
          <p style={{
            fontSize: '16px',
            fontWeight: 600,
            color: theme.semantic.textPrimary,
            margin: '0 0 4px',
          }}>
            {formatMonthRange(detail.week_start, { day: 'numeric', month: 'short' })} — {formatMonthRange(detail.week_end, { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
          <p style={{ fontSize: '13px', color: theme.semantic.textMuted, margin: 0 }}>
            Tasa de comisión: {Number(detail.commission_rate).toFixed(0)}%
          </p>
        </div>

        {/* Lista de pedidos */}
        {detail.orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📋</div>
            <p style={{ color: theme.semantic.textMuted }}>No hay pedidos en este período</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {detail.orders.map((order) => (
              <div key={order.order_number} style={{
                background: theme.semantic.bgCard,
                borderRadius: '12px',
                border: `0.5px solid ${theme.semantic.border}`,
                padding: '14px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                flexWrap: 'wrap',
              }}>
                <div>
                  <p style={{
                    fontSize: '13px',
                    fontWeight: 500,
                    color: theme.semantic.textPrimary,
                    margin: '0 0 2px',
                  }}>
                    {order.order_number}
                  </p>
                  <p style={{ fontSize: '11px', color: theme.semantic.textMuted, margin: 0 }}>
                    Entregado {formatShortDate(order.delivered_at)}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '11px', color: theme.semantic.textMuted, margin: '0 0 2px' }}>
                    Total del pedido
                  </p>
                  <p style={{
                    fontSize: '14px',
                    fontWeight: 500,
                    color: theme.semantic.textPrimary,
                    margin: '0 0 6px',
                  }}>
                    ${Number(order.order_total).toFixed(2)}
                  </p>
                  <p style={{ fontSize: '11px', color: theme.semantic.textMuted, margin: '0 0 2px' }}>
                    Comisión generada
                  </p>
                  <p style={{
                    fontSize: '15px',
                    fontWeight: 600,
                    color: theme.colors.secondary[800],
                    margin: 0,
                  }}>
                    ${Number(order.commission_generated).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}

            {/* Fila de totales */}
            {(() => {
              const totalVentas = detail.orders.reduce((sum, o) => sum + Number(o.order_total), 0)
              const totalComision = detail.orders.reduce((sum, o) => sum + Number(o.commission_generated), 0)
              return (
                <div style={{
                  background: theme.colors.secondary[50],
                  borderRadius: '12px',
                  border: `0.5px solid ${theme.colors.secondary[100]}`,
                  padding: '14px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  flexWrap: 'wrap',
                }}>
                  <p style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: theme.colors.secondary[800],
                    margin: 0,
                  }}>
                    Total del período
                  </p>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '11px', color: theme.semantic.textMuted, margin: '0 0 2px' }}>
                      Total de ventas
                    </p>
                    <p style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: theme.semantic.textPrimary,
                      margin: '0 0 6px',
                    }}>
                      ${totalVentas.toFixed(2)}
                    </p>
                    <p style={{ fontSize: '11px', color: theme.semantic.textMuted, margin: '0 0 2px' }}>
                      Comisión total
                    </p>
                    <p style={{
                      fontSize: '16px',
                      fontWeight: 700,
                      color: theme.colors.secondary[800],
                      margin: 0,
                    }}>
                      ${totalComision.toFixed(2)}
                    </p>
                  </div>
                </div>
              )
            })()}
          </div>
        )}

      </div>
    </div>
  )
}
