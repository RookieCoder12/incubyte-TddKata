import { validateVehicleInput, validateSearchQuery, validateVehicleUpdateInput } from '../../../src/modules/vehicles/vehicles.validation.js'

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

describe('validateSearchQuery', () => {
    it('accepts an empty query', () => {
        expect(validateSearchQuery({})).toEqual({ isValid: true, errors: {} })
    })

    it('accepts numeric price strings from the query string', () => {
        expect(validateSearchQuery({ minPrice: '1000', maxPrice: '5000' }).isValid).toBe(true)
    })

    it('rejects prices that are not numbers or are negative', () => {
        const { errors } = validateSearchQuery({ minPrice: 'abc', maxPrice: '-1' })

        expect(errors).toEqual({
            minPrice: 'Min price must be a non-negative number',
            maxPrice: 'Max price must be a non-negative number',
        })
    })

    it('rejects a min price greater than the max price', () => {
        const { errors } = validateSearchQuery({ minPrice: '5000', maxPrice: '1000' })

        expect(errors.minPrice).toBe('Min price cannot be greater than max price')
    })
})

describe('validateVehicleUpdateInput', () => {
    it('accepts a partial update', () => {
        expect(validateVehicleUpdateInput({ price: 18000 })).toEqual({ isValid: true, errors: {} })
    })

    it('validates only the fields that are sent', () => {
        const { isValid, errors } = validateVehicleUpdateInput({ make: '', quantity: -2 })

        expect(isValid).toBe(false)
        expect(errors).toEqual({
            make: 'Make is required',
            quantity: 'Quantity cannot be negative',
        })
    })

    it('requires at least one updatable field', () => {
        const { isValid, errors } = validateVehicleUpdateInput({ color: 'red' })

        expect(isValid).toBe(false)
        expect(errors.body).toBe('Provide at least one field to update')
    })
})
