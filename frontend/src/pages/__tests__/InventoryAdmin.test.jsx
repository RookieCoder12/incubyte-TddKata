import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import InventoryPage from '../InventoryPage.jsx'
import { renderWithProviders } from '../../test/renderWithProviders.jsx'
import { sampleVehicles, signInAs } from '../../test/fixtures.js'
import { fetchVehicles, restockVehicle } from '../../api/vehicles.js'

vi.mock('../../api/vehicles.js', () => ({
  fetchVehicles: vi.fn(),
  searchVehicles: vi.fn(),
  purchaseVehicle: vi.fn(),
  restockVehicle: vi.fn(),
}))

const rowFor = (name) => screen.getByText(name).closest('tr')

function renderInventory() {
  return renderWithProviders(<InventoryPage />, {
    extraRoutes: [['/vehicles/:id/edit', <p>Edit page</p>]],
  })
}

beforeEach(() => {
  fetchVehicles.mockResolvedValue(sampleVehicles)
})

describe('Admin actions on the inventory', () => {
  it('are hidden from sales staff', async () => {
    signInAs('USER')
    renderInventory()
    await screen.findByText('Ford F-150')

    expect(screen.queryByRole('button', { name: 'Restock Ford F-150' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Edit Ford F-150' })).not.toBeInTheDocument()
  })

  it('restock a vehicle by the units that arrived', async () => {
    signInAs('ADMIN')
    restockVehicle.mockResolvedValue({ ...sampleVehicles[2], quantity: 3 })
    renderInventory()
    await screen.findByText('Ford F-150')

    await userEvent.click(screen.getByRole('button', { name: 'Restock Ford F-150' }))
    const dialog = screen.getByRole('dialog', { name: 'Restock Ford F-150' })
    await userEvent.clear(within(dialog).getByLabelText('Units arrived'))
    await userEvent.type(within(dialog).getByLabelText('Units arrived'), '3')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Restock' }))

    expect(restockVehicle).toHaveBeenCalledWith('jwt-token', 'v3', 3)
    expect(await screen.findByRole('status')).toHaveTextContent('Restocked Ford F-150 · 3 on the lot')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(within(rowFor('Ford F-150')).getByRole('button', { name: 'Purchase Ford F-150' })).toBeEnabled()
  })

  it('reject a restock that is not a whole number above zero', async () => {
    signInAs('ADMIN')
    renderInventory()
    await screen.findByText('Ford F-150')

    await userEvent.click(screen.getByRole('button', { name: 'Restock Ford F-150' }))
    const dialog = screen.getByRole('dialog')
    await userEvent.clear(within(dialog).getByLabelText('Units arrived'))
    await userEvent.type(within(dialog).getByLabelText('Units arrived'), '0')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Restock' }))

    expect(within(dialog).getByText('Enter a whole number above 0')).toBeInTheDocument()
    expect(restockVehicle).not.toHaveBeenCalled()
  })

  it('cancel the restock dialog', async () => {
    signInAs('ADMIN')
    renderInventory()
    await screen.findByText('Ford F-150')

    await userEvent.click(screen.getByRole('button', { name: 'Restock Ford F-150' }))
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('link to the edit page', async () => {
    signInAs('ADMIN')
    renderInventory()
    await screen.findByText('Ford F-150')

    await userEvent.click(screen.getByRole('link', { name: 'Edit Ford F-150' }))

    expect(screen.getByText('Edit page')).toBeInTheDocument()
  })
})
