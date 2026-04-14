import { TopBar } from '../../components/TopBar'
import { getVendorProfile, getVendorClients, getVendorCommissions } from '../../api/vendor'
import { getOrders, addOrderNote } from '../../api/orders'
import apiClient from '../../api/client'
import { theme } from '../../theme'
import type { Vendor, Client, CommissionPeriod, Order } from '../../types'
import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'


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
      await addOrderNote(orderId, noteText)
      setNoteOrderId(null)
      setNoteText('')
      setNoteSavedId(orderId)
      setTimeout(() => setNoteSavedId(null), 3000)
      const updatedOrders = await getOrders()
      setOrders(updatedOrders)
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
    setProfileError('')
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
          {(['clientes', 'pedidos', 'comisiones', 'perfil'] as Tab[]).map((tab) => (
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
              {tab === 'clientes' ? 'Mis clientes' : tab === 'pedidos' ? 'Pedidos de mi red' : tab === 'comisiones' ? 'Mis comisiones' : 'Mi perfil'}
            </button>
          ))}
        </div>

        {/* Tab — Clientes */}
        {activeTab === 'clientes' && (
          <div>
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
                onClick={() => { navigator.clipboard.writeText(vendor?.invitation_link || '') }}
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

                  <div
                    key={order.id}
                    style={{
                      background: theme.semantic.bgCard,
                      borderRadius: '12px',
                      border: '1px solid ' + theme.semantic.border,
                      padding: '16px 20px',
                      cursor: 'pointer',
                    }}
                    onClick={(e) => {
                      // Solo navegar si no se hizo clic en el botón de nota
                      if ((e.target as HTMLElement).closest('button')) return
                      navigate('/orders/' + order.id)
                    }}
                  >


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
                        <p style={{ fontSize: '12px', color: theme.semantic.textMuted, margin: '0 0 2px' }}>
                          {order.client_name || 'Cliente'}
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
                        {noteSavedId === order.id && (
                          <span style={{
                            fontSize: '12px',
                            color: '#27500A',
                            background: '#EAF3DE',
                            padding: '4px 10px',
                            borderRadius: '8px',
                          }}>
                            ✓ Nota guardada
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
                        border: '1px solid ' + theme.colors.secondary[100],
                      }}>
                        <p style={{ fontSize: '11px', color: theme.colors.secondary[600], margin: '0 0 2px', fontWeight: 500 }}>
                          Nota guardada
                        </p>
                        <p style={{ fontSize: '13px', color: theme.colors.secondary[800], margin: 0 }}>
                          {order.vendor_notes}
                        </p>
                      </div>
                    )}

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

        {/* Tab — Perfil */}
        {activeTab === 'perfil' && (
          <div style={{ maxWidth: '560px' }}>

            {profileSuccess && (
              <div style={{
                background: '#EAF3DE',
                border: '1px solid #C0DD97',
                borderRadius: '8px',
                padding: '12px 16px',
                marginBottom: '16px',
                fontSize: '14px',
                color: '#27500A',
              }}>
                {profileSuccess}
              </div>
            )}

            {profileError && (
              <div style={{
                background: theme.semantic.statusAlert,
                border: '1px solid ' + theme.colors.accent[100],
                borderRadius: '8px',
                padding: '12px 16px',
                marginBottom: '16px',
                fontSize: '14px',
                color: theme.semantic.statusAlertText,
              }}>
                {profileError}
              </div>
            )}

            <div style={{
              background: theme.semantic.bgCard,
              borderRadius: '12px',
              border: '1px solid ' + theme.semantic.border,
              padding: '24px',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '20px',
              }}>
                <h2 style={{ fontSize: '16px', fontWeight: 500, color: theme.semantic.textPrimary, margin: 0 }}>
                  Mis datos
                </h2>

                {/* Editar perfil — pendiente de endpoint en backend */}
                {!isEditingProfile && (
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    style={{
                      padding: '6px 16px',
                      fontSize: '13px',
                      color: theme.semantic.actionPrimary,
                      background: theme.semantic.actionPrimaryLight,
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                    }}
                  >
                    Editar
                  </button>
                )}

              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { label: 'Nombre para mostrar', field: 'display_name' as const },
                  { label: 'Nombre', field: 'first_name' as const },
                  { label: 'Apellido', field: 'last_name' as const },
                  { label: 'Teléfono', field: 'phone' as const },
                  { label: 'Dirección', field: 'address' as const },
                  { label: 'Lugar de trabajo', field: 'workplace' as const },
                ].map((item) => (
                  <div key={item.field}>
                    <p style={{ fontSize: '12px', color: theme.semantic.textMuted, margin: '0 0 4px' }}>
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
                          border: '1px solid ' + theme.semantic.border,
                          borderRadius: '8px',
                          outline: 'none',
                          color: theme.semantic.textPrimary,
                          boxSizing: 'border-box' as const,
                        }}
                      />
                    ) : (
                      <p style={{ fontSize: '14px', color: theme.semantic.textPrimary, margin: 0 }}>
                        {profileForm[item.field] || '—'}
                      </p>
                    )}
                  </div>
                ))}

                <div>
                  <p style={{ fontSize: '12px', color: theme.semantic.textMuted, margin: '0 0 4px' }}>
                    Email
                  </p>
                  <p style={{ fontSize: '14px', color: theme.semantic.textSecondary, margin: 0 }}>
                    {vendor?.email || '—'}
                  </p>
                </div>

                <div>
                  <p style={{ fontSize: '12px', color: theme.semantic.textMuted, margin: '0 0 4px' }}>
                    Código de invitación
                  </p>
                  <p style={{ fontSize: '14px', fontWeight: 500, color: theme.semantic.textPrimary, margin: 0, fontFamily: 'monospace' }}>
                    {vendor?.invitation_code || '—'}
                  </p>
                </div>
              </div>

              {isEditingProfile && (
                <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                  <button
                    onClick={handleSaveProfile}
                    disabled={isSavingProfile}
                    style={{
                      padding: '10px 24px',
                      background: theme.semantic.actionPrimary,
                      color: theme.semantic.textOnPrimary,
                      border: 'none',
                      borderRadius: '8px',
                      cursor: isSavingProfile ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
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
                      // Restaurar datos originales
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
                      padding: '10px 24px',
                      background: 'transparent',
                      color: theme.semantic.textSecondary,
                      border: '1px solid ' + theme.semantic.border,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
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