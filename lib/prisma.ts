import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const connectionString = process.env.DATABASE_URL

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

const createPrismaClient = () => {
  // Gracefully handle missing connection string if necessary, 
  // though for production, it must be present.
  if (!connectionString) {
      throw new Error("DATABASE_URL is not defined in the environment.")
  }

  // Set up the Adapter connection (using your pooled Supabase URL)
  const pool = new Pool({ 
    connectionString,
  })
  
  const adapter = new PrismaPg(pool)
  
  // Return the client instance with the adapter
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma || createPrismaClient()

// Ensure that only one instance is ever created for development/HMR
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma