import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import type { User } from '../types'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: User['role'][]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-400">Cargando...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    if (user.role === 'vendor') return <Navigate to="/vendor" replace />
    if (user.role === 'client') return <Navigate to="/catalog" replace />
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
