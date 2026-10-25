import prisma from '../../config/database.js'

// Prisma returns price as a Decimal object; send it to the client as a plain number
export function formatVehicle(vehicle) {
    return {
        ...vehicle,
        price: Number(vehicle.price),
    }
}

export async function createVehicle({ make, model, category, price, quantity }) {
    const vehicle = await prisma.vehicle.create({
        data: {
            make: make.trim(),
            model: model.trim(),
            category: category.trim(),
            price,
            quantity,
        },
    })

    return formatVehicle(vehicle)
}

export async function getAllVehicles() {
    const vehicles = await prisma.vehicle.findMany({
        orderBy: { createdAt: 'desc' },
    })

    return vehicles.map(formatVehicle)
}

export async function searchVehicles({ make, model, category, minPrice, maxPrice }) {
    const where = {}

    // Text filters: partial, case-insensitive match (e.g. "toy" finds "Toyota")
    if (make) where.make = { contains: make, mode: 'insensitive' }
    if (model) where.model = { contains: model, mode: 'insensitive' }
    if (category) where.category = { contains: category, mode: 'insensitive' }

    if (minPrice !== undefined || maxPrice !== undefined) {
        where.price = {}
        if (minPrice !== undefined) where.price.gte = Number(minPrice)
        if (maxPrice !== undefined) where.price.lte = Number(maxPrice)
    }

    const vehicles = await prisma.vehicle.findMany({
        where,
        orderBy: { createdAt: 'desc' },
    })

    return vehicles.map(formatVehicle)
}

// Prisma throws error code P2025 if the vehicle does not exist
export async function updateVehicle(vehicleId, data) {
    const allowedFields = ['make', 'model', 'category', 'price', 'quantity']
    const changes = {}

    for (const field of allowedFields) {
        if (data[field] !== undefined) {
            changes[field] = typeof data[field] === 'string' ? data[field].trim() : data[field]
        }
    }

    const vehicle = await prisma.vehicle.update({
        where: { id: vehicleId },
        data: changes,
    })

    return formatVehicle(vehicle)
}

export async function deleteVehicle(vehicleId) {
    await prisma.vehicle.delete({
        where: { id: vehicleId },
    })
}
