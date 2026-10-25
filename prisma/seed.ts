import process from 'node:process'
import { PrismaPg } from '@prisma/adapter-pg'
import { resetDemo } from '../scripts/admin/demo'
import { PrismaClient } from './.generated/prisma/index.js'

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) })

async function main() {
  if (await prisma.user.count() > 0) {
    console.error('The database already has accounts. The seed only fills an empty database with the demo family.')
    process.exitCode = 1
    return
  }

  const lang = process.env.DEMO_LANG === 'en' ? 'en' : 'ru'
  const { email, password } = await resetDemo(prisma, { lang, rounds: 4 })
  process.stdout.write(`Demo family is ready (${lang}). Sign in as ${email} / ${password}\n`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
