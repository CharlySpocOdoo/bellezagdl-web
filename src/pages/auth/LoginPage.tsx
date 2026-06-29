import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Input } from '../../components/Input'
import { Button } from '../../components/Button'
import { theme } from '../../theme'
import logoRosaArios from '../../assets/LogoArios.jpg'

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
    if (!email.includes('@')) {
      setError('El email no tiene un formato válido.')
      return
    }
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }

    setError('')
    setIsLoading(true)

    try {
      const me = await login(email, password)
      if (me.role === 'vendor') navigate('/vendor')
      else if (me.role === 'wholesale') navigate('/wholesale')
      else navigate('/catalog')
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('Email o contraseña incorrectos.')
      } else if (err.response?.status === 422) {
        setError('Por favor ingresa un email válido y una contraseña.')
      } else {
        setError('Ocurrió un error al iniciar sesión. Intenta de nuevo.')
      }
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
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <img
              src={logoRosaArios}
              alt="Rosa de Lima Cosméticos"
              style={{ width: '185px', height: '185px', objectFit: 'contain' }}
            />
          </div>
          <p style={{
            fontSize: '14px',
            color: theme.semantic.textSecondary,
            margin: 0,
          }}>
            Inicia sesión para continuar
          </p>
        </div>



        {/* Formulario */}
        <Input
          label="Correo electrónico"
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