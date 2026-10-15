import type { AppSettings, Prisma } from '~~/prisma/.generated/prisma'

type UserWithSettings = Prisma.UserGetPayload<{
  include: { settings: true }
}>

interface WithDecimal { amount: { toNumber: () => number } }
type Mapped<T extends WithDecimal> = Omit<T, 'amount'> & { amount: number }

export function toPublicSettings(settings: AppSettings) {
  return {
    theme: settings.theme,
    accent: settings.accent,
    lang: settings.lang,
    pinEnabled: settings.pinEnabled,
    habitsOnToday: settings.habitsOnToday
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

export function normalizeTags<TTag, T extends { tags: { tag: TTag }[] }>(
  obj: T
): Omit<T, 'tags'> & { tags: TTag[] } {
  return { ...obj, tags: obj.tags.map(el => el.tag) }
}

export function mapAmount<T extends WithDecimal>(obj: T): Mapped<T> {
  return { ...obj, amount: obj.amount.toNumber() }
}

export const transactionTags = { tags: { select: { tagId: true } } } as const

export function toTransactionItem<T extends WithDecimal & { tags: { tagId: string }[] }>(transaction: T) {
  const { tags, ...rest } = mapAmount(transaction)

  return { ...rest, tagIds: tags.map(tag => tag.tagId) }
}
