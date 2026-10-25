import jwt from 'jsonwebtoken'
import { jest } from '@jest/globals'
import { authenticate, requireAdmin } from '../../../src/middleware/auth.middleware.js'

// Minimal fake of Express's res object that records status and body
function createRes() {
    const res = {}
    res.status = jest.fn(() => res)
    res.json = jest.fn(() => res)
    return res
}

describe('authenticate', () => {
    it('puts the token payload on req.user and calls next for a valid token', () => {
        const token = jwt.sign({ id: 'user-1', role: 'USER' }, process.env.JWT_SECRET)
        const req = { headers: { authorization: `Bearer ${token}` } }
        const next = jest.fn()

        authenticate(req, createRes(), next)

        expect(req.user).toEqual({ id: 'user-1', role: 'USER' })
        expect(next).toHaveBeenCalled()
    })

    it('returns 401 when the Authorization header is missing', () => {
        const res = createRes()
        const next = jest.fn()

        authenticate({ headers: {} }, res, next)

        expect(res.status).toHaveBeenCalledWith(401)
        expect(res.json).toHaveBeenCalledWith({ message: 'Authentication required' })
        expect(next).not.toHaveBeenCalled()
    })

    it('returns 401 when the token is invalid', () => {
        const res = createRes()
        const req = { headers: { authorization: 'Bearer not-a-real-token' } }

        authenticate(req, res, jest.fn())

        expect(res.status).toHaveBeenCalledWith(401)
        expect(res.json).toHaveBeenCalledWith({ message: 'Invalid or expired token' })
    })
})

describe('requireAdmin', () => {
    it('calls next for an admin user', () => {
        const next = jest.fn()

        requireAdmin({ user: { id: 'a', role: 'ADMIN' } }, createRes(), next)

        expect(next).toHaveBeenCalled()
    })

    it('returns 403 for a non-admin user', () => {
        const res = createRes()
        const next = jest.fn()

        requireAdmin({ user: { id: 'u', role: 'USER' } }, res, next)

        expect(res.status).toHaveBeenCalledWith(403)
        expect(res.json).toHaveBeenCalledWith({ message: 'Admin access required' })
        expect(next).not.toHaveBeenCalled()
    })
})
