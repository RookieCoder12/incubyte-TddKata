import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RegisterPage from '../RegisterPage.jsx'
import { renderWithProviders } from '../../test/renderWithProviders.jsx'
import { registerRequest } from '../../api/auth.js'
import { ApiError } from '../../api/client.js'

vi.mock('../../api/auth.js', () => ({ loginRequest: vi.fn(), registerRequest: vi.fn() }))

function renderRegister() {
  return renderWithProviders(<RegisterPage />, {
    route: '/register',
    path: '/register',
    extraRoutes: [['/', <p>Inventory page</p>], ['/login', <p>Login page</p>]],
  })
}

async function fill({ name = 'Priya Nair', email = 'priya@example.com', password = 'secret123' } = {}) {
  if (name) await userEvent.type(screen.getByLabelText('Full name'), name)
  if (email) await userEvent.type(screen.getByLabelText('Email'), email)
  if (password) await userEvent.type(screen.getByLabelText('Password'), password)
  await userEvent.click(screen.getByRole('button', { name: 'Create account' }))
}

describe('RegisterPage', () => {
  it('creates the account and opens the inventory', async () => {
    registerRequest.mockResolvedValue({ token: 't', user: { name: 'Priya Nair', role: 'USER' } })
    renderRegister()

    await fill()

    expect(registerRequest).toHaveBeenCalledWith({ name: 'Priya Nair', email: 'priya@example.com', password: 'secret123' })
    expect(await screen.findByText('Inventory page')).toBeInTheDocument()
  })

  it('checks the fields before calling the server', async () => {
    renderRegister()

    await fill({ name: '', email: 'not-an-email', password: '123' })

    expect(screen.getByText('Name is required')).toBeInTheDocument()
    expect(screen.getByText('Email must be valid')).toBeInTheDocument()
    expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument()
    expect(registerRequest).not.toHaveBeenCalled()
  })

  it('shows a duplicate email error from the server', async () => {
    registerRequest.mockRejectedValue(new ApiError(409, 'Email is already registered'))
    renderRegister()

    await fill()

    expect(await screen.findByRole('alert')).toHaveTextContent('Email is already registered')
  })

  it('shows field errors returned by the server', async () => {
    registerRequest.mockRejectedValue(new ApiError(400, 'Please fix the highlighted fields', { email: 'Email must be valid' }))
    renderRegister()

    await fill()

    expect(await screen.findByText('Email must be valid')).toBeInTheDocument()
  })

  it('links back to sign in', async () => {
    renderRegister()

    await userEvent.click(screen.getByRole('link', { name: 'Sign in' }))

    expect(screen.getByText('Login page')).toBeInTheDocument()
  })
})
