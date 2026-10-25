import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

// Only signed-in users get through; adminOnly also requires the ADMIN role
export function ProtectedRoute({ adminOnly = false, children }) {
  const { token, isAdmin } = useAuth()

  if (!token) {
    return <Navigate to="/login" replace />
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />
  }

  return children
}

// Login and register are only for signed-out visitors
export function GuestRoute({ children }) {
  const { token } = useAuth()

  if (token) {
    return <Navigate to="/" replace />
  }

  return children
}
