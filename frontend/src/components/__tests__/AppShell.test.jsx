import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AppShell from '../AppShell.jsx'
import { renderWithProviders } from '../../test/renderWithProviders.jsx'

function signInAs(role) {
  localStorage.setItem('lotline.session', JSON.stringify({
    token: 't',
    user: { name: 'Priya Nair', email: 'priya@example.com', role },
  }))
}

function renderShell() {
  return renderWithProviders(<AppShell title="Inventory"><p>Page content</p></AppShell>, {
    extraRoutes: [['/login', <p>Login page</p>]],
  })
}

describe('AppShell', () => {
  it('names the product, the page and shows the content', () => {
    signInAs('USER')
    renderShell()

    expect(screen.getAllByText('Lotline').length).toBeGreaterThan(0)
    expect(screen.getByText('Page content')).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: 'Inventory' }).length).toBeGreaterThan(0)
  })

  it('shows the signed-in user and their role', () => {
    signInAs('USER')
    renderShell()

    expect(screen.getByText('Priya Nair')).toBeInTheDocument()
    expect(screen.getByText('Sales')).toBeInTheDocument()
  })

  it('hides admin navigation from sales staff', () => {
    signInAs('USER')
    renderShell()

    expect(screen.queryByRole('link', { name: 'Add vehicle' })).not.toBeInTheDocument()
  })

  it('shows admin navigation to admins', () => {
    signInAs('ADMIN')
    renderShell()

    expect(screen.getByText('Admin')).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: 'Add vehicle' }).length).toBeGreaterThan(0)
  })

  it('signs out and returns to the login page', async () => {
    signInAs('USER')
    renderShell()

    await userEvent.click(screen.getByRole('button', { name: 'Sign out' }))

    expect(screen.getByText('Login page')).toBeInTheDocument()
    expect(localStorage.getItem('lotline.session')).toBeNull()
  })

  it('opens the menu on small screens', async () => {
    signInAs('USER')
    renderShell()

    const menuButton = screen.getByRole('button', { name: 'Open menu' })
    expect(menuButton).toHaveAttribute('aria-expanded', 'false')

    await userEvent.click(menuButton)

    expect(screen.getByRole('button', { name: 'Close menu' })).toHaveAttribute('aria-expanded', 'true')
  })
})
