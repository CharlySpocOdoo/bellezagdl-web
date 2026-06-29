import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { CatalogProvider } from './contexts/CatalogContext'
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
import { WholesalePage } from './pages/wholesale/WholesalePage'
import { WholesaleOrdersPage } from './pages/wholesale/WholesaleOrdersPage'


function App() {
  
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <CatalogProvider>
            <Routes>
              <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
              <Route path="/registro" element={<PublicRoute><RegisterPage /></PublicRoute>} />
              <Route path="/activar" element={<PublicRoute><ActivatePage /></PublicRoute>} />

              <Route path="/catalog" element={<ProtectedRoute allowedRoles={['client', 'admin', 'vendor', 'oferta']}><CatalogPage /></ProtectedRoute>} />
              <Route path="/catalog/:id" element={<ProtectedRoute allowedRoles={['client', 'admin', 'vendor', 'oferta', 'wholesale']}><ProductDetailPage /></ProtectedRoute>} />

              <Route path="/orders" element={<ProtectedRoute allowedRoles={['client', 'admin']}><OrdersPage /></ProtectedRoute>} />
              <Route path="/orders/:id" element={<ProtectedRoute allowedRoles={['client', 'admin', 'vendor']}><OrderDetailPage /></ProtectedRoute>} />

              <Route path="/vendor" element={<ProtectedRoute allowedRoles={['vendor']}><VendorPage /></ProtectedRoute>} />

              <Route path="/wholesale" element={<ProtectedRoute allowedRoles={['wholesale']}><WholesalePage /></ProtectedRoute>} />
              <Route path="/wholesale/orders" element={<ProtectedRoute allowedRoles={['wholesale']}><WholesaleOrdersPage /></ProtectedRoute>} />
              <Route path="/wholesale/orders/:id" element={<ProtectedRoute allowedRoles={['wholesale', 'admin']}><OrderDetailPage /></ProtectedRoute>} />

              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </CatalogProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App