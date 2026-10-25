import prisma from '../../src/config/database.js'

// Wipes all tables so every test starts from an empty database
export async function resetDatabase() {
    await prisma.vehicle.deleteMany()
    await prisma.user.deleteMany()
}
