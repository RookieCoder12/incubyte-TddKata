const priceFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
})

export function formatPrice(price) {
  return priceFormatter.format(price)
}

// 1-2 units left counts as low stock: time to restock
export function getStockState(quantity) {
  if (quantity === 0) return 'sold-out'
  if (quantity <= 2) return 'low'
  return 'in-stock'
}

export function summarizeStock(vehicles) {
  const summary = { all: vehicles.length, 'in-stock': 0, low: 0, 'sold-out': 0, units: 0 }

  for (const vehicle of vehicles) {
    summary[getStockState(vehicle.quantity)] += 1
    summary.units += vehicle.quantity
  }

  return summary
}

export function filterByStock(vehicles, stockState) {
  if (stockState === 'all') {
    return vehicles
  }

  return vehicles.filter((vehicle) => getStockState(vehicle.quantity) === stockState)
}

export function sortVehicles(vehicles) {
  return [...vehicles].sort((a, b) =>
    a.make.localeCompare(b.make) || a.model.localeCompare(b.model),
  )
}
