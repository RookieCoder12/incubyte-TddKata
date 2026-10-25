import prisma from '../../config/database.js'
import { formatVehicle } from '../vehicles/vehicles.service.js'

function notFoundError() {
    const error = new Error('Vehicle not found')
    error.code = 'P2025'
    return error
}

export async function purchaseVehicle(vehicleId) {
    // Single atomic update: only decrements while stock is above zero,
    // so two buyers can never take the last unit at the same time
    const { count } = await prisma.vehicle.updateMany({
        where: { id: vehicleId, quantity: { gt: 0 } },
        data: { quantity: { decrement: 1 } },
    })

    if (count === 0) {
        const existingVehicle = await prisma.vehicle.findUnique({
            where: { id: vehicleId },
        })

        if (!existingVehicle) {
            throw notFoundError()
        }

        const error = new Error('Vehicle is out of stock')
        error.code = 'OUT_OF_STOCK'
        throw error
    }

    const vehicle = await prisma.vehicle.findUnique({
        where: { id: vehicleId },
    })

    return formatVehicle(vehicle)
}

// Prisma throws error code P2025 if the vehicle does not exist
export async function restockVehicle(vehicleId, quantity) {
    const vehicle = await prisma.vehicle.update({
        where: { id: vehicleId },
        data: { quantity: { increment: quantity } },
    })

    return formatVehicle(vehicle)
}
