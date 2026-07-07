import logoRosaArios from '../../assets/LogoArios.jpg'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { forgotPassword } from '../../api/auth'
import { theme } from '../../theme'

export function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async () => {
    if (!email.trim()) return
    setIsLoading(true)
    try {
      await forgotPassword(email.trim())
    } catch {
      // Silenciar errores de red — nunca revelar si el email existe
    } finally {
      setIsLoading(false)
      setSent(true)
    }
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
            Restablece tu contraseña
          </p>
        </div>

        {sent ? (
          <div>
            <div style={{
              background: '#EAF3DE',
              border: '0.5px solid #C0DD97',
              borderRadius: '10px',
              padding: '14px 16px',
              marginBottom: '20px',
              fontSize: '13px',
              color: '#3B6D11',
              lineHeight: 1.5,
            }}>
              Si ese correo está registrado, recibirás un link para restablecer tu contraseña.
            </div>
            <p style={{ textAlign: 'center', fontSize: '13px', color: theme.semantic.textMuted, margin: 0 }}>
              <span
                onClick={() => navigate('/login')}
                style={{ color: theme.semantic.actionPrimary, cursor: 'pointer' }}
              >
                ← Volver al login
              </span>
            </p>
          </div>
        ) : (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 500,
                color: theme.semantic.textSecondary,
                marginBottom: '6px',
              }}>
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit() }}
                placeholder="tu@email.com"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  fontSize: '16px',
                  border: `1.5px solid ${theme.semantic.border}`,
                  borderRadius: '8px',
                  outline: 'none',
                  color: theme.semantic.textPrimary,
                  boxSizing: 'border-box',
                  background: theme.semantic.bgInput,
                }}
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={isLoading || !email.trim()}
              style={{
                width: '100%',
                padding: '12px',
                background: isLoading || !email.trim() ? theme.semantic.border : theme.colors.secondary[800],
                color: isLoading || !email.trim() ? theme.semantic.textMuted : 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: isLoading || !email.trim() ? 'not-allowed' : 'pointer',
                marginBottom: '16px',
              }}
            >
              {isLoading ? 'Enviando...' : 'Enviar link'}
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
        )}

      </div>
    </div>
  )
}
