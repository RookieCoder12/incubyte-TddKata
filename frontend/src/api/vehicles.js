import { apiRequest } from './client.js'

export function fetchVehicles(token) {
  return apiRequest('/vehicles', { token })
}

// Drops empty filters so the backend only receives what the user typed
export function searchVehicles(token, filters) {
  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(filters)) {
    if (value !== '' && value !== undefined && value !== null) {
      params.set(key, value)
    }
  }

  return apiRequest(`/vehicles/search?${params}`, { token })
}

export function createVehicle(token, vehicle) {
  return apiRequest('/vehicles', { method: 'POST', body: vehicle, token })
}

export function updateVehicle(token, id, changes) {
  return apiRequest(`/vehicles/${id}`, { method: 'PUT', body: changes, token })
}

export function deleteVehicle(token, id) {
  return apiRequest(`/vehicles/${id}`, { method: 'DELETE', token })
}

export function purchaseVehicle(token, id) {
  return apiRequest(`/vehicles/${id}/purchase`, { method: 'POST', token })
}

export function restockVehicle(token, id, quantity) {
  return apiRequest(`/vehicles/${id}/restock`, { method: 'POST', body: { quantity }, token })
}
