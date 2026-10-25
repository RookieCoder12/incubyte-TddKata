import { validateVehicleInput } from '../../../src/modules/vehicles/vehicles.validation.js'

describe('validateVehicleInput', () => {
    const validVehicle = { make: 'Toyota', model: 'Corolla', category: 'Sedan', price: 20000, quantity: 3 }

    it('accepts a complete, valid vehicle', () => {
        expect(validateVehicleInput(validVehicle)).toEqual({ isValid: true, errors: {} })
    })

    it('reports every missing field when body is empty', () => {
        const { isValid, errors } = validateVehicleInput({})

        expect(isValid).toBe(false)
        expect(errors).toEqual({
            make: 'Make is required',
            model: 'Model is required',
            category: 'Category is required',
            price: 'Price is required',
            quantity: 'Quantity is required',
        })
    })

    it('rejects a price that is not a positive number', () => {
        expect(validateVehicleInput({ ...validVehicle, price: 'cheap' }).errors.price)
            .toBe('Price must be a number')
        expect(validateVehicleInput({ ...validVehicle, price: 0 }).errors.price)
            .toBe('Price must be greater than 0')
    })

    it('rejects a quantity that is negative or not a whole number', () => {
        expect(validateVehicleInput({ ...validVehicle, quantity: -1 }).errors.quantity)
            .toBe('Quantity cannot be negative')
        expect(validateVehicleInput({ ...validVehicle, quantity: 1.5 }).errors.quantity)
            .toBe('Quantity must be an integer')
    })

    it('allows a quantity of zero', () => {
        expect(validateVehicleInput({ ...validVehicle, quantity: 0 }).isValid).toBe(true)
    })
})
