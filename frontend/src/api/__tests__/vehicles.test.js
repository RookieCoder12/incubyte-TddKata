import { searchVehicles, restockVehicle } from '../vehicles.js'

beforeEach(() => {
  globalThis.fetch = vi.fn().mockResolvedValue({ ok: true, status: 200, json: () => Promise.resolve([]) })
})

describe('vehicles api', () => {
  it('sends only the filters that have a value', async () => {
    await searchVehicles('t', { make: 'toy', model: '', category: undefined, minPrice: '1000' })

    expect(fetch.mock.calls[0][0]).toBe('/api/vehicles/search?make=toy&minPrice=1000')
  })

  it('posts the restock quantity', async () => {
    await restockVehicle('t', 'v1', 3)

    expect(fetch.mock.calls[0][0]).toBe('/api/vehicles/v1/restock')
    expect(fetch.mock.calls[0][1].body).toBe(JSON.stringify({ quantity: 3 }))
  })
})
