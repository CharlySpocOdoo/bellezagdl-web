import { TopBar } from '../../components/TopBar'
import { getVendorProfile, getVendorClients, getVendorCommissions } from '../../api/vendor'
import { getOrders, addOrderNote } from '../../api/orders'
import apiClient from '../../api/client'
import { theme } from '../../theme'
import type { Vendor, Client, CommissionPeriod, Order } from '../../types'
import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { formatShortDate, formatMonthRange } from '../../utils/date'

type Tab = 'clientes' | 'pedidos' | 'comisiones' | 'perfil'

export function VendorPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<Tab>('clientes')

  useEffect(() => {
    const tab = searchParams.get('tab') as Tab
    if (tab) setActiveTab(tab)
  }, [searchParams])

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
  const [noteSavedId, setNoteSavedId] = useState<string | null>(null)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({
    display_name: '',
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
    workplace: '',
  })
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState('')
  const [profileError, setProfileError] = useState('')

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
        setProfileForm({
          display_name: vendorData.display_name || '',
          first_name: vendorData.first_name || '',
          last_name: vendorData.last_name || '',
          phone: vendorData.phone || '',
          address: vendorData.address || '',
          workplace: vendorData.workplace || '',
        })
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
      const updatedOrder = await addOrderNote(orderId, noteText)
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, vendor_notes: updatedOrder.vendor_notes } : o))
      setNoteOrderId(null)
      setNoteText('')
      setNoteSavedId(orderId)
      setTimeout(() => setNoteSavedId(null), 3000)
    } catch {
      console.error('Error guardando nota')
    } finally {
      setIsSavingNote(false)
    }
  }

  const handleSaveProfile = async () => {
    setProfileError('')
    if (!profileForm.first_name.trim()) {
      setProfileError('El nombre es requerido.')
      return
    }
    if (!profileForm.last_name.trim()) {
      setProfileError('El apellido es requerido.')
      return
    }
    if (profileForm.phone && !/^\d{10}$/.test(profileForm.phone.replace(/\s/g, ''))) {
      setProfileError('El teléfono debe tener exactamente 10 dígitos.')
      return
    }
    setIsSavingProfile(true)
    try {
      const res = await apiClient.patch('/vendors/me', profileForm)
      setVendor(res.data)
      setIsEditingProfile(false)
      setProfileSuccess('Perfil actualizado correctamente.')
      setTimeout(() => setProfileSuccess(''), 3000)
    } catch {
      setProfileError('No se pudo actualizar el perfil. Intenta de nuevo.')
    } finally {
      setIsSavingProfile(false)
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
    return_requested: 'Devolución solicitada',
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
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '16px' }}>

{/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '20px',
        }}>
          <div>
            <h1 style={{
              fontSize: '20px',
              fontWeight: 600,
              color: theme.semantic.textPrimary,
              margin: '0 0 6px',
            }}>
              Hola, {vendor?.first_name} 👋
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <p style={{ fontSize: '13px', color: theme.semantic.textMuted, margin: 0 }}>
                Código de invitación:
              </p>
              <span style={{
                fontSize: '13px',
                fontWeight: 600,
                color: theme.colors.secondary[800],
                background: theme.colors.secondary[50],
                padding: '2px 10px',
                borderRadius: '20px',
                letterSpacing: '1px',
                fontFamily: 'monospace',
              }}>
                {vendor?.invitation_code}
              </span>
            </div>
          </div>

          {/* Acceso directo a Mi Perfil */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('perfil')
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              background: activeTab === 'perfil' ? theme.colors.secondary[50] : 'transparent',
              border: `1.5px solid ${activeTab === 'perfil' ? theme.colors.secondary[800] : theme.semantic.border}`,
              borderRadius: '12px',
              padding: '8px 12px',
              cursor: 'pointer',
            }}
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'rgba(232,99,122,0.15)',
              border: '1.5px solid rgba(232,99,122,0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E8637A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <span style={{
              fontSize: '10px',
              color: activeTab === 'perfil' ? theme.colors.secondary[800] : theme.semantic.textMuted,
              fontWeight: activeTab === 'perfil' ? 600 : 400,
              whiteSpace: 'nowrap',
            }}>
              Mi Perfil
            </span>
          </button>
        </div>

        {/* Tarjetas de resumen */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '10px',
          marginBottom: '20px',
        }}>
          {[
            { label: 'Clientes en mi red', value: clients.length.toString(), accent: false },
            { label: 'Comisión esta semana', value: '$' + Number(commissions?.current_week_commission || 0).toFixed(2), accent: true },
            { label: 'Pendiente de cobro', value: '$' + Number(commissions?.pending_payment || 0).toFixed(2), accent: true },
            { label: 'Mi comisión', value: (vendor?.commission_percentage || 0) + '%', accent: false },
          ].map((card) => (
            <div key={card.label} style={{
              background: theme.semantic.bgCard,
              borderRadius: '12px',
              border: `0.5px solid ${theme.semantic.border}`,
              padding: '14px 16px',
            }}>
              <p style={{
                fontSize: '11px',
                color: theme.semantic.textMuted,
                margin: '0 0 6px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                {card.label}
              </p>
              <p style={{
                fontSize: '22px',
                fontWeight: 600,
                color: card.accent ? theme.semantic.actionPrimary : theme.colors.secondary[800],
                margin: 0,
              }}>
                {card.value}
              </p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '6px',
          marginBottom: '20px',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          paddingBottom: '2px',
        }}>
          {(['clientes', 'pedidos', 'comisiones'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '7px 16px',
                fontSize: '13px',
                fontWeight: activeTab === tab ? 600 : 400,
                color: activeTab === tab ? 'white' : theme.semantic.textSecondary,
                background: activeTab === tab ? theme.colors.secondary[800] : 'transparent',
                border: `1.5px solid ${activeTab === tab ? theme.colors.secondary[800] : theme.semantic.border}`,
                borderRadius: '20px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              {tab === 'clientes' ? 'Mis Clientes' :
               tab === 'pedidos' ? 'Pedidos' :
               tab === 'comisiones' ? 'Mis Comisiones' :
               'Mi Perfil'}
            </button>
          ))}
        </div>

        {/* Tab — Clientes */}
        {activeTab === 'clientes' && (
          <div>
            <div style={{
              background: theme.colors.secondary[50],
              border: `0.5px solid ${theme.colors.secondary[100]}`,
              borderRadius: '12px',
              padding: '14px 16px',
              marginBottom: '16px',
            }}>
              <p style={{
                fontSize: '12px',
                fontWeight: 500,
                color: theme.colors.secondary[800],
                margin: '0 0 4px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                Tu link de invitación
              </p>
              <p style={{
                fontSize: '11px',
                color: theme.colors.secondary[600],
                margin: '0 0 10px',
                wordBreak: 'break-all',
                fontFamily: 'monospace',
              }}>
                {vendor?.invitation_link}
              </p>
              <button
                onClick={() => navigator.clipboard.writeText(vendor?.invitation_link || '')}
                style={{
                  padding: '7px 16px',
                  background: theme.colors.secondary[800],
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 500,
                }}
              >
                Copiar link
              </button>
            </div>

            {clients.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>👥</div>
                <p style={{ color: theme.semantic.textMuted }}>Aún no tienes clientes — comparte tu link de invitación</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {clients.map((client) => (
                  <div key={client.id} style={{
                    background: theme.semantic.bgCard,
                    borderRadius: '12px',
                    border: `0.5px solid ${theme.semantic.border}`,
                    padding: '14px 16px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                      <div>
                        <p style={{ fontSize: '14px', fontWeight: 500, color: theme.semantic.textPrimary, margin: '0 0 2px' }}>
                          {client.first_name} {client.last_name}
                        </p>
                        <p style={{ fontSize: '12px', color: theme.semantic.textMuted, margin: 0 }}>
                          {client.phone}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '11px', color: theme.semantic.textMuted, margin: '0 0 2px' }}>
                          Dirección de entrega
                        </p>
                        <p style={{ fontSize: '12px', color: theme.semantic.textSecondary, margin: 0 }}>
                          {client.delivery_address || 'Sin dirección'}
                        </p>
                      </div>
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
                <p style={{ color: theme.semantic.textMuted }}>No hay pedidos en tu red todavía</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {orders.map((order) => (
                  <div
                    key={order.id}
                    style={{
                      background: theme.semantic.bgCard,
                      borderRadius: '12px',
                      border: `0.5px solid ${theme.semantic.border}`,
                      padding: '14px 16px',
                      cursor: 'pointer',
                    }}
                    onClick={(e) => {
                      if ((e.target as HTMLElement).closest('button')) return
                      if ((e.target as HTMLElement).closest('input')) return
                      navigate('/orders/' + order.id)
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(30,58,95,0.08)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none' }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: '8px',
                      marginBottom: '10px',
                    }}>
                      <div>
                        <p style={{ fontSize: '13px', fontWeight: 500, color: theme.semantic.textPrimary, margin: '0 0 2px' }}>
                          ORD-{order.order_number.split('-').slice(-1)[0]}
                        </p>
                        <p style={{ fontSize: '12px', color: theme.semantic.textMuted, margin: '0 0 1px' }}>
                          {order.client_name || 'Cliente'}
                        </p>
                        <p style={{ fontSize: '11px', color: theme.semantic.textMuted, margin: 0 }}>
                          {formatShortDate(order.created_at)}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '11px', color: theme.semantic.textMuted, margin: '0 0 3px' }}>Total</p>
                        <p style={{ fontSize: '15px', fontWeight: 600, color: theme.semantic.actionPrimary, margin: 0 }}>
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
                      gap: '8px',
                      flexWrap: 'wrap',
                    }}>
                      <span style={{
                        padding: '3px 10px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: 500,
                        background: theme.colors.neutral[50],
                        color: theme.colors.neutral[800],
                      }}>
                        {statusLabel[order.status] || order.status}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          onClick={() => {
                            setNoteOrderId(noteOrderId === order.id ? null : order.id)
                            setNoteText('')
                          }}
                          style={{
                            padding: '4px 12px',
                            fontSize: '12px',
                            color: theme.semantic.textSecondary,
                            background: 'transparent',
                            border: `1px solid ${theme.semantic.border}`,
                            borderRadius: '8px',
                            cursor: 'pointer',
                          }}
                        >
                          + Nota
                        </button>
                        {noteSavedId === order.id && (
                          <span style={{
                            fontSize: '11px',
                            color: '#27500A',
                            background: '#EAF3DE',
                            padding: '3px 10px',
                            borderRadius: '8px',
                          }}>
                            ✓ Guardada
                          </span>
                        )}
                      </div>
                    </div>

                    {order.vendor_notes && (
                      <div style={{
                        marginTop: '8px',
                        padding: '8px 12px',
                        background: theme.colors.secondary[50],
                        borderRadius: '8px',
                        border: `0.5px solid ${theme.colors.secondary[100]}`,
                      }}>
                        <p style={{ fontSize: '11px', color: theme.colors.secondary[600], margin: '0 0 2px', fontWeight: 500 }}>
                          Nota
                        </p>
                        <p style={{ fontSize: '13px', color: theme.colors.secondary[800], margin: 0 }}>
                          {order.vendor_notes}
                        </p>
                      </div>
                    )}

                    {noteOrderId === order.id && (
                      <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                        <input
                          type="text"
                          value={noteText}
                          onChange={(e) => setNoteText(e.target.value)}
                          placeholder="Escribe una nota interna..."
                          style={{
                            flex: 1,
                            padding: '8px 12px',
                            fontSize: '13px',
                            border: `1px solid ${theme.semantic.border}`,
                            borderRadius: '8px',
                            outline: 'none',
                            color: theme.semantic.textPrimary,
                          }}
                        />
                        <button
                          onClick={() => handleSaveNote(order.id)}
                          disabled={isSavingNote || !noteText.trim()}
                          style={{
                            padding: '8px 14px',
                            background: theme.colors.secondary[800],
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            opacity: isSavingNote || !noteText.trim() ? 0.6 : 1,
                          }}
                        >
                          {isSavingNote ? '...' : 'Guardar'}
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
                <p style={{ color: theme.semantic.textMuted }}>Aún no tienes liquidaciones registradas</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {commissions.periods.map((period) => (
                  <div key={period.id} style={{
                    background: theme.semantic.bgCard,
                    borderRadius: '12px',
                    border: `0.5px solid ${theme.semantic.border}`,
                    padding: '14px 16px',
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: '12px',
                      marginBottom: '12px',
                    }}>
                      <div>
                        <p style={{ fontSize: '13px', fontWeight: 500, color: theme.semantic.textPrimary, margin: '0 0 2px' }}>
                          {formatMonthRange(period.week_start, { day: 'numeric', month: 'short' })} — {formatMonthRange(period.week_end, { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                        <p style={{ fontSize: '11px', color: theme.semantic.textMuted, margin: 0 }}>
                          Comisión: {Number(period.commission_rate).toFixed(0)}%
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{
                          padding: '3px 10px',
                          borderRadius: '20px',
                          fontSize: '11px',
                          fontWeight: 500,
                          background: period.status === 'paid' ? '#EAF3DE' : '#FAEEDA',
                          color: period.status === 'paid' ? '#3B6D11' : '#854F0B',
                          display: 'inline-block',
                          marginBottom: '3px',
                        }}>
                          {period.status === 'paid' ? 'Pagado' : 'Por pagar'}
                        </span>
                        {period.status === 'paid' && period.paid_at && (
                          <p style={{ fontSize: '11px', color: theme.semantic.textMuted, margin: 0 }}>
                            {formatShortDate(period.paid_at)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: '8px',
                    }}>
                      {[
                        { label: 'Base de cálculo', value: '$' + Number(period.commission_base_amount).toFixed(2), highlight: false },
                        { label: 'Comisión bruta', value: '$' + Number(period.commission_amount).toFixed(2), highlight: false },
                        { label: 'Costo envío', value: '-$' + Number(period.shipping_charges).toFixed(2), highlight: false },
                        { label: 'A cobrar', value: '$' + Number(period.net_commission).toFixed(2), highlight: true },
                      ].map((item) => (
                        <div key={item.label} style={{
                          background: item.highlight ? theme.colors.secondary[50] : theme.colors.neutral[50],
                          borderRadius: '8px',
                          padding: '10px 12px',
                          border: item.highlight ? `0.5px solid ${theme.colors.secondary[100]}` : 'none',
                        }}>
                          <p style={{ fontSize: '11px', color: theme.semantic.textMuted, margin: '0 0 2px' }}>
                            {item.label}
                          </p>
                          <p style={{
                            fontSize: '14px',
                            fontWeight: 500,
                            color: item.highlight ? theme.colors.secondary[800] : theme.semantic.textPrimary,
                            margin: 0,
                          }}>
                            {item.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab — Perfil */}
        {activeTab === 'perfil' && (
          <div style={{ maxWidth: '480px' }}>

            {profileSuccess && (
              <div style={{
                background: '#EAF3DE',
                border: '0.5px solid #C0DD97',
                borderRadius: '10px',
                padding: '10px 16px',
                marginBottom: '12px',
                fontSize: '13px',
                color: '#3B6D11',
              }}>
                {profileSuccess}
              </div>
            )}

            {profileError && (
              <div style={{
                background: '#FCEBEB',
                border: '0.5px solid #F7C1C1',
                borderRadius: '10px',
                padding: '10px 16px',
                marginBottom: '12px',
                fontSize: '13px',
                color: '#A32D2D',
              }}>
                {profileError}
              </div>
            )}

            <div style={{
              background: theme.semantic.bgCard,
              borderRadius: '12px',
              border: `0.5px solid ${theme.semantic.border}`,
              padding: '20px',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '20px',
              }}>
                <h2 style={{ fontSize: '15px', fontWeight: 500, color: theme.semantic.textPrimary, margin: 0 }}>
                  Mis datos
                </h2>
                {!isEditingProfile && (
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    style={{
                      padding: '5px 14px',
                      fontSize: '12px',
                      color: theme.colors.secondary[800],
                      background: theme.colors.secondary[50],
                      border: `0.5px solid ${theme.colors.secondary[100]}`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 500,
                    }}
                  >
                    Editar
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

                {/* Nombre completo */}
                <div>
                  <p style={{
                    fontSize: '11px',
                    color: theme.semantic.textMuted,
                    margin: '0 0 4px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    Nombre
                  </p>
                  {isEditingProfile ? (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        value={profileForm.first_name}
                        onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
                        placeholder="Nombre"
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          fontSize: '14px',
                          border: `1.5px solid ${theme.semantic.border}`,
                          borderRadius: '8px',
                          outline: 'none',
                          color: theme.semantic.textPrimary,
                          boxSizing: 'border-box' as const,
                          background: theme.semantic.bgInput,
                        }}
                      />
                      <input
                        type="text"
                        value={profileForm.last_name}
                        onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
                        placeholder="Apellido"
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          fontSize: '14px',
                          border: `1.5px solid ${theme.semantic.border}`,
                          borderRadius: '8px',
                          outline: 'none',
                          color: theme.semantic.textPrimary,
                          boxSizing: 'border-box' as const,
                          background: theme.semantic.bgInput,
                        }}
                      />
                    </div>
                  ) : (
                    <p style={{ fontSize: '14px', color: theme.semantic.textPrimary, margin: 0 }}>
                      {`${profileForm.first_name} ${profileForm.last_name}`.trim() || '—'}
                    </p>
                  )}
                </div>

                {/* Teléfono y Dirección */}
                {[
                  { label: 'Teléfono', field: 'phone' as const },
                  { label: 'Dirección', field: 'address' as const },
                ].map((item) => (
                  <div key={item.field}>
                    <p style={{
                      fontSize: '11px',
                      color: theme.semantic.textMuted,
                      margin: '0 0 4px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}>
                      {item.label}
                    </p>
                    {isEditingProfile ? (
                      <input
                        type="text"
                        value={profileForm[item.field]}
                        onChange={(e) => setProfileForm({ ...profileForm, [item.field]: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          fontSize: '14px',
                          border: `1.5px solid ${theme.semantic.border}`,
                          borderRadius: '8px',
                          outline: 'none',
                          color: theme.semantic.textPrimary,
                          boxSizing: 'border-box' as const,
                          background: theme.semantic.bgInput,
                        }}
                      />
                    ) : (
                      <p style={{
                        fontSize: '14px',
                        color: profileForm[item.field] ? theme.semantic.textPrimary : theme.semantic.textMuted,
                        margin: 0,
                      }}>
                        {profileForm[item.field] || '—'}
                      </p>
                    )}
                  </div>
                ))}

                {/* Email */}
                <div>
                  <p style={{
                    fontSize: '11px',
                    color: theme.semantic.textMuted,
                    margin: '0 0 4px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    Email
                  </p>
                  <p style={{ fontSize: '14px', color: theme.semantic.textSecondary, margin: 0 }}>
                    {vendor?.email || '—'}
                  </p>
                </div>

                {/* Código de invitación */}
                <div>
                  <p style={{
                    fontSize: '11px',
                    color: theme.semantic.textMuted,
                    margin: '0 0 4px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    Código de invitación
                  </p>
                  <span style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: theme.colors.secondary[800],
                    background: theme.colors.secondary[50],
                    padding: '3px 10px',
                    borderRadius: '20px',
                    fontFamily: 'monospace',
                    letterSpacing: '1px',
                  }}>
                    {vendor?.invitation_code || '—'}
                  </span>
                </div>

              </div>

              {isEditingProfile && (
                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                  <button
                    onClick={handleSaveProfile}
                    disabled={isSavingProfile}
                    style={{
                      padding: '9px 20px',
                      background: theme.colors.secondary[800],
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: isSavingProfile ? 'not-allowed' : 'pointer',
                      fontSize: '13px',
                      fontWeight: 500,
                      opacity: isSavingProfile ? 0.7 : 1,
                    }}
                  >
                    {isSavingProfile ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingProfile(false)
                      setProfileError('')
                      setProfileForm({
                        display_name: vendor?.display_name || '',
                        first_name: vendor?.first_name || '',
                        last_name: vendor?.last_name || '',
                        phone: vendor?.phone || '',
                        address: vendor?.address || '',
                        workplace: vendor?.workplace || '',
                      })
                    }}
                    style={{
                      padding: '9px 20px',
                      background: 'transparent',
                      color: theme.semantic.textSecondary,
                      border: `1px solid ${theme.semantic.border}`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '13px',
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}