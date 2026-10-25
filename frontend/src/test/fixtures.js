// Sample vehicles used across page tests
export const sampleVehicles = [
  { id: 'v1', make: 'Toyota', model: 'Corolla', category: 'Sedan', price: 21450, quantity: 5 },
  { id: 'v2', make: 'Honda', model: 'Civic', category: 'Sedan', price: 23950, quantity: 2 },
  { id: 'v3', make: 'Ford', model: 'F-150', category: 'Truck', price: 38900, quantity: 0 },
]

export function signInAs(role, name = 'Priya Nair') {
  localStorage.setItem('lotline.session', JSON.stringify({
    token: 'jwt-token',
    user: { id: 'u1', name, email: 'priya@example.com', role },
  }))
}
