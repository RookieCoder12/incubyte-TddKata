import express from 'express'
import { authenticate } from '../../middleware/auth.middleware.js'
import { purchaseVehicle } from './inventory.service.js'

const router = express.Router()

router.use(authenticate)

router.post('/:id/purchase', async (req, res) => {
    try {
        const vehicle = await purchaseVehicle(req.params.id)
        return res.status(200).json(vehicle)
    } catch (error) {
        if (error?.code === 'P2025') {
            return res.status(404).json({ message: 'Vehicle not found' })
        }

        if (error?.code === 'OUT_OF_STOCK') {
            return res.status(400).json({ message: error.message })
        }

        console.error(error)
        return res.status(500).json({ message: 'Unable to purchase vehicle' })
    }
})

export default router
