import prisma from '../src/config/database.js'

// Close the DB connection after each test file so Jest can exit cleanly
afterAll(async () => {
    await prisma.$disconnect()
})
