import { useState, useEffect } from 'react'
import { TopBar } from '../../components/TopBar'
import { getVendorProfile, getVendorClients, getVendorCommissions } from '../../api/vendor'
import { getOrders, addOrderNote } from '../../api/orders'
import { theme } from '../../theme'
import type { Vendor, Client, CommissionPeriod, Order } from '../../types'

type Tab = 'clientes' | 'pedidos' | 'comisiones'

export function VendorPage() {
  const [activeTab, setActiveTab] = useState<Tab>('clientes')
  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [clients, setClients] = useState<Client[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [commissions, setCommissions] = useState<{
    current_week_commission: number
    pending_payment: number
    periods: CommissionPeriod[]
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [noteOrderId, setNoteOrderId] = useState<string | null>(null)
  const [noteText, setNoteText] = useState('')
  const [isSavingNote, setIsSavingNote] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const [vendorData, clientsData, ordersData, commissionsData] = await Promise.all([
          getVendorProfile(),
          getVendorClients(),
          getOrders(),
          getVendorCommissions(),
        ])
        setVendor(vendorData)
        setClients(clientsData)
        setOrders(ordersData)
        setCommissions(commissionsData)
      } catch (err) {
        console.error('Error cargando panel vendedor:', err)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  const handleSaveNote = async (orderId: string) => {
    if (!noteText.trim()) return
    setIsSavingNote(true)
    try {
      await addOrderNote(orderId, noteText)
      setNoteOrderId(null)
      setNoteText('')
    } catch {
      console.error('Error guardando nota')
    } finally {
      setIsSavingNote(false)
    }
  }

  const statusLabel: Record<string, string> = {
    pending: 'Pendiente',
    partially_available: 'Revisar disponibilidad',
    confirmed: 'Confirmado',
    preparing: 'Preparando',
    in_delivery: 'En camino',
    delivery_failed: 'Entrega fallida',
    delivered_to_vendor: 'Entregado al vendedor',
    delivered_to_client: 'Entregado',
    return_requested: 'Devolucion solicitada',
    cancelled: 'Cancelado',
  }

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: theme.semantic.bgPage }}>
        <TopBar />
        <div style={{ textAlign: 'center', padding: '48px', color: theme.semantic.textMuted }}>
          Cargando panel...
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: theme.semantic.bgPage }}>
      <TopBar />
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px 16px' }}>

        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 500, color: theme.semantic.textPrimary, margin: '0 0 4px' }}>
            Hola, {vendor?.first_name} 👋
          </h1>
          <p style={{ fontSize: '14px', color: theme.semantic.textMuted, margin: 0 }}>
            Codigo de invitacion: <strong>{vendor?.invitation_code}</strong>
          </p>
        </div>

        {/* Tarjetas de resumen */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
          marginBottom: '28px',
        }}>
          {[
            { label: 'Clientes en mi red', value: clients.length.toString() },
            { label: 'Comision esta semana', value: '$' + Number(commissions?.current_week_commission || 0).toFixed(2) },
            { label: 'Pendiente de cobro', value: '$' + Number(commissions?.pending_payment || 0).toFixed(2) },
            { label: 'Mi comision', value: (vendor?.commission_percentage || 0) + '%' },
          ].map((card) => (
            <div key={card.label} style={{
              background: theme.semantic.bgCard,
              borderRadius: '12px',
              border: '1px solid ' + theme.semantic.border,
              padding: '16px 20px',
            }}>
              <p style={{ fontSize: '12px', color: theme.semantic.textMuted, margin: '0 0 6px' }}>
                {card.label}
              </p>
              <p style={{ fontSize: '22px', fontWeight: 500, color: theme.semantic.textPrimary, margin: 0 }}>
                {card.value}
              </p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '4px',
          borderBottom: '1px solid ' + theme.semantic.border,
          marginBottom: '24px',
        }}>
          {(['clientes', 'pedidos', 'comisiones'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: activeTab === tab ? 500 : 400,
                color: activeTab === tab ? theme.semantic.actionPrimary : theme.semantic.textSecondary,
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === tab ? '2px solid ' + theme.semantic.actionPrimary : '2px solid transparent',
                cursor: 'pointer',
                textTransform: 'capitalize',
                marginBottom: '-1px',
              }}
            >
              {tab === 'clientes' ? 'Mis clientes' : tab === 'pedidos' ? 'Pedidos de mi red' : 'Mis comisiones'}
            </button>
          ))}
        </div>

        {/* Tab — Clientes */}
        {activeTab === 'clientes' && (
          <div>
            {/* Link de invitacion */}
            <div style={{
              background: theme.colors.primary[50],
              border: '1px solid ' + theme.colors.primary[100],
              borderRadius: '12px',
              padding: '16px 20px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 500, color: theme.colors.primary[800], margin: '0 0 4px' }}>
                  Tu link de invitacion
                </p>
                <p style={{ fontSize: '12px', color: theme.colors.primary[600], margin: 0, wordBreak: 'break-all', fontFamily: 'monospace' }}>
                  {vendor?.invitation_link}
                </p>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(vendor?.invitation_link || '')
                }}
                style={{
                  padding: '8px 16px',
                  background: theme.semantic.actionPrimary,
                  color: theme.semantic.textOnPrimary,
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  whiteSpace: 'nowrap',
                }}
              >
                Copiar link
              </button>
            </div>

            {clients.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>👥</div>
                <p style={{ color: theme.semantic.textMuted }}>Aun no tienes clientes — comparte tu link de invitacion</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {clients.map((client) => (
                  <div key={client.id} style={{
                    background: theme.semantic.bgCard,
                    borderRadius: '12px',
                    border: '1px solid ' + theme.semantic.border,
                    padding: '16px 20px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                    gap: '8px',
                  }}>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: 500, color: theme.semantic.textPrimary, margin: '0 0 2px' }}>
                        {client.first_name} {client.last_name}
                      </p>
                      <p style={{ fontSize: '12px', color: theme.semantic.textMuted, margin: 0 }}>
                        {client.phone}
                      </p>
                    </div>
                    <div>
                      <p style={{ fontSize: '12px', color: theme.semantic.textMuted, margin: '0 0 2px' }}>
                        Direccion de entrega
                      </p>
                      <p style={{ fontSize: '13px', color: theme.semantic.textSecondary, margin: 0 }}>
                        {client.delivery_address || 'Sin direccion'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab — Pedidos */}
        {activeTab === 'pedidos' && (
          <div>
            {orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>📦</div>
                <p style={{ color: theme.semantic.textMuted }}>No hay pedidos en tu red todavia</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {orders.map((order) => (
                  <div key={order.id} style={{
                    background: theme.semantic.bgCard,
                    borderRadius: '12px',
                    border: '1px solid ' + theme.semantic.border,
                    padding: '16px 20px',
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '8px',
                      marginBottom: noteOrderId === order.id ? '12px' : 0,
                    }}>
                      <div>
                        <p style={{ fontSize: '14px', fontWeight: 500, color: theme.semantic.textPrimary, margin: '0 0 2px' }}>
                          {order.order_number}
                        </p>
                        <p style={{ fontSize: '12px', color: theme.semantic.textMuted, margin: 0 }}>
                          {new Date(order.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          background: theme.colors.neutral[50],
                          color: theme.colors.neutral[800],
                        }}>
                          {statusLabel[order.status] || order.status}
                        </span>
                        <span style={{ fontSize: '15px', fontWeight: 500, color: theme.semantic.textPrimary }}>
                          ${Number(order.total).toFixed(2)}
                        </span>
                        <button
                          onClick={() => {
                            setNoteOrderId(noteOrderId === order.id ? null : order.id)
                            setNoteText('')
                          }}
                          style={{
                            padding: '6px 12px',
                            fontSize: '12px',
                            color: theme.semantic.textSecondary,
                            background: 'transparent',
                            border: '1px solid ' + theme.semantic.border,
                            borderRadius: '8px',
                            cursor: 'pointer',
                          }}
                        >
                          + Nota
                        </button>
                      </div>
                    </div>

                    {/* Input de nota */}
                    {noteOrderId === order.id && (
                      <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                        <input
                          type="text"
                          value={noteText}
                          onChange={(e) => setNoteText(e.target.value)}
                          placeholder="Escribe una nota interna..."
                          style={{
                            flex: 1,
                            padding: '8px 12px',
                            fontSize: '13px',
                            border: '1px solid ' + theme.semantic.border,
                            borderRadius: '8px',
                            outline: 'none',
                            color: theme.semantic.textPrimary,
                          }}
                        />
                        <button
                          onClick={() => handleSaveNote(order.id)}
                          disabled={isSavingNote || !noteText.trim()}
                          style={{
                            padding: '8px 16px',
                            background: theme.semantic.actionPrimary,
                            color: theme.semantic.textOnPrimary,
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            opacity: isSavingNote || !noteText.trim() ? 0.6 : 1,
                          }}
                        >
                          {isSavingNote ? 'Guardando...' : 'Guardar'}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab — Comisiones */}
        {activeTab === 'comisiones' && (
          <div>
            {!commissions?.periods || commissions.periods.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>💰</div>
                <p style={{ color: theme.semantic.textMuted }}>Aun no tienes liquidaciones registradas</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {commissions.periods.map((period) => (
                  <div key={period.id} style={{
                    background: theme.semantic.bgCard,
                    borderRadius: '12px',
                    border: '1px solid ' + theme.semantic.border,
                    padding: '16px 20px',
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '12px',
                      marginBottom: '12px',
                    }}>
                      <div>
                        <p style={{ fontSize: '14px', fontWeight: 500, color: theme.semantic.textPrimary, margin: '0 0 2px' }}>
                          Semana del {new Date(period.week_start).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })} al {new Date(period.week_end).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                        <p style={{ fontSize: '12px', color: theme.semantic.textMuted, margin: 0 }}>
                         
                          Tasa: {Number(period.commission_rate).toFixed(0)}%


                        </p>
                      </div>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 500,
                        background: period.status === 'paid' ? '#EAF3DE' : theme.colors.accent[50],
                        color: period.status === 'paid' ? '#27500A' : theme.colors.accent[800],
                      }}>
                        {period.status === 'paid' ? 'Pagado' : 'Pendiente'}
                      </span>
                    </div>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                      gap: '8px',
                    }}>
                      {[
                        { label: 'Ventas brutas', value: '$' + Number(period.gross_sales_amount).toFixed(2) },
                        { label: 'Comision bruta', value: '$' + Number(period.commission_amount).toFixed(2) },
                        { label: 'Costo envio', value: '-$' + Number(period.shipping_charges).toFixed(2) },
                        { label: 'A cobrar', value: '$' + Number(period.net_commission).toFixed(2) },
                      ].map((item) => (
                        <div key={item.label} style={{
                          background: theme.colors.neutral[50],
                          borderRadius: '8px',
                          padding: '10px 12px',
                        }}>
                          <p style={{ fontSize: '11px', color: theme.semantic.textMuted, margin: '0 0 2px' }}>{item.label}</p>
                          <p style={{ fontSize: '14px', fontWeight: 500, color: theme.semantic.textPrimary, margin: 0 }}>{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}