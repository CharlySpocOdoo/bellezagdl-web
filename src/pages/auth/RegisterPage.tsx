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
  const tokenFromUrl = searchParams.get('token') || ''

  // Token activo — puede venir de la URL o del código corto ingresado
  const [activeToken, setActiveToken] = useState(tokenFromUrl)
  const [vendorName, setVendorName] = useState('')
  const [tokenValid, setTokenValid] = useState<boolean | null>(tokenFromUrl ? null : 'code_input' as any)

  // Estado para el input del código corto
  const [shortCode, setShortCode] = useState('')
  const [isValidatingCode, setIsValidatingCode] = useState(false)
  const [codeError, setCodeError] = useState('')

  // Campos del formulario
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Validar token de URL al cargar
  useEffect(() => {
    if (!tokenFromUrl) return
    const validate = async () => {
      try {
        const encoded = encodeURIComponent(tokenFromUrl)
        const data = await validateInviteToken(encoded)
        setVendorName(data.vendor_name || 'tu vendedor')
        setTokenValid(true)
        setActiveToken(tokenFromUrl)
      } catch {
        setTokenValid(false)
      }
    }
    validate()
  }, [tokenFromUrl])

  // Validar código corto ingresado manualmente
  const handleValidateCode = async () => {
    if (!shortCode.trim()) {
      setCodeError('Por favor ingresa el código de tu vendedor.')
      return
    }
    if (shortCode.trim().length !== 6) {
      setCodeError('El código debe tener exactamente 6 caracteres.')
      return
    }
    setCodeError('')
    setIsValidatingCode(true)
    try {
      const data = await validateInviteToken(shortCode.trim().toUpperCase())
      setVendorName(data.vendor_name || 'tu vendedor')
      setActiveToken(shortCode.trim().toUpperCase())
      setTokenValid(true)
    } catch {
      setCodeError('Código inválido. Verifica con tu vendedor.')
    } finally {
      setIsValidatingCode(false)
    }
  }

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
        token: activeToken,
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        phone,
        delivery_address: address,
      })
      await login(email, password)
      navigate('/catalog')
    } catch (err: any) {
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail
        if (Array.isArray(detail)) {
          const messages = detail.map((e: any) => {
            if (e.loc?.includes('email')) return 'El email no tiene un formato válido.'
            if (e.loc?.includes('password')) return 'La contraseña debe tener al menos 8 caracteres.'
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

  // Pantalla — ingresar código corto
  if (tokenValid === 'code_input' as any) {
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
          maxWidth: '400px',
          background: theme.semantic.bgCard,
          borderRadius: '16px',
          border: '1px solid ' + theme.semantic.border,
          padding: '40px 36px',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
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
              Ingresa el código de invitación de tu vendedor
            </p>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 500,
              color: theme.semantic.textSecondary,
              marginBottom: '6px',
            }}>
              Código de invitación
            </label>
            <input
              type="text"
              value={shortCode}
              onChange={(e) => setShortCode(e.target.value.toUpperCase())}
              placeholder="Ej. RG3JHH"
              maxLength={6}
              style={{
                width: '100%',
                padding: '10px 14px',
                fontSize: '20px',
                fontFamily: 'monospace',
                letterSpacing: '4px',
                textAlign: 'center',
                color: theme.semantic.textPrimary,
                background: theme.semantic.bgInput,
                border: '1px solid ' + (codeError ? theme.semantic.statusAlertText : theme.semantic.border),
                borderRadius: '8px',
                outline: 'none',
                boxSizing: 'border-box' as const,
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleValidateCode()}
            />
            {codeError && (
              <p style={{ fontSize: '12px', color: theme.semantic.statusAlertText, marginTop: '4px' }}>
                {codeError}
              </p>
            )}
          </div>

          <Button
            label={isValidatingCode ? 'Validando...' : 'Continuar'}
            onClick={handleValidateCode}
            isLoading={isValidatingCode}
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
          border: '1px solid ' + theme.semantic.border,
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
        border: '1px solid ' + theme.semantic.border,
        padding: '40px 36px',
      }}>
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
          <p style={{ fontSize: '14px', color: theme.semantic.textMuted, margin: 0 }}>
            Invitada por{' '}
            <span style={{ color: theme.semantic.actionPrimary, fontWeight: 500 }}>
              {vendorName}
            </span>
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
          <Input label="Nombre" value={firstName} onChange={setFirstName} placeholder="María" />
          <Input label="Apellido" value={lastName} onChange={setLastName} placeholder="García" />
        </div>
        <Input label="Email" type="email" value={email} onChange={setEmail} placeholder="tu@email.com" />
        <Input label="Contraseña" type="password" value={password} onChange={setPassword} placeholder="••••••••" />
        <Input label="Teléfono" value={phone} onChange={setPhone} placeholder="33 1234 5678" />
        <Input label="Dirección de entrega" value={address} onChange={setAddress} placeholder="Calle, número, colonia" />

        {error && (
          <div style={{
            background: theme.semantic.statusAlert,
            border: '1px solid ' + theme.colors.accent[100],
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