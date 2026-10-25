import jwt from 'jsonwebtoken'
import prisma from '../../src/config/database.js'

// Creates a user directly in the test DB and returns it with a valid JWT
export async function createUserWithToken(role = 'USER') {
    const user = await prisma.user.create({
        data: {
            name: `${role} tester`,
            email: `${role.toLowerCase()}-${Date.now()}-${Math.random()}@example.com`,
            passwordHash: 'not-used-in-tests',
            role,
        },
    })

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET)

    return { user, token }
}
