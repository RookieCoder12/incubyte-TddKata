import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginPage from '../LoginPage.jsx'
import { renderWithProviders } from '../../test/renderWithProviders.jsx'
import { loginRequest } from '../../api/auth.js'
import { ApiError } from '../../api/client.js'

vi.mock('../../api/auth.js', () => ({ loginRequest: vi.fn(), registerRequest: vi.fn() }))

function renderLogin() {
  return renderWithProviders(<LoginPage />, {
    route: '/login',
    path: '/login',
    extraRoutes: [['/', <p>Inventory page</p>], ['/register', <p>Register page</p>]],
  })
}

async function fillAndSubmit() {
  await userEvent.type(screen.getByLabelText('Email'), 'priya@example.com')
  await userEvent.type(screen.getByLabelText('Password'), 'secret123')
  await userEvent.click(screen.getByRole('button', { name: 'Sign in' }))
}

describe('LoginPage', () => {
  it('shows the product name and a sign-in heading', () => {
    renderLogin()

    expect(screen.getByText('Lotline')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: 'Sign in' })).toBeInTheDocument()
  })

  it('signs in with the typed credentials and opens the inventory', async () => {
    loginRequest.mockResolvedValue({ token: 't', user: { name: 'Priya', role: 'USER' } })
    renderLogin()

    await fillAndSubmit()

    expect(loginRequest).toHaveBeenCalledWith({ email: 'priya@example.com', password: 'secret123' })
    expect(await screen.findByText('Inventory page')).toBeInTheDocument()
  })

  it('shows the server error and stays on the page', async () => {
    loginRequest.mockRejectedValue(new ApiError(401, 'Invalid email or password'))
    renderLogin()

    await fillAndSubmit()

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid email or password')
    expect(screen.queryByText('Inventory page')).not.toBeInTheDocument()
  })

  it('links to the register page', async () => {
    renderLogin()

    await userEvent.click(screen.getByRole('link', { name: 'Create an account' }))

    expect(screen.getByText('Register page')).toBeInTheDocument()
  })
})
