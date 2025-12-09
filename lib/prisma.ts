import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const connectionString = process.env.DATABASE_URL

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

const createPrismaClient = () => {
  if (!connectionString) {
    return new PrismaClient()
  }

  const pool = new Pool({ 
    connectionString,
    max: process.env.NODE_ENV === 'production' ? 10 : 1 
  })
  
  const adapter = new PrismaPg(pool)

  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma || createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma