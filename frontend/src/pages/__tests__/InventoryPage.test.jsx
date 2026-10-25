import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import InventoryPage from '../InventoryPage.jsx'
import { renderWithProviders } from '../../test/renderWithProviders.jsx'
import { sampleVehicles, signInAs } from '../../test/fixtures.js'
import { fetchVehicles } from '../../api/vehicles.js'
import { ApiError } from '../../api/client.js'

vi.mock('../../api/vehicles.js', () => ({
  fetchVehicles: vi.fn(),
  searchVehicles: vi.fn(),
  purchaseVehicle: vi.fn(),
  restockVehicle: vi.fn(),
}))

function renderInventory() {
  return renderWithProviders(<InventoryPage />, {
    extraRoutes: [['/vehicles/new', <p>New vehicle page</p>]],
  })
}

function rowFor(name) {
  return screen.getByText(name).closest('tr')
}

beforeEach(() => {
  signInAs('USER')
  fetchVehicles.mockResolvedValue(sampleVehicles)
})

describe('InventoryPage', () => {
  it('lists every vehicle with its category, price and stock', async () => {
    renderInventory()

    expect(await screen.findByText('Toyota Corolla')).toBeInTheDocument()
    const row = rowFor('Toyota Corolla')
    expect(within(row).getByText('$21,450.00')).toBeInTheDocument()
    expect(within(row).getByText('5')).toBeInTheDocument()
    expect(fetchVehicles).toHaveBeenCalledWith('jwt-token')
  })

  it('states how many models are sold out and the units on the lot', async () => {
    renderInventory()

    expect(await screen.findByText('1 model sold out · 7 units on the lot')).toBeInTheDocument()
  })

  it('disables Purchase on a sold-out vehicle only', async () => {
    renderInventory()
    await screen.findByText('Ford F-150')

    expect(within(rowFor('Ford F-150')).getByRole('button', { name: 'Purchase Ford F-150' })).toBeDisabled()
    expect(within(rowFor('Toyota Corolla')).getByRole('button', { name: 'Purchase Toyota Corolla' })).toBeEnabled()
  })

  it('filters the table with the stock count cards', async () => {
    renderInventory()
    await screen.findByText('Toyota Corolla')

    await userEvent.click(screen.getByRole('button', { name: /Sold out/ }))

    expect(screen.getByText('Ford F-150')).toBeInTheDocument()
    expect(screen.queryByText('Toyota Corolla')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Sold out/ })).toHaveAttribute('aria-pressed', 'true')
  })

  it('shows an empty lot with one sentence', async () => {
    fetchVehicles.mockResolvedValue([])
    renderInventory()

    expect(await screen.findByText('No vehicles on the lot yet.')).toBeInTheDocument()
  })

  it('shows a load error inside the table with a retry', async () => {
    fetchVehicles.mockRejectedValueOnce(new ApiError(0, 'Cannot reach the server. Check that the API is running.'))
    renderInventory()

    expect(await screen.findByText(/Cannot reach the server/)).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Retry' }))

    expect(await screen.findByText('Toyota Corolla')).toBeInTheDocument()
  })

  it('hides Add vehicle from sales staff', async () => {
    renderInventory()
    await screen.findByText('Toyota Corolla')

    expect(screen.queryByRole('link', { name: 'Add vehicle' })).not.toBeInTheDocument()
  })

  it('offers Add vehicle to admins', async () => {
    signInAs('ADMIN')
    renderInventory()
    await screen.findByText('Toyota Corolla')

    await userEvent.click(screen.getAllByRole('link', { name: 'Add vehicle' })[0])

    expect(screen.getByText('New vehicle page')).toBeInTheDocument()
  })
})
