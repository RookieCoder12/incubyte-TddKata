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
