import express from 'express'
import cors from 'cors'
import authRoutes from './modules/auth/auth.routes.js'
import vehicleRoutes from './modules/vehicles/vehicles.routes.js'
import inventoryRoutes from './modules/inventory/inventory.routes.js'

// Builds the Express app without starting a server, so tests can use it directly
export function createApp() {
    const app = express()

    app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }))
    app.use(express.json())

    app.get('/api/health', (req, res) => {
        return res.status(200).json({ status: 'ok' })
    })

    app.use('/api/auth', authRoutes)
    app.use('/api/vehicles', vehicleRoutes)
    app.use('/api/vehicles', inventoryRoutes)

    return app
}
