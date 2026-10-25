import type { PrismaClient } from '../../prisma/.generated/prisma/index.js'
import { randomBytes } from 'node:crypto'
import bcrypt from 'bcrypt'
import { registerSchema } from '../../shared/schemas/auth'

export interface UserRow {
  email: string
  name: string
  createdAt: Date
  family: number
}

export async function listUsers(prisma: PrismaClient): Promise<UserRow[]> {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'asc' },
    select: {
      email: true,
      name: true,
      createdAt: true,
      membership: { select: { household: { select: { _count: { select: { members: true } } } } } }
    }
  })

  return users.map(user => ({
    email: user.email ?? '',
    name: user.name,
    createdAt: user.createdAt,
    family: user.membership?.household._count.members ?? 0
  }))
}

export function generatePassword(): string {
  return randomBytes(12).toString('base64url')
}

export async function resetPassword(prisma: PrismaClient, email: string, { password = generatePassword(), rounds = 12 } = {}) {
  const parsed = registerSchema.shape.password.safeParse(password)
  if (!parsed.success) throw new Error('The password must be 8 to 30 characters long')

  const user = await prisma.user.findUnique({ where: { email: email.trim() } })
    ?? await prisma.user.findFirst({ where: { email: { equals: email.trim(), mode: 'insensitive' } } })
  if (!user) throw new Error(`No user with email ${email}`)

  const passwordHash = await bcrypt.hash(password, rounds)

  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { passwordHash } }),
    prisma.refreshToken.deleteMany({ where: { userId: user.id } })
  ])

  return password
}
