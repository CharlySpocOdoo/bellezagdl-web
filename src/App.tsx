import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'
import { ProtectedRoute } from './routes/ProtectedRoute'
import { PublicRoute } from './routes/PublicRoute'
import { LoginPage } from './pages/auth/LoginPage'
import { CatalogPage } from './pages/catalog/CatalogPage'
import { ProductDetailPage } from './pages/catalog/ProductDetailPage'
import { OrdersPage } from './pages/orders/OrdersPage'
import { VendorPage } from './pages/vendor/VendorPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { ActivatePage } from './pages/auth/ActivatePage'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
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
            <Route
              path="/registro"
              element={
                <PublicRoute>
                  <RegisterPage />
                </PublicRoute>
              }
            />
            <Route
              path="/activar"
              element={
                <PublicRoute>
                  <ActivatePage />
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
              path="/catalog/:id"
              element={
                <ProtectedRoute allowedRoles={['client', 'admin']}>
                  <ProductDetailPage />
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
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App