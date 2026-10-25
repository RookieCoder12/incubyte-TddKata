import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import VehicleFormPage from '../VehicleFormPage.jsx'
import { renderWithProviders } from '../../test/renderWithProviders.jsx'
import { sampleVehicles, signInAs } from '../../test/fixtures.js'
import { fetchVehicles, createVehicle, updateVehicle } from '../../api/vehicles.js'
import { ApiError } from '../../api/client.js'

vi.mock('../../api/vehicles.js', () => ({
  fetchVehicles: vi.fn(),
  createVehicle: vi.fn(),
  updateVehicle: vi.fn(),
  deleteVehicle: vi.fn(),
}))

function renderNew() {
  return renderWithProviders(<VehicleFormPage />, {
    route: '/vehicles/new',
    path: '/vehicles/new',
    extraRoutes: [['/', <p>Inventory page</p>]],
  })
}

function renderEdit(id = 'v2') {
  return renderWithProviders(<VehicleFormPage />, {
    route: `/vehicles/${id}/edit`,
    path: '/vehicles/:id/edit',
    extraRoutes: [['/', <p>Inventory page</p>]],
  })
}

async function fillVehicle() {
  await userEvent.type(screen.getByLabelText('Make'), 'Mazda')
  await userEvent.type(screen.getByLabelText('Model'), 'CX-5')
  await userEvent.type(screen.getByLabelText('Category'), 'SUV')
  await userEvent.type(screen.getByLabelText('Price (USD)'), '29990')
  await userEvent.type(screen.getByLabelText('Units on the lot'), '4')
}

beforeEach(() => {
  signInAs('ADMIN')
  fetchVehicles.mockResolvedValue(sampleVehicles)
})

describe('VehicleFormPage — add', () => {
  it('creates the vehicle with numeric price and quantity, then returns to the inventory', async () => {
    createVehicle.mockResolvedValue({ id: 'v9' })
    renderNew()
    expect(screen.getByRole('heading', { level: 1, name: 'Add vehicle' })).toBeInTheDocument()

    await fillVehicle()
    await userEvent.click(screen.getByRole('button', { name: 'Add to inventory' }))

    expect(createVehicle).toHaveBeenCalledWith('jwt-token', {
      make: 'Mazda', model: 'CX-5', category: 'SUV', price: 29990, quantity: 4,
    })
    expect(await screen.findByText('Inventory page')).toBeInTheDocument()
  })

  it('checks the fields before sending', async () => {
    renderNew()

    await userEvent.type(screen.getByLabelText('Price (USD)'), '0')
    await userEvent.type(screen.getByLabelText('Units on the lot'), '1.5')
    await userEvent.click(screen.getByRole('button', { name: 'Add to inventory' }))

    expect(screen.getByText('Make is required')).toBeInTheDocument()
    expect(screen.getByText('Price must be greater than 0')).toBeInTheDocument()
    expect(screen.getByText('Units must be a whole number, 0 or more')).toBeInTheDocument()
    expect(createVehicle).not.toHaveBeenCalled()
  })

  it('shows field errors from the server', async () => {
    createVehicle.mockRejectedValue(new ApiError(400, 'Please fix the highlighted fields', { category: 'Category is required' }))
    renderNew()

    await fillVehicle()
    await userEvent.click(screen.getByRole('button', { name: 'Add to inventory' }))

    expect(await screen.findByText('Category is required')).toBeInTheDocument()
  })
})

describe('VehicleFormPage — edit', () => {
  it('loads the vehicle into the form', async () => {
    renderEdit()

    expect(await screen.findByDisplayValue('Civic')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: 'Honda Civic' })).toBeInTheDocument()
    expect(screen.getByLabelText('Price (USD)')).toHaveValue(23950)
  })

  it('saves the changes and returns to the inventory', async () => {
    updateVehicle.mockResolvedValue({})
    renderEdit()
    await screen.findByDisplayValue('Civic')

    await userEvent.clear(screen.getByLabelText('Price (USD)'))
    await userEvent.type(screen.getByLabelText('Price (USD)'), '22500')
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }))

    await waitFor(() => expect(updateVehicle).toHaveBeenCalledWith('jwt-token', 'v2', {
      make: 'Honda', model: 'Civic', category: 'Sedan', price: 22500, quantity: 2,
    }))
    expect(await screen.findByText('Inventory page')).toBeInTheDocument()
  })

  it('says so when the vehicle does not exist', async () => {
    renderEdit('missing')

    expect(await screen.findByText('This vehicle is no longer in the inventory.')).toBeInTheDocument()
  })
})
