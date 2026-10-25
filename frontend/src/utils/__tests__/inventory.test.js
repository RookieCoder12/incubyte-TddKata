import { formatPrice, getStockState, summarizeStock, filterByStock, sortVehicles } from '../inventory.js'

const vehicles = [
  { id: '1', make: 'Toyota', model: 'Corolla', quantity: 5 },
  { id: '2', make: 'Honda', model: 'Civic', quantity: 2 },
  { id: '3', make: 'Ford', model: 'F-150', quantity: 0 },
  { id: '4', make: 'Toyota', model: 'Camry', quantity: 1 },
]

describe('formatPrice', () => {
  it('formats dollars with separators and two decimals', () => {
    expect(formatPrice(24500)).toBe('$24,500.00')
    expect(formatPrice(0)).toBe('$0.00')
  })
})

describe('getStockState', () => {
  it('splits quantities into sold out, low and in stock', () => {
    expect(getStockState(0)).toBe('sold-out')
    expect(getStockState(1)).toBe('low')
    expect(getStockState(2)).toBe('low')
    expect(getStockState(3)).toBe('in-stock')
  })
})

describe('summarizeStock', () => {
  it('counts models per stock state and totals the units', () => {
    expect(summarizeStock(vehicles)).toEqual({
      all: 4,
      'in-stock': 1,
      low: 2,
      'sold-out': 1,
      units: 8,
    })
  })

  it('returns zeros for an empty lot', () => {
    expect(summarizeStock([])).toEqual({ all: 0, 'in-stock': 0, low: 0, 'sold-out': 0, units: 0 })
  })
})

describe('filterByStock', () => {
  it('keeps every vehicle for "all"', () => {
    expect(filterByStock(vehicles, 'all')).toHaveLength(4)
  })

  it('keeps only vehicles in the chosen state', () => {
    expect(filterByStock(vehicles, 'low').map((v) => v.id)).toEqual(['2', '4'])
  })
})

describe('sortVehicles', () => {
  it('sorts by make, then model', () => {
    expect(sortVehicles(vehicles).map((v) => v.model)).toEqual(['F-150', 'Civic', 'Camry', 'Corolla'])
  })
})
