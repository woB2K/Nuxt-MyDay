import { exportAmount, safeText, SAVINGS_EXPORT_HEADER, toCsv } from '~~/server/utils/csvExport'
import { timestampRange } from '~~/server/utils/dateRange'
import { getHousehold, savingsScope } from '~~/server/utils/household'
import { dateRangeQuerySchema } from '~~/shared/schemas'

const CURRENCY = 'RUB'

export default defineEventHandler(async (event) => {
  const scope = savingsScope(event.context.userId, await getHousehold(event))
  const { from, to } = await getValidatedQuery(event, dateRangeQuerySchema.parse)
  const createdAt = timestampRange(from, to)

  const entries = await prisma.savingsEntry.findMany({
    where: { ...scope, deletedAt: null, ...(createdAt && { createdAt }) },
    orderBy: { createdAt: 'asc' },
    include: {
      goal: { select: { name: true } },
      user: { select: { name: true } }
    }
  })

  const rows = entries.map(entry => [
    entry.createdAt.toISOString().slice(0, 10),
    entry.type.toLowerCase(),
    exportAmount(entry.amount.toNumber()),
    CURRENCY,
    entry.goal?.name ?? '',
    entry.notes ?? '',
    entry.user.name
  ].map(safeText))

  const name = ['myday-savings', from, to].filter(Boolean).join('-')

  setResponseHeader(event, 'Content-Type', 'text/csv; charset=utf-8')
  setResponseHeader(event, 'Content-Disposition', `attachment; filename="${name}.csv"`)

  return toCsv([SAVINGS_EXPORT_HEADER, ...rows])
})
