import 'dotenv/config'
import bcrypt from 'bcryptjs'
import prisma from '../src/config/database.js'

// Registration always creates normal users, so the first admin comes from this script
async function main() {
    const email = (process.env.ADMIN_EMAIL || 'admin@dealership.com').toLowerCase()
    const password = process.env.ADMIN_PASSWORD || 'admin123'

    const admin = await prisma.user.upsert({
        where: { email },
        update: { role: 'ADMIN' },
        create: {
            name: 'Admin',
            email,
            passwordHash: await bcrypt.hash(password, 10),
            role: 'ADMIN',
        },
    })

    console.log(`Admin user ready: ${admin.email}`)
}

main()
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
    .finally(() => prisma.$disconnect())
