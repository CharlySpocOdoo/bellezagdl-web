import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface PublicRouteProps {
  children: React.ReactNode
}

export function PublicRoute({ children }: PublicRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-400">Cargando...</p>
      </div>
    )
  }

  // Ya tiene sesión — redirigir a su home según rol
  if (isAuthenticated && user) {
    if (user.role === 'vendor') return <Navigate to="/vendor" replace />
    if (user.role === 'client') return <Navigate to="/catalog" replace />
    if (user.role === 'admin') return <Navigate to="/catalog" replace />
  }

  return <>{children}</>
}