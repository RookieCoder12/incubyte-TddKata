import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../../config/database.js'

function createToken(user) {
    return jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    )
}

// Only send safe fields back to the client, never the password hash
function toPublicUser(user) {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
    }
}

export async function registerUser({ name, email, password }) {
    const normalizedEmail = email.trim().toLowerCase()

    const existingUser = await prisma.user.findUnique({
        where: { email: normalizedEmail },
    })

    if (existingUser) {
        const error = new Error('Email is already registered')
        error.code = 'EMAIL_TAKEN'
        throw error
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
        data: {
            name: name.trim(),
            email: normalizedEmail,
            passwordHash,
        },
    })

    return {
        token: createToken(user),
        user: toPublicUser(user),
    }
}
