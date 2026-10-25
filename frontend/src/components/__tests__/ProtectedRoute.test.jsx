import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '../../context/AuthContext.jsx'
import { ProtectedRoute, GuestRoute } from '../ProtectedRoute.jsx'

function signInAs(role) {
  localStorage.setItem('lotline.session', JSON.stringify({ token: 't', user: { name: 'Sam', role } }))
}

function renderAt(route) {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/login" element={<GuestRoute><p>Login page</p></GuestRoute>} />
          <Route path="/" element={<ProtectedRoute><p>Inventory page</p></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute adminOnly><p>Admin page</p></ProtectedRoute>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  )
}

describe('ProtectedRoute', () => {
  it('sends a signed-out visitor to the login page', () => {
    renderAt('/')

    expect(screen.getByText('Login page')).toBeInTheDocument()
  })

  it('shows the page to a signed-in user', () => {
    signInAs('USER')
    renderAt('/')

    expect(screen.getByText('Inventory page')).toBeInTheDocument()
  })

  it('sends a non-admin away from an admin-only page', () => {
    signInAs('USER')
    renderAt('/admin')

    expect(screen.getByText('Inventory page')).toBeInTheDocument()
  })

  it('shows an admin-only page to an admin', () => {
    signInAs('ADMIN')
    renderAt('/admin')

    expect(screen.getByText('Admin page')).toBeInTheDocument()
  })
})

describe('GuestRoute', () => {
  it('sends a signed-in user from the login page to the inventory', () => {
    signInAs('USER')
    renderAt('/login')

    expect(screen.getByText('Inventory page')).toBeInTheDocument()
  })
})
