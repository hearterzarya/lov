// @ts-ignore - Prisma 7 type re-export issue on serverless
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set')
  }
  const adapter = new PrismaPg({ connectionString })
  return new PrismaClient({ adapter })
}

const prisma = globalThis.prisma ?? createPrismaClient()
if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma
}

export default prisma
