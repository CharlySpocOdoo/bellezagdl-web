import logoRosaArios from '../../assets/LogoArios.jpg'
import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { resetPassword } from '../../api/auth'
import { theme } from '../../theme'
import { PasswordInput } from '../../components/PasswordInput'

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) navigate('/forgot-password', { replace: true })
  }, [token])

  const handleSubmit = async () => {
    setError('')
    if (!newPassword || !confirmPassword) {
      setError('Completa ambos campos.')
      return
    }
    if (newPassword.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }
    setIsLoading(true)
    try {
      await resetPassword(token!, newPassword)
      navigate('/login', { state: { resetSuccess: true } })
    } catch (err: any) {
      const status = err.response?.status
      if (status === 400) {
        setError('El link de restablecimiento es inválido o ha expirado.')
      } else {
        setError('Ocurrió un error. Intenta de nuevo.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) return null

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

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <img
              src={logoRosaArios}
              alt="Rosa de Lima Cosméticos"
              style={{ width: '185px', height: '185px', objectFit: 'contain' }}
            />
          </div>
          <p style={{ fontSize: '14px', color: theme.semantic.textSecondary, margin: 0 }}>
            Elige una nueva contraseña
          </p>
        </div>

        {error && (
          <div style={{
            background: theme.semantic.statusAlert,
            border: `1px solid ${theme.colors.accent[100]}`,
            borderRadius: '8px',
            padding: '10px 14px',
            marginBottom: '16px',
            fontSize: '13px',
            color: theme.semantic.statusAlertText,
            lineHeight: 1.5,
          }}>
            {error}
            {error.includes('inválido o ha expirado') && (
              <span>
                {' '}
                <span
                  onClick={() => navigate('/forgot-password')}
                  style={{ color: theme.semantic.actionPrimary, cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Solicitar uno nuevo
                </span>
              </span>
            )}
          </div>
        )}

        <PasswordInput
          label="Nueva contraseña"
          value={newPassword}
          onChange={setNewPassword}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit() }}
        />
        <PasswordInput
          label="Confirmar contraseña"
          value={confirmPassword}
          onChange={setConfirmPassword}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit() }}
        />

        <button
          onClick={handleSubmit}
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '12px',
            background: isLoading ? theme.semantic.border : theme.colors.secondary[800],
            color: isLoading ? theme.semantic.textMuted : 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 500,
            cursor: isLoading ? 'not-allowed' : 'pointer',
            marginBottom: '16px',
          }}
        >
          {isLoading ? 'Guardando...' : 'Cambiar contraseña'}
        </button>

        <p style={{ textAlign: 'center', fontSize: '13px', color: theme.semantic.textMuted, margin: 0 }}>
          <span
            onClick={() => navigate('/login')}
            style={{ color: theme.semantic.actionPrimary, cursor: 'pointer' }}
          >
            ← Volver al login
          </span>
        </p>

      </div>
    </div>
  )
}
