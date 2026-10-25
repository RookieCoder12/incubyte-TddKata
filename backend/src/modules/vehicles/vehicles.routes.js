import express from 'express'
import { authenticate } from '../../middleware/auth.middleware.js'
import { validateVehicleInput } from './vehicles.validation.js'
import { createVehicle, getAllVehicles } from './vehicles.service.js'

const router = express.Router()

// Every vehicle route needs a logged-in user
router.use(authenticate)

router.post('/', async (req, res) => {
    const { isValid, errors } = validateVehicleInput(req.body)

    if (!isValid) {
        return res.status(400).json({ errors })
    }

    try {
        const vehicle = await createVehicle(req.body)
        return res.status(201).json(vehicle)
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: 'Unable to create vehicle' })
    }
})

router.get('/', async (req, res) => {
    try {
        const vehicles = await getAllVehicles()
        return res.status(200).json(vehicles)
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: 'Unable to fetch vehicles' })
    }
})

export default router
