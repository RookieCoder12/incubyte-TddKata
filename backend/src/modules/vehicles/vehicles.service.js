import prisma from '../../config/database.js'

// Prisma returns price as a Decimal object; send it to the client as a plain number
function formatVehicle(vehicle) {
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
