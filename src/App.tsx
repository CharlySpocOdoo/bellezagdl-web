import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'
import { ProtectedRoute } from './routes/ProtectedRoute'
import { PublicRoute } from './routes/PublicRoute'
import { LoginPage } from './pages/auth/LoginPage'
import { CatalogPage } from './pages/catalog/CatalogPage'
import { ProductDetailPage } from './pages/catalog/ProductDetailPage'
import { OrdersPage } from './pages/orders/OrdersPage'
import { OrderDetailPage } from './pages/orders/OrderDetailPage'
import { VendorPage } from './pages/vendor/VendorPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { ActivatePage } from './pages/auth/ActivatePage'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/registro" element={<PublicRoute><RegisterPage /></PublicRoute>} />
            <Route path="/activar" element={<PublicRoute><ActivatePage /></PublicRoute>} />

            <Route path="/catalog" element={<ProtectedRoute allowedRoles={['client', 'admin', 'vendor']}><CatalogPage /></ProtectedRoute>} />
            <Route path="/catalog/:id" element={<ProtectedRoute allowedRoles={['client', 'admin', 'vendor']}><ProductDetailPage /></ProtectedRoute>} />

            <Route path="/orders" element={<ProtectedRoute allowedRoles={['client', 'admin']}><OrdersPage /></ProtectedRoute>} />
            <Route path="/orders/:id" element={<ProtectedRoute allowedRoles={['client', 'admin', 'vendor']}><OrderDetailPage /></ProtectedRoute>} />

            <Route path="/vendor" element={<ProtectedRoute allowedRoles={['vendor']}><VendorPage /></ProtectedRoute>} />

            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App