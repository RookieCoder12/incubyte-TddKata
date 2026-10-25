import { apiRequest } from './client.js'

export function loginRequest(credentials) {
  return apiRequest('/auth/login', { method: 'POST', body: credentials })
}

export function registerRequest(details) {
  return apiRequest('/auth/register', { method: 'POST', body: details })
}
