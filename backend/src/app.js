import express from 'express'
import cors from 'cors'

// Builds the Express app without starting a server, so tests can use it directly
export function createApp() {
    const app = express()

    app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }))
    app.use(express.json())

    app.get('/api/health', (req, res) => {
        return res.status(200).json({ status: 'ok' })
    })

    return app
}
