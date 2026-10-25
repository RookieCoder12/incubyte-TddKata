import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import InventoryPage from '../InventoryPage.jsx'
import { renderWithProviders } from '../../test/renderWithProviders.jsx'
import { sampleVehicles, signInAs } from '../../test/fixtures.js'
import { fetchVehicles, purchaseVehicle } from '../../api/vehicles.js'
import { ApiError } from '../../api/client.js'

vi.mock('../../api/vehicles.js', () => ({
  fetchVehicles: vi.fn(),
  searchVehicles: vi.fn(),
  purchaseVehicle: vi.fn(),
  restockVehicle: vi.fn(),
}))

const rowFor = (name) => screen.getByText(name).closest('tr')

beforeEach(() => {
  signInAs('USER')
  fetchVehicles.mockResolvedValue(sampleVehicles)
})

describe('Purchasing a vehicle', () => {
  it('sells one unit, updates the row and confirms the sale', async () => {
    purchaseVehicle.mockResolvedValue({ ...sampleVehicles[1], quantity: 1 })
    renderWithProviders(<InventoryPage />)
    await screen.findByText('Honda Civic')

    await userEvent.click(screen.getByRole('button', { name: 'Purchase Honda Civic' }))

    expect(purchaseVehicle).toHaveBeenCalledWith('jwt-token', 'v2')
    expect(await screen.findByRole('status')).toHaveTextContent('Sold 1 Honda Civic · 1 left on the lot')
    expect(within(rowFor('Honda Civic')).getByText('1')).toBeInTheDocument()
  })

  it('disables Purchase once the last unit is sold', async () => {
    purchaseVehicle.mockResolvedValue({ ...sampleVehicles[1], quantity: 0 })
    renderWithProviders(<InventoryPage />)
    await screen.findByText('Honda Civic')

    await userEvent.click(screen.getByRole('button', { name: 'Purchase Honda Civic' }))

    expect(await screen.findByRole('status')).toHaveTextContent('Sold 1 Honda Civic · none left on the lot')
    expect(screen.getByRole('button', { name: 'Purchase Honda Civic' })).toBeDisabled()
  })

  it('marks the vehicle sold out when someone else sold the last unit', async () => {
    purchaseVehicle.mockRejectedValue(new ApiError(400, 'Vehicle is out of stock'))
    renderWithProviders(<InventoryPage />)
    await screen.findByText('Honda Civic')

    await userEvent.click(screen.getByRole('button', { name: 'Purchase Honda Civic' }))

    expect(await screen.findByRole('status')).toHaveTextContent('Vehicle is out of stock')
    expect(screen.getByRole('button', { name: 'Purchase Honda Civic' })).toBeDisabled()
    expect(within(rowFor('Honda Civic')).getByText('Sold out')).toBeInTheDocument()
  })
})
