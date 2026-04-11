import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Input } from '../../components/Input'
import { Button } from '../../components/Button'
import { theme } from '../../theme'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Por favor ingresa tu email y contraseña.')
      return
    }

    setError('')
    setIsLoading(true)

    try {
      await login(email, password)
      // La redirección la maneja AuthContext según el rol
      const user = JSON.parse(atob(localStorage.getItem('refresh_token')?.split('.')[1] || '{}'))
      if (user.role === 'vendor') {
        navigate('/vendor')
      } else {
        navigate('/catalog')
      }
    } catch {
      setError('Email o contraseña incorrectos.')
    } finally {
      setIsLoading(false)
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

        {/* Logo / Título */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: theme.colors.primary[50],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: '24px',
          }}>
            🌸
          </div>
          <h1 style={{
            fontSize: '22px',
            fontWeight: 500,
            color: theme.semantic.textPrimary,
            margin: '0 0 6px',
          }}>
            BellezaGDL
          </h1>
          <p style={{
            fontSize: '14px',
            color: theme.semantic.textMuted,
            margin: 0,
          }}>
            Inicia sesión para continuar
          </p>
        </div>

        {/* Formulario */}
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="tu@email.com"
        />
        <Input
          label="Contraseña"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="••••••••"
        />

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

        {/* Botón */}
        <Button
          label="Iniciar sesión"
          onClick={handleLogin}
          isLoading={isLoading}
          fullWidth
        />

      </div>
    </div>
  )
}