import type { AppSettings, Prisma } from '~~/prisma/.generated/prisma'

type UserWithSettings = Prisma.UserGetPayload<{
  include: { settings: true }
}>

interface WithDecimal { amount: { toNumber: () => number } }
type Mapped<T extends WithDecimal> = Omit<T, 'amount'> & { amount: number }

export function toPublicSettings(settings: AppSettings) {
  return {
    settings: {
      theme: settings.theme,
      accent: settings.accent,
      lang: settings.lang,
      pinEnabled: settings.pinEnabled,
      pinHash: settings.pinEnabled ? settings.pinHash : null

    }
  }
}

export function toPublicUser(user: UserWithSettings) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    settings: toPublicSettings(user.settings!)
  }
}

export function mapAmount<T extends WithDecimal>(obj: T): Mapped<T> {
  return { ...obj, amount: obj.amount.toNumber() }
}
