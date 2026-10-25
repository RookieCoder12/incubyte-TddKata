import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import InventoryPage from '../InventoryPage.jsx'
import { renderWithProviders } from '../../test/renderWithProviders.jsx'
import { sampleVehicles, signInAs } from '../../test/fixtures.js'
import { fetchVehicles, searchVehicles } from '../../api/vehicles.js'

vi.mock('../../api/vehicles.js', () => ({
  fetchVehicles: vi.fn(),
  searchVehicles: vi.fn(),
  purchaseVehicle: vi.fn(),
  restockVehicle: vi.fn(),
}))

const filters = () => screen.getByRole('search', { name: 'Filter vehicles' })

beforeEach(() => {
  signInAs('USER')
  fetchVehicles.mockResolvedValue(sampleVehicles)
  searchVehicles.mockResolvedValue([sampleVehicles[0]])
})

describe('Inventory search and filters', () => {
  it('searches by make after typing stops and shows the results', async () => {
    renderWithProviders(<InventoryPage />)
    await screen.findByText('Honda Civic')

    await userEvent.type(within(filters()).getByLabelText('Make'), 'toy')

    await waitFor(() => expect(searchVehicles).toHaveBeenCalledWith('jwt-token', {
      make: 'toy', model: '', category: '', minPrice: '', maxPrice: '',
    }))
    await waitFor(() => expect(screen.queryByText('Honda Civic')).not.toBeInTheDocument())
    expect(screen.getByText('Toyota Corolla')).toBeInTheDocument()
  })

  it('offers the categories on the lot', async () => {
    renderWithProviders(<InventoryPage />)
    await screen.findByText('Honda Civic')

    const options = within(within(filters()).getByLabelText('Category')).getAllByRole('option')

    expect(options.map((o) => o.textContent)).toEqual(['All categories', 'Sedan', 'Truck'])
  })

  it('filters by category and price range together', async () => {
    renderWithProviders(<InventoryPage />)
    await screen.findByText('Honda Civic')

    await userEvent.selectOptions(within(filters()).getByLabelText('Category'), 'Sedan')
    await userEvent.type(within(filters()).getByLabelText('Max price'), '22000')

    await waitFor(() => expect(searchVehicles).toHaveBeenLastCalledWith('jwt-token', {
      make: '', model: '', category: 'Sedan', minPrice: '', maxPrice: '22000',
    }))
  })

  it('does not search when the min price is above the max price', async () => {
    renderWithProviders(<InventoryPage />)
    await screen.findByText('Honda Civic')

    await userEvent.type(within(filters()).getByLabelText('Min price'), '50000')
    await userEvent.type(within(filters()).getByLabelText('Max price'), '100')

    expect(await screen.findByText('Min price is above max price')).toBeInTheDocument()
    await new Promise((resolve) => setTimeout(resolve, 400))
    expect(searchVehicles).not.toHaveBeenCalledWith('jwt-token', expect.objectContaining({ minPrice: '50000', maxPrice: '100' }))
  })

  it('clears the filters and shows the full lot again', async () => {
    renderWithProviders(<InventoryPage />)
    await screen.findByText('Honda Civic')
    await userEvent.type(within(filters()).getByLabelText('Model'), 'cor')
    await waitFor(() => expect(screen.queryByText('Honda Civic')).not.toBeInTheDocument())

    await userEvent.click(screen.getByRole('button', { name: 'Clear filters' }))

    expect(await screen.findByText('Honda Civic')).toBeInTheDocument()
    expect(within(filters()).getByLabelText('Model')).toHaveValue('')
  })
})
