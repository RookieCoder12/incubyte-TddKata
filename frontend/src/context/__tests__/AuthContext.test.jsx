import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider, useAuth } from '../AuthContext.jsx'
import { loginRequest, registerRequest } from '../../api/auth.js'

vi.mock('../../api/auth.js', () => ({
  loginRequest: vi.fn(),
  registerRequest: vi.fn(),
}))

const session = {
  token: 'jwt-token',
  user: { id: 'u1', name: 'Priya Nair', email: 'priya@example.com', role: 'ADMIN' },
}

function Probe() {
  const { user, token, isAdmin, login, register, logout } = useAuth()
  return (
    <div>
      <p>user: {user ? user.name : 'none'}</p>
      <p>token: {token || 'none'}</p>
      <p>admin: {String(isAdmin)}</p>
      <button onClick={() => login({ email: 'priya@example.com', password: 'secret123' })}>login</button>
      <button onClick={() => register({ name: 'Priya Nair', email: 'priya@example.com', password: 'secret123' })}>register</button>
      <button onClick={logout}>logout</button>
    </div>
  )
}

function renderProbe() {
  return render(<AuthProvider><Probe /></AuthProvider>)
}

describe('AuthContext', () => {
  it('starts signed out', () => {
    renderProbe()

    expect(screen.getByText('user: none')).toBeInTheDocument()
    expect(screen.getByText('admin: false')).toBeInTheDocument()
  })

  it('logs in, exposes the user and role, and saves the session', async () => {
    loginRequest.mockResolvedValue(session)
    renderProbe()

    await userEvent.click(screen.getByText('login'))

    expect(await screen.findByText('user: Priya Nair')).toBeInTheDocument()
    expect(screen.getByText('token: jwt-token')).toBeInTheDocument()
    expect(screen.getByText('admin: true')).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem('lotline.session'))).toEqual(session)
  })

  it('registers and signs the new user in', async () => {
    registerRequest.mockResolvedValue({ ...session, user: { ...session.user, role: 'USER' } })
    renderProbe()

    await userEvent.click(screen.getByText('register'))

    expect(await screen.findByText('user: Priya Nair')).toBeInTheDocument()
    expect(screen.getByText('admin: false')).toBeInTheDocument()
  })

  it('restores a saved session on load', () => {
    localStorage.setItem('lotline.session', JSON.stringify(session))
    renderProbe()

    expect(screen.getByText('user: Priya Nair')).toBeInTheDocument()
  })

  it('logs out and clears the saved session', async () => {
    localStorage.setItem('lotline.session', JSON.stringify(session))
    renderProbe()

    await userEvent.click(screen.getByText('logout'))

    expect(screen.getByText('user: none')).toBeInTheDocument()
    expect(localStorage.getItem('lotline.session')).toBeNull()
  })
})
