import express from 'express'
import { authenticate, requireAdmin } from '../../middleware/auth.middleware.js'
import { validateVehicleInput, validateSearchQuery, validateVehicleUpdateInput } from './vehicles.validation.js'
import { createVehicle, getAllVehicles, searchVehicles, updateVehicle, deleteVehicle } from './vehicles.service.js'

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

// Must stay above any "/:id" route, otherwise "search" would be read as an id
router.get('/search', async (req, res) => {
    const { isValid, errors } = validateSearchQuery(req.query)

    if (!isValid) {
        return res.status(400).json({ errors })
    }

    try {
        const vehicles = await searchVehicles(req.query)
        return res.status(200).json(vehicles)
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: 'Unable to search vehicles' })
    }
})

router.put('/:id', async (req, res) => {
    const { isValid, errors } = validateVehicleUpdateInput(req.body)

    if (!isValid) {
        return res.status(400).json({ errors })
    }

    try {
        const vehicle = await updateVehicle(req.params.id, req.body)
        return res.status(200).json(vehicle)
    } catch (error) {
        if (error?.code === 'P2025') {
            return res.status(404).json({ message: 'Vehicle not found' })
        }

        console.error(error)
        return res.status(500).json({ message: 'Unable to update vehicle' })
    }
})

router.delete('/:id', requireAdmin, async (req, res) => {
    try {
        await deleteVehicle(req.params.id)
        return res.status(204).send()
    } catch (error) {
        if (error?.code === 'P2025') {
            return res.status(404).json({ message: 'Vehicle not found' })
        }

        console.error(error)
        return res.status(500).json({ message: 'Unable to delete vehicle' })
    }
})

export default router
