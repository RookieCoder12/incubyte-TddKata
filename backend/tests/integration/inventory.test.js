import request from 'supertest'
import { createApp } from '../../src/app.js'
import prisma from '../../src/config/database.js'
import { resetDatabase } from '../helpers/db.js'
import { createUserWithToken } from '../helpers/auth.js'

const app = createApp()
const corolla = { make: 'Toyota', model: 'Corolla', category: 'Sedan', price: 20000, quantity: 3 }

let userToken

beforeEach(async () => {
    await resetDatabase()
    ;({ token: userToken } = await createUserWithToken('USER'))
})

describe('POST /api/vehicles/:id/purchase', () => {
    function purchase(vehicleId, token = userToken) {
        return request(app)
            .post(`/api/vehicles/${vehicleId}/purchase`)
            .set('Authorization', `Bearer ${token}`)
    }

    it('decreases the quantity by one and returns the vehicle', async () => {
        const vehicle = await prisma.vehicle.create({ data: corolla })

        const res = await purchase(vehicle.id)

        expect(res.status).toBe(200)
        expect(res.body).toMatchObject({ id: vehicle.id, quantity: 2, price: 20000 })
    })

    it('returns 400 when the vehicle is out of stock', async () => {
        const vehicle = await prisma.vehicle.create({ data: { ...corolla, quantity: 0 } })

        const res = await purchase(vehicle.id)

        expect(res.status).toBe(400)
        expect(res.body.message).toBe('Vehicle is out of stock')
    })

    it('never sells more than is in stock when purchases happen at the same time', async () => {
        const vehicle = await prisma.vehicle.create({ data: { ...corolla, quantity: 1 } })

        const results = await Promise.all([purchase(vehicle.id), purchase(vehicle.id)])

        expect(results.map((r) => r.status).sort()).toEqual([200, 400])
        const saved = await prisma.vehicle.findUnique({ where: { id: vehicle.id } })
        expect(saved.quantity).toBe(0)
    })

    it('returns 404 for an unknown vehicle', async () => {
        const res = await purchase('does-not-exist')

        expect(res.status).toBe(404)
        expect(res.body.message).toBe('Vehicle not found')
    })

    it('returns 401 without a token', async () => {
        const res = await request(app).post('/api/vehicles/any-id/purchase')

        expect(res.status).toBe(401)
    })
})

describe('POST /api/vehicles/:id/restock', () => {
    let adminToken

    beforeEach(async () => {
        ;({ token: adminToken } = await createUserWithToken('ADMIN'))
    })

    function restock(vehicleId, body, token = adminToken) {
        return request(app)
            .post(`/api/vehicles/${vehicleId}/restock`)
            .set('Authorization', `Bearer ${token}`)
            .send(body)
    }

    it('increases the quantity by the given amount', async () => {
        const vehicle = await prisma.vehicle.create({ data: { ...corolla, quantity: 0 } })

        const res = await restock(vehicle.id, { quantity: 4 })

        expect(res.status).toBe(200)
        expect(res.body).toMatchObject({ id: vehicle.id, quantity: 4 })
    })

    it('returns 400 for an invalid quantity', async () => {
        const vehicle = await prisma.vehicle.create({ data: corolla })

        const res = await restock(vehicle.id, { quantity: -1 })

        expect(res.status).toBe(400)
        expect(res.body.errors.quantity).toBe('Quantity must be greater than 0')
    })

    it('returns 403 for a non-admin user', async () => {
        const vehicle = await prisma.vehicle.create({ data: corolla })

        const res = await restock(vehicle.id, { quantity: 2 }, userToken)

        expect(res.status).toBe(403)
    })

    it('returns 404 for an unknown vehicle', async () => {
        const res = await restock('does-not-exist', { quantity: 2 })

        expect(res.status).toBe(404)
    })
})
