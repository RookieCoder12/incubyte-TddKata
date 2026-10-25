import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import VehicleFormPage from '../VehicleFormPage.jsx'
import { renderWithProviders } from '../../test/renderWithProviders.jsx'
import { sampleVehicles, signInAs } from '../../test/fixtures.js'
import { fetchVehicles, deleteVehicle } from '../../api/vehicles.js'
import { ApiError } from '../../api/client.js'

vi.mock('../../api/vehicles.js', () => ({
  fetchVehicles: vi.fn(),
  createVehicle: vi.fn(),
  updateVehicle: vi.fn(),
  deleteVehicle: vi.fn(),
}))

function renderEdit() {
  return renderWithProviders(<VehicleFormPage />, {
    route: '/vehicles/v2/edit',
    path: '/vehicles/:id/edit',
    extraRoutes: [['/', <p>Inventory page</p>]],
  })
}

beforeEach(() => {
  signInAs('ADMIN')
  fetchVehicles.mockResolvedValue(sampleVehicles)
})

describe('Removing a vehicle', () => {
  it('is not offered when adding a new vehicle', () => {
    renderWithProviders(<VehicleFormPage />, { route: '/vehicles/new', path: '/vehicles/new' })

    expect(screen.queryByRole('button', { name: 'Remove vehicle' })).not.toBeInTheDocument()
  })

  it('asks for confirmation naming the vehicle, then deletes it', async () => {
    deleteVehicle.mockResolvedValue(null)
    renderEdit()
    await screen.findByDisplayValue('Civic')

    await userEvent.click(screen.getByRole('button', { name: 'Remove vehicle' }))
    const dialog = screen.getByRole('dialog', { name: 'Remove Honda Civic?' })
    expect(within(dialog).getByText(/2 units on the lot will be removed/)).toBeInTheDocument()

    await userEvent.click(within(dialog).getByRole('button', { name: 'Remove Honda Civic' }))

    expect(deleteVehicle).toHaveBeenCalledWith('jwt-token', 'v2')
    expect(await screen.findByText('Inventory page')).toBeInTheDocument()
  })

  it('keeps the vehicle when the confirmation is cancelled', async () => {
    renderEdit()
    await screen.findByDisplayValue('Civic')

    await userEvent.click(screen.getByRole('button', { name: 'Remove vehicle' }))
    await userEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Keep vehicle' }))

    expect(deleteVehicle).not.toHaveBeenCalled()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('shows the error if the delete fails', async () => {
    deleteVehicle.mockRejectedValue(new ApiError(403, 'Admin access required'))
    renderEdit()
    await screen.findByDisplayValue('Civic')

    await userEvent.click(screen.getByRole('button', { name: 'Remove vehicle' }))
    await userEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Remove Honda Civic' }))

    expect(await screen.findByText('Admin access required')).toBeInTheDocument()
  })
})
