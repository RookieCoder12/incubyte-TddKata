import express from 'express'
import { authenticate, requireAdmin } from '../../middleware/auth.middleware.js'
import { validateRestockInput } from './inventory.validation.js'
import { purchaseVehicle, restockVehicle } from './inventory.service.js'

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

router.post('/:id/restock', requireAdmin, async (req, res) => {
    const { isValid, errors } = validateRestockInput(req.body)

    if (!isValid) {
        return res.status(400).json({ errors })
    }

    try {
        const vehicle = await restockVehicle(req.params.id, req.body.quantity)
        return res.status(200).json(vehicle)
    } catch (error) {
        if (error?.code === 'P2025') {
            return res.status(404).json({ message: 'Vehicle not found' })
        }

        console.error(error)
        return res.status(500).json({ message: 'Unable to restock vehicle' })
    }
})

export default router
