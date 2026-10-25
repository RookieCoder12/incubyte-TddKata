import { validateRestockInput } from '../../../src/modules/inventory/inventory.validation.js'

describe('validateRestockInput', () => {
    it('accepts a positive whole quantity', () => {
        expect(validateRestockInput({ quantity: 5 })).toEqual({ isValid: true, errors: {} })
    })

    it('requires a quantity', () => {
        expect(validateRestockInput({}).errors.quantity).toBe('Quantity is required')
    })

    it('rejects non-numbers, decimals, zero and negatives', () => {
        expect(validateRestockInput({ quantity: 'ten' }).errors.quantity).toBe('Quantity must be a number')
        expect(validateRestockInput({ quantity: 2.5 }).errors.quantity).toBe('Quantity must be an integer')
        expect(validateRestockInput({ quantity: 0 }).errors.quantity).toBe('Quantity must be greater than 0')
        expect(validateRestockInput({ quantity: -3 }).errors.quantity).toBe('Quantity must be greater than 0')
    })
})
