import { apiRequest, ApiError } from '../client.js'

function mockFetch(status, body) {
  globalThis.fetch = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  })
}

describe('apiRequest', () => {
  it('sends JSON to /api and returns the parsed body', async () => {
    mockFetch(200, { status: 'ok' })

    const data = await apiRequest('/health', { method: 'POST', body: { a: 1 } })

    expect(data).toEqual({ status: 'ok' })
    expect(fetch).toHaveBeenCalledWith('/api/health', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ a: 1 }),
      headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
    }))
  })

  it('adds the Bearer token when one is given', async () => {
    mockFetch(200, [])

    await apiRequest('/vehicles', { token: 'abc' })

    expect(fetch.mock.calls[0][1].headers.Authorization).toBe('Bearer abc')
  })

  it('returns null for a 204 response', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: true, status: 204 })

    expect(await apiRequest('/vehicles/1', { method: 'DELETE' })).toBeNull()
  })

  it('throws an ApiError with status, message and field errors', async () => {
    mockFetch(400, { errors: { price: 'Price is required' } })

    const error = await apiRequest('/vehicles', { method: 'POST', body: {} }).catch((e) => e)

    expect(error).toBeInstanceOf(ApiError)
    expect(error.status).toBe(400)
    expect(error.errors).toEqual({ price: 'Price is required' })
    expect(error.message).toBe('Please fix the highlighted fields')
  })

  it('uses the server message when there is one', async () => {
    mockFetch(401, { message: 'Invalid email or password' })

    const error = await apiRequest('/auth/login', { method: 'POST', body: {} }).catch((e) => e)

    expect(error.message).toBe('Invalid email or password')
  })

  it('reports a network failure as an ApiError with status 0', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'))

    const error = await apiRequest('/vehicles').catch((e) => e)

    expect(error).toBeInstanceOf(ApiError)
    expect(error.status).toBe(0)
    expect(error.message).toBe('Cannot reach the server. Check that the API is running.')
  })
})
