import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { validateInviteToken } from '../../api/auth'
import { Input } from '../../components/Input'
import { Button } from '../../components/Button'
import { theme } from '../../theme'
import apiClient from '../../api/client'


export function ActivatePage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''

  const [tokenValid, setTokenValid] = useState<boolean | null>(null)
  const [vendorEmail, setVendorEmail] = useState('')

  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!token) {
      setTokenValid(false)
      return
    }

    const validate = async () => {
      try {
        const encoded = encodeURIComponent(token)
        const data = await validateInviteToken(encoded)
        if (data.type !== 'vendor_onboarding') {
          setTokenValid(false)
          return
        }
        setVendorEmail(data.email_hint || '')
        setTokenValid(true)
      } catch {
        setTokenValid(false)
      }
    }

    validate()
  }, [token])

  const handleActivate = async () => {
    if (!password || !passwordConfirm) {
      setError('Por favor ingresa y confirma tu contraseña.')
      return
    }
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }
    if (password !== passwordConfirm) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setError('')
    setIsLoading(true)

    try {
      const res = await apiClient.post('/auth/activate/vendor', {
        invitation_token: token,
        password,
      })

      // Login automático con el email del vendedor
      await login(res.data.email || vendorEmail, password)
      navigate('/vendor')
    } catch (err: any) {
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail
        if (typeof detail === 'string') {
          if (detail.includes('expired') || detail.includes('expirado')) {
            setError('El link de activación expiró. Contacta al administrador para obtener uno nuevo.')
          } else if (detail.includes('already') || detail.includes('ya')) {
            setError('Esta cuenta ya fue activada. Puedes iniciar sesión directamente.')
          } else {
            setError(detail)
          }
        }
      } else {
        setError('Ocurrió un error al activar tu cuenta. Intenta de nuevo.')
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
            Este link de activación no es válido o ya expiró. Contacta al administrador.
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

  // Cargando
  if (tokenValid === null) {
    return (
      <div style={{
        minHeight: '100vh',
        background: theme.semantic.bgPage,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <p style={{ color: theme.semantic.textMuted }}>Validando link de activación...</p>
      </div>
    )
  }

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
        border: `1px solid ${theme.semantic.border}`,
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
            Activa tu cuenta
          </h1>
          <p style={{
            fontSize: '14px',
            color: theme.semantic.textMuted,
            margin: 0,
          }}>
            Elige una contraseña para comenzar
          </p>
        </div>

        <Input
          label="Contraseña"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="Mínimo 8 caracteres"
        />
        <Input
          label="Confirmar contraseña"
          type="password"
          value={passwordConfirm}
          onChange={setPasswordConfirm}
          placeholder="Repite tu contraseña"
        />

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
          label="Activar cuenta"
          onClick={handleActivate}
          isLoading={isLoading}
          fullWidth
        />

      </div>
    </div>
  )
}