import { validateRegisterInput } from '../../../src/modules/auth/auth.validation.js'

describe('validateRegisterInput', () => {
    const validInput = { name: 'Asha', email: 'asha@example.com', password: 'secret123' }

    it('accepts a valid name, email and password', () => {
        expect(validateRegisterInput(validInput)).toEqual({ isValid: true, errors: {} })
    })

    it('requires a name', () => {
        const { isValid, errors } = validateRegisterInput({ ...validInput, name: '  ' })

        expect(isValid).toBe(false)
        expect(errors.name).toBe('Name is required')
    })

    it('requires a valid email', () => {
        const { isValid, errors } = validateRegisterInput({ ...validInput, email: 'not-an-email' })

        expect(isValid).toBe(false)
        expect(errors.email).toBe('Email must be valid')
    })

    it('requires a password of at least 6 characters', () => {
        const { isValid, errors } = validateRegisterInput({ ...validInput, password: '123' })

        expect(isValid).toBe(false)
        expect(errors.password).toBe('Password must be at least 6 characters')
    })

    it('reports every missing field when body is empty', () => {
        const { errors } = validateRegisterInput(undefined)

        expect(errors).toEqual({
            name: 'Name is required',
            email: 'Email is required',
            password: 'Password is required',
        })
    })
})
