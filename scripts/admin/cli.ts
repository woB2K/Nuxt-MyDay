import process from 'node:process'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../../prisma/.generated/prisma/index.js'
import { listUsers, resetPassword } from './admin'

const USAGE = `Usage:
  pnpm admin users                              list accounts
  pnpm admin reset-password <email> [password]  set a new password and sign the user out everywhere;
                                                without a password a random one is generated and printed`

async function main() {
  const [command, ...args] = process.argv.slice(2)

  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set')

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) })

  try {
    if (command === 'users') {
      const users = await listUsers(prisma)
      if (users.length === 0) console.log('No accounts yet')
      for (const user of users) {
        const family = user.family > 1 ? `family of ${user.family}` : 'alone'
        console.log(`${user.email}\t${user.name}\t${user.createdAt.toISOString().slice(0, 10)}\t${family}`)
      }
      return
    }

    if (command === 'reset-password' && args[0]) {
      const rounds = Number(process.env.NUXT_PASSWORD_HASH_ROUNDS) || 12
      const password = await resetPassword(prisma, args[0], { password: args[1], rounds })
      console.log(`Password for ${args[0]} is reset. All their sessions are signed out.`)
      if (!args[1]) console.log(`New password: ${password}`)
      return
    }

    console.log(USAGE)
    process.exitCode = command ? 1 : 0
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((error: Error) => {
  console.error(error.message)
  process.exit(1)
})
