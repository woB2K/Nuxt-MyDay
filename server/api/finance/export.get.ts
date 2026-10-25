import { z } from 'zod'
import en from '~~/i18n/locales/en.json'
import ru from '~~/i18n/locales/ru.json'
import { categoryName, EXPORT_HEADER, exportAmount, safeText, toCsv } from '~~/server/utils/csvExport'
import { getHousehold } from '~~/server/utils/household'
import { transactionWhere } from '~~/server/utils/transactionWhere'
import { toCurrency } from '~~/shared/currency'
import { transactionFilterQuerySchema } from '~~/shared/schemas'

const CATEGORY_NAMES: Record<'en' | 'ru', Record<string, string>> = { en: en.categories, ru: ru.categories }

const exportQuerySchema = z.object({ lang: z.enum(['en', 'ru']).default('en') })

export default defineEventHandler(async (event) => {
  const household = await getHousehold(event)
  const query = getQuery(event)
  const filters = transactionFilterQuerySchema.parse(query)
  const { lang } = exportQuerySchema.parse(query)

  const [transactions, { currency }] = await Promise.all([
    prisma.transaction.findMany({
      where: transactionWhere(household.id, filters),
      orderBy: [{ date: 'asc' }, { createdAt: 'asc' }],
      include: {
        category: { select: { name: true, key: true } },
        user: { select: { name: true } },
        tags: { select: { tag: { select: { name: true } } } }
      }
    }),
    prisma.household.findUniqueOrThrow({ where: { id: household.id }, select: { currency: true } })
  ])

  const code = toCurrency(currency)
  const rows = transactions.map(item => [
    item.date.toISOString().slice(0, 10),
    item.type === 'INCOME' ? 'income' : 'expense',
    exportAmount(item.amount.toNumber()),
    code,
    categoryName(item.category, CATEGORY_NAMES[lang]),
    item.tags.map(link => link.tag.name).join(', '),
    item.notes ?? '',
    item.user.name
  ].map(safeText))

  const name = ['myday', filters.from, filters.to].filter(Boolean).join('-')

  setResponseHeader(event, 'Content-Type', 'text/csv; charset=utf-8')
  setResponseHeader(event, 'Content-Disposition', `attachment; filename="${name}.csv"`)

  return toCsv([EXPORT_HEADER, ...rows])
})
