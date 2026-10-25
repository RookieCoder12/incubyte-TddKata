import request from 'supertest'
import { createApp } from '../../src/app.js'
import prisma from '../../src/config/database.js'
import { resetDatabase } from '../helpers/db.js'

const app = createApp()

beforeEach(async () => {
    await resetDatabase()
})

describe('POST /api/auth/register', () => {
    const newUser = { name: 'Asha', email: 'asha@example.com', password: 'secret123' }

    it('creates a user and returns a token', async () => {
        const res = await request(app).post('/api/auth/register').send(newUser)

        expect(res.status).toBe(201)
        expect(res.body.token).toEqual(expect.any(String))
        expect(res.body.user).toEqual({
            id: expect.any(String),
            name: 'Asha',
            email: 'asha@example.com',
            role: 'USER',
        })
    })

    it('stores a hashed password, never the plain one', async () => {
        await request(app).post('/api/auth/register').send(newUser)

        const saved = await prisma.user.findUnique({ where: { email: newUser.email } })
        expect(saved.passwordHash).not.toBe(newUser.password)
    })

    it('always registers users with the USER role', async () => {
        const res = await request(app).post('/api/auth/register').send({ ...newUser, role: 'ADMIN' })

        expect(res.body.user.role).toBe('USER')
    })

    it('returns 400 with errors for invalid input', async () => {
        const res = await request(app).post('/api/auth/register').send({ email: 'bad' })

        expect(res.status).toBe(400)
        expect(res.body.errors.email).toBe('Email must be valid')
    })

    it('returns 409 when the email is already registered', async () => {
        await request(app).post('/api/auth/register').send(newUser)
        const res = await request(app).post('/api/auth/register').send(newUser)

        expect(res.status).toBe(409)
        expect(res.body.message).toBe('Email is already registered')
    })
})

describe('POST /api/auth/login', () => {
    const credentials = { email: 'asha@example.com', password: 'secret123' }

    beforeEach(async () => {
        await request(app).post('/api/auth/register').send({ name: 'Asha', ...credentials })
    })

    it('returns a token and the user for valid credentials', async () => {
        const res = await request(app).post('/api/auth/login').send(credentials)

        expect(res.status).toBe(200)
        expect(res.body.token).toEqual(expect.any(String))
        expect(res.body.user.email).toBe(credentials.email)
    })

    it('treats the email as case-insensitive', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ ...credentials, email: 'ASHA@example.com' })

        expect(res.status).toBe(200)
    })

    it('returns 401 for a wrong password', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ ...credentials, password: 'wrong-password' })

        expect(res.status).toBe(401)
        expect(res.body.message).toBe('Invalid email or password')
    })

    it('returns 401 for an unknown email', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ ...credentials, email: 'nobody@example.com' })

        expect(res.status).toBe(401)
        expect(res.body.message).toBe('Invalid email or password')
    })

    it('returns 400 when fields are missing', async () => {
        const res = await request(app).post('/api/auth/login').send({})

        expect(res.status).toBe(400)
    })
})
