import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './routes/ProtectedRoute'
import { PublicRoute } from './routes/PublicRoute'
import { LoginPage } from './pages/auth/LoginPage'
import { CatalogPage } from './pages/catalog/CatalogPage'
import { OrdersPage } from './pages/orders/OrdersPage'
import { VendorPage } from './pages/vendor/VendorPage'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          {/* Rutas públicas — solo sin sesión */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />

          {/* Rutas de cliente */}
          <Route
            path="/catalog"
            element={
              <ProtectedRoute allowedRoles={['client', 'admin']}>
                <CatalogPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute allowedRoles={['client', 'admin']}>
                <OrdersPage />
              </ProtectedRoute>
            }
          />

          {/* Rutas de vendedor */}
          <Route
            path="/vendor"
            element={
              <ProtectedRoute allowedRoles={['vendor']}>
                <VendorPage />
              </ProtectedRoute>
            }
          />

          {/* Ruta raíz — redirige a login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Cualquier ruta desconocida — redirige a login */}
          <Route path="*" element={<Navigate to="/login" replace />} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App