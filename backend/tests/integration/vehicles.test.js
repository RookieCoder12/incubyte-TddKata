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

describe('POST /api/vehicles', () => {
    it('creates a vehicle and returns it with an id', async () => {
        const res = await request(app)
            .post('/api/vehicles')
            .set('Authorization', `Bearer ${userToken}`)
            .send(corolla)

        expect(res.status).toBe(201)
        expect(res.body).toMatchObject({ id: expect.any(String), ...corolla })
    })

    it('returns 400 with errors for invalid input', async () => {
        const res = await request(app)
            .post('/api/vehicles')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ ...corolla, price: -5 })

        expect(res.status).toBe(400)
        expect(res.body.errors.price).toBe('Price must be greater than 0')
    })

    it('returns 401 without a token', async () => {
        const res = await request(app).post('/api/vehicles').send(corolla)

        expect(res.status).toBe(401)
    })
})

describe('GET /api/vehicles', () => {
    it('returns all vehicles', async () => {
        await prisma.vehicle.createMany({
            data: [corolla, { make: 'Honda', model: 'Civic', category: 'Sedan', price: 22000, quantity: 0 }],
        })

        const res = await request(app)
            .get('/api/vehicles')
            .set('Authorization', `Bearer ${userToken}`)

        expect(res.status).toBe(200)
        expect(res.body).toHaveLength(2)
        expect(res.body.map((v) => v.model).sort()).toEqual(['Civic', 'Corolla'])
        expect(typeof res.body[0].price).toBe('number')
    })

    it('returns 401 without a token', async () => {
        const res = await request(app).get('/api/vehicles')

        expect(res.status).toBe(401)
    })
})

describe('GET /api/vehicles/search', () => {
    beforeEach(async () => {
        await prisma.vehicle.createMany({
            data: [
                corolla,
                { make: 'Toyota', model: 'RAV4', category: 'SUV', price: 30000, quantity: 2 },
                { make: 'Honda', model: 'Civic', category: 'Sedan', price: 22000, quantity: 1 },
                { make: 'Ford', model: 'F-150', category: 'Truck', price: 45000, quantity: 4 },
            ],
        })
    })

    async function search(query) {
        return request(app)
            .get('/api/vehicles/search')
            .query(query)
            .set('Authorization', `Bearer ${userToken}`)
    }

    function models(res) {
        return res.body.map((v) => v.model).sort()
    }

    it('filters by make, ignoring case and matching partial text', async () => {
        const res = await search({ make: 'toy' })

        expect(res.status).toBe(200)
        expect(models(res)).toEqual(['Corolla', 'RAV4'])
    })

    it('filters by model', async () => {
        expect(models(await search({ model: 'civic' }))).toEqual(['Civic'])
    })

    it('filters by category', async () => {
        expect(models(await search({ category: 'sedan' }))).toEqual(['Civic', 'Corolla'])
    })

    it('filters by price range', async () => {
        expect(models(await search({ minPrice: '21000', maxPrice: '35000' }))).toEqual(['Civic', 'RAV4'])
    })

    it('combines filters', async () => {
        expect(models(await search({ make: 'toyota', maxPrice: '25000' }))).toEqual(['Corolla'])
    })

    it('returns every vehicle when no filters are given', async () => {
        expect(await search({})).toHaveProperty('body.length', 4)
    })

    it('returns 400 for an invalid price range', async () => {
        const res = await search({ minPrice: '50000', maxPrice: '100' })

        expect(res.status).toBe(400)
        expect(res.body.errors.minPrice).toBe('Min price cannot be greater than max price')
    })

    it('returns 401 without a token', async () => {
        const res = await request(app).get('/api/vehicles/search')

        expect(res.status).toBe(401)
    })
})

describe('PUT /api/vehicles/:id', () => {
    it('updates the given fields and keeps the rest', async () => {
        const vehicle = await prisma.vehicle.create({ data: corolla })

        const res = await request(app)
            .put(`/api/vehicles/${vehicle.id}`)
            .set('Authorization', `Bearer ${userToken}`)
            .send({ price: 18500, quantity: 5 })

        expect(res.status).toBe(200)
        expect(res.body).toMatchObject({ ...corolla, price: 18500, quantity: 5 })
    })

    it('returns 400 for invalid fields', async () => {
        const vehicle = await prisma.vehicle.create({ data: corolla })

        const res = await request(app)
            .put(`/api/vehicles/${vehicle.id}`)
            .set('Authorization', `Bearer ${userToken}`)
            .send({ price: 'free' })

        expect(res.status).toBe(400)
    })

    it('returns 404 for an unknown vehicle', async () => {
        const res = await request(app)
            .put('/api/vehicles/does-not-exist')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ price: 1000 })

        expect(res.status).toBe(404)
        expect(res.body.message).toBe('Vehicle not found')
    })
})

describe('DELETE /api/vehicles/:id', () => {
    it('lets an admin delete a vehicle', async () => {
        const { token: adminToken } = await createUserWithToken('ADMIN')
        const vehicle = await prisma.vehicle.create({ data: corolla })

        const res = await request(app)
            .delete(`/api/vehicles/${vehicle.id}`)
            .set('Authorization', `Bearer ${adminToken}`)

        expect(res.status).toBe(204)
        expect(await prisma.vehicle.findUnique({ where: { id: vehicle.id } })).toBeNull()
    })

    it('returns 403 for a non-admin user', async () => {
        const vehicle = await prisma.vehicle.create({ data: corolla })

        const res = await request(app)
            .delete(`/api/vehicles/${vehicle.id}`)
            .set('Authorization', `Bearer ${userToken}`)

        expect(res.status).toBe(403)
    })

    it('returns 404 for an unknown vehicle', async () => {
        const { token: adminToken } = await createUserWithToken('ADMIN')

        const res = await request(app)
            .delete('/api/vehicles/does-not-exist')
            .set('Authorization', `Bearer ${adminToken}`)

        expect(res.status).toBe(404)
    })
})
