import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createClient(): PrismaClient | null {
  if (!process.env.DATABASE_URL) {
    console.warn('[db] DATABASE_URL not set, using fallback-only mode.')
    return null
  }

  return new PrismaClient({
    log: ['query'],
  })
}

export const db: PrismaClient | null =
  globalForPrisma.prisma ??
  createClient()

if (process.env.NODE_ENV !== 'production' && db) globalForPrisma.prisma = db
