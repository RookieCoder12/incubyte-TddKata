import express from 'express'
import { validateRegisterInput, validateLoginInput } from './auth.validation.js'
import { registerUser, loginUser } from './auth.service.js'

const router = express.Router()

router.post('/register', async (req, res) => {
    const { isValid, errors } = validateRegisterInput(req.body)

    if (!isValid) {
        return res.status(400).json({ errors })
    }

    try {
        const result = await registerUser(req.body)
        return res.status(201).json(result)
    } catch (error) {
        if (error?.code === 'EMAIL_TAKEN') {
            return res.status(409).json({ message: error.message })
        }

        console.error(error)
        return res.status(500).json({ message: 'Unable to register user' })
    }
})

router.post('/login', async (req, res) => {
    const { isValid, errors } = validateLoginInput(req.body)

    if (!isValid) {
        return res.status(400).json({ errors })
    }

    try {
        const result = await loginUser(req.body)
        return res.status(200).json(result)
    } catch (error) {
        if (error?.code === 'INVALID_CREDENTIALS') {
            return res.status(401).json({ message: error.message })
        }

        console.error(error)
        return res.status(500).json({ message: 'Unable to log in' })
    }
})

export default router
