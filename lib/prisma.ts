import { PrismaClient } from '@prisma/client'

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development'
      ? (['query', 'error', 'warn'] as const)
      : (['error'] as const),
  })
}

const prisma = globalThis.prisma ?? createPrismaClient()
if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma
}

export default prisma
