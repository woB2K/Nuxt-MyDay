import type { AppSettings, Prisma, Transaction } from '~~/prisma/.generated/prisma'

type UserWithSettings = Prisma.UserGetPayload<{
  include: { settings: true }
}>

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

export function mapTransaction(tx: Transaction) {
  return {
    ...tx,
    amount: tx.amount.toNumber()
  }
}
