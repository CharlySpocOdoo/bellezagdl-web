import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { validateInviteToken, registerClient } from '../../api/auth'
import { Input } from '../../components/Input'
import { Button } from '../../components/Button'
import { theme } from '../../theme'

export function RegisterPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''

  const [vendorName, setVendorName] = useState('')
  const [tokenValid, setTokenValid] = useState<boolean | null>(null)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')

  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Validar el token al cargar la pantalla
  useEffect(() => {
    if (!token) {
      setTokenValid(false)
      return
    }

    const validate = async () => {
      try {
        const data = await validateInviteToken(token)
        setVendorName(data.vendor_name || 'tu vendedor')
        setTokenValid(true)
      } catch {
        setTokenValid(false)
      }
    }

    validate()
  }, [token])

  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !password || !phone || !address) {
      setError('Por favor completa todos los campos.')
      return
    }
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }
    if (!email.includes('@')) {
      setError('El email no tiene un formato válido.')
      return
    }
    setError('')
    setIsLoading(true)

    try {
      await registerClient({
        token,
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        phone,
        delivery_address: address,
      })

      // Login automático después del registro
      await login(email, password)
      navigate('/catalog')
    } catch (err: any) {
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail
        if (Array.isArray(detail)) {
          // Errores de validación de Pydantic
          const messages = detail.map((e: any) => {
            if (e.loc?.includes('email')) return 'El email no tiene un formato válido.'
            if (e.loc?.includes('password')) return 'La contraseña debe tener al menos 8 caracteres.'
            if (e.loc?.includes('first_name')) return 'El nombre es requerido.'
            if (e.loc?.includes('last_name')) return 'El apellido es requerido.'
            if (e.loc?.includes('phone')) return 'El teléfono es requerido.'
            if (e.loc?.includes('delivery_address')) return 'La dirección de entrega es requerida.'
            return e.msg
          })
          setError(messages.join(' '))
        } else if (typeof detail === 'string') {
          if (detail.includes('already exists') || detail.includes('ya existe')) {
            setError('Ya existe una cuenta con ese email.')
          } else {
            setError(detail)
          }
        }
      } else {
        setError('Ocurrió un error al crear tu cuenta. Intenta de nuevo.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Token inválido
  if (tokenValid === false) {
    return (
      <div style={{
        minHeight: '100vh',
        background: theme.semantic.bgPage,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}>
        <div style={{
          textAlign: 'center',
          background: theme.semantic.bgCard,
          borderRadius: '16px',
          border: `1px solid ${theme.semantic.border}`,
          padding: '40px 36px',
          maxWidth: '400px',
          width: '100%',
        }}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>🔗</div>
          <h2 style={{ color: theme.semantic.textPrimary, margin: '0 0 8px' }}>
            Link inválido
          </h2>
          <p style={{ color: theme.semantic.textMuted, margin: '0 0 24px' }}>
            Este link de invitación no es válido o ya expiró. Pide a tu vendedor que te comparta uno nuevo.
          </p>
          <Button
            label="Ir al inicio"
            onClick={() => navigate('/login')}
            variant="ghost"
          />
        </div>
      </div>
    )
  }

  // Cargando validación del token
  if (tokenValid === null) {
    return (
      <div style={{
        minHeight: '100vh',
        background: theme.semantic.bgPage,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <p style={{ color: theme.semantic.textMuted }}>Validando invitación...</p>
      </div>
    )
  }

  // Formulario de registro
  return (
    <div style={{
      minHeight: '100vh',
      background: theme.semantic.bgPage,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        background: theme.semantic.bgCard,
        borderRadius: '16px',
        border: `1px solid ${theme.semantic.border}`,
        padding: '40px 36px',
      }}>

        {/* Encabezado */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>🌸</div>
          <h1 style={{
            fontSize: '22px',
            fontWeight: 500,
            color: theme.semantic.textPrimary,
            margin: '0 0 8px',
          }}>
            Crear cuenta
          </h1>
          <p style={{
            fontSize: '14px',
            color: theme.semantic.textMuted,
            margin: 0,
          }}>
            Invitada por{' '}
            <span style={{ color: theme.semantic.actionPrimary, fontWeight: 500 }}>
              {vendorName}
            </span>
          </p>
        </div>

        {/* Campos */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
          <Input label="Nombre" value={firstName} onChange={setFirstName} placeholder="María" />
          <Input label="Apellido" value={lastName} onChange={setLastName} placeholder="García" />
        </div>
        <Input label="Email" type="email" value={email} onChange={setEmail} placeholder="tu@email.com" />
        <Input label="Contraseña" type="password" value={password} onChange={setPassword} placeholder="••••••••" />
        <Input label="Teléfono" value={phone} onChange={setPhone} placeholder="33 1234 5678" />
        <Input label="Dirección de entrega" value={address} onChange={setAddress} placeholder="Calle, número, colonia" />

        {/* Error */}
        {error && (
          <div style={{
            background: theme.semantic.statusAlert,
            border: `1px solid ${theme.colors.accent[100]}`,
            borderRadius: '8px',
            padding: '10px 14px',
            marginBottom: '16px',
            fontSize: '13px',
            color: theme.semantic.statusAlertText,
          }}>
            {error}
          </div>
        )}

        <Button
          label="Crear cuenta"
          onClick={handleRegister}
          isLoading={isLoading}
          fullWidth
        />

        <p style={{
          textAlign: 'center',
          fontSize: '13px',
          color: theme.semantic.textMuted,
          marginTop: '16px',
          marginBottom: 0,
        }}>
          ¿Ya tienes cuenta?{' '}
          <span
            onClick={() => navigate('/login')}
            style={{ color: theme.semantic.actionPrimary, cursor: 'pointer' }}
          >
            Inicia sesión
          </span>
        </p>

      </div>
    </div>
  )
}