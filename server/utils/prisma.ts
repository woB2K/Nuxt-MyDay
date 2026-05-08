import process from 'node:process'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../../prisma/.generated/prisma'

type PrismaClientSingleton = ReturnType<typeof createPrismaClient>

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
  return new PrismaClient({ adapter })
}

const globalWithPrisma = globalThis as typeof globalThis & { prisma?: PrismaClientSingleton }

const prisma: PrismaClientSingleton = globalWithPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production')
  globalWithPrisma.prisma = prisma

export default prisma
