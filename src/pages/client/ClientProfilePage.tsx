import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { TopBar } from '../../components/TopBar'
import { getClientProfile, updateClientProfile } from '../../api/clientProfile'
import { theme } from '../../theme'
import type { Client } from '../../types'

export function ClientProfilePage() {
  const navigate = useNavigate()

  const [client, setClient] = useState<Client | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState({ phone: '', delivery_address: '' })
  const [isSaving, setIsSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getClientProfile()
        setClient(data)
        setForm({ phone: data.phone || '', delivery_address: data.delivery_address || '' })
      } catch {
        // Si falla la carga, volver al catálogo
        navigate('/catalog')
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  const handleSave = async () => {
    setErrorMsg('')
    if (form.phone && !/^\d{10}$/.test(form.phone.replace(/\s/g, ''))) {
      setErrorMsg('El teléfono debe tener exactamente 10 dígitos.')
      return
    }
    setIsSaving(true)
    try {
      const res = await updateClientProfile(form)
      setClient(prev => ({ ...prev!, ...res }))
      setIsEditing(false)
      setSuccessMsg('Perfil actualizado correctamente.')
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch {
      setErrorMsg('No se pudo actualizar el perfil. Intenta de nuevo.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: theme.semantic.bgPage }}>
        <TopBar />
        <div style={{ textAlign: 'center', padding: '48px', color: theme.semantic.textMuted }}>
          Cargando perfil...
        </div>
      </div>
    )
  }

  if (!client) return null

  return (
    <div style={{ minHeight: '100vh', background: theme.semantic.bgPage }}>
      <TopBar />
      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '16px' }}>

        {/* Volver */}
        <button
          onClick={() => navigate('/catalog')}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: theme.semantic.textMuted,
            fontSize: '14px',
            padding: '0 0 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          ← Volver al catálogo
        </button>

        {successMsg && (
          <div style={{
            background: '#EAF3DE',
            border: '0.5px solid #C0DD97',
            borderRadius: '10px',
            padding: '10px 16px',
            marginBottom: '12px',
            fontSize: '13px',
            color: '#3B6D11',
          }}>
            {successMsg}
          </div>
        )}

        {errorMsg && (
          <div style={{
            background: '#FCEBEB',
            border: '0.5px solid #F7C1C1',
            borderRadius: '10px',
            padding: '10px 16px',
            marginBottom: '12px',
            fontSize: '13px',
            color: '#A32D2D',
          }}>
            {errorMsg}
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
              Mi perfil
            </h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
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

            {/* Nombre — solo lectura */}
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
              <p style={{ fontSize: '14px', color: theme.semantic.textPrimary, margin: 0 }}>
                {`${client.first_name} ${client.last_name}`.trim() || '—'}
              </p>
            </div>

            {/* Email — solo lectura */}
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
                {client.email || '—'}
              </p>
            </div>

            {/* Teléfono — editable */}
            <div>
              <p style={{
                fontSize: '11px',
                color: theme.semantic.textMuted,
                margin: '0 0 4px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                Teléfono
              </p>
              {isEditing ? (
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="10 dígitos"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '14px',
                    border: `1.5px solid ${theme.semantic.border}`,
                    borderRadius: '8px',
                    outline: 'none',
                    color: theme.semantic.textPrimary,
                    boxSizing: 'border-box',
                    background: theme.semantic.bgInput,
                  }}
                />
              ) : (
                <p style={{
                  fontSize: '14px',
                  color: form.phone ? theme.semantic.textPrimary : theme.semantic.textMuted,
                  margin: 0,
                }}>
                  {form.phone || '—'}
                </p>
              )}
            </div>

            {/* Dirección de entrega — editable */}
            <div>
              <p style={{
                fontSize: '11px',
                color: theme.semantic.textMuted,
                margin: '0 0 4px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                Dirección de entrega
              </p>
              {isEditing ? (
                <input
                  type="text"
                  value={form.delivery_address}
                  onChange={(e) => setForm({ ...form, delivery_address: e.target.value })}
                  placeholder="Calle, número, colonia..."
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '14px',
                    border: `1.5px solid ${theme.semantic.border}`,
                    borderRadius: '8px',
                    outline: 'none',
                    color: theme.semantic.textPrimary,
                    boxSizing: 'border-box',
                    background: theme.semantic.bgInput,
                  }}
                />
              ) : (
                <p style={{
                  fontSize: '14px',
                  color: form.delivery_address ? theme.semantic.textPrimary : theme.semantic.textMuted,
                  margin: 0,
                }}>
                  {form.delivery_address || '—'}
                </p>
              )}
            </div>

          </div>

          {isEditing && (
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button
                onClick={handleSave}
                disabled={isSaving}
                style={{
                  padding: '9px 20px',
                  background: theme.colors.secondary[800],
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  fontSize: '13px',
                  fontWeight: 500,
                  opacity: isSaving ? 0.7 : 1,
                }}
              >
                {isSaving ? 'Guardando...' : 'Guardar cambios'}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false)
                  setErrorMsg('')
                  setForm({
                    phone: client.phone || '',
                    delivery_address: client.delivery_address || '',
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
    </div>
  )
}
