import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import { ProtectedRoute, GuestRoute } from './components/ProtectedRoute.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import InventoryPage from './pages/InventoryPage.jsx'
import VehicleFormPage from './pages/VehicleFormPage.jsx'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
          <Route path="/" element={<ProtectedRoute><InventoryPage /></ProtectedRoute>} />
          <Route path="/vehicles/new" element={<ProtectedRoute adminOnly><VehicleFormPage /></ProtectedRoute>} />
          <Route path="/vehicles/:id/edit" element={<ProtectedRoute adminOnly><VehicleFormPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
