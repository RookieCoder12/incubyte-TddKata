import prisma from '../../src/config/database.js'

describe('database connection', () => {
    it('can run a query against the test database', async () => {
        const result = await prisma.$queryRaw`SELECT 1 AS ok`

        expect(result).toEqual([{ ok: 1 }])
    })
})
