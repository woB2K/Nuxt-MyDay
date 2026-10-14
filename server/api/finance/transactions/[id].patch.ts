import { ownedFinanceTagIds } from '~~/server/utils/financeTags'
import { getHousehold } from '~~/server/utils/household'
import { toTransactionItem, transactionTags } from '~~/server/utils/mapper'
import { updateTransactionSchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  const household = await getHousehold(event)
  const transactionId = getRouterParam(event, 'id')
  const { date, tagIds, ...rest } = await readValidatedBody(event, updateTransactionSchema.parse)

  const current = await prisma.transaction.findFirst({
    where: { id: transactionId, householdId: household.id, deletedAt: null }
  })

  if (!current) throw createError({ statusCode: 404, message: 'Transaction not found' })

  if (rest.categoryId !== undefined || rest.type !== undefined) {
    const categoryId = rest.categoryId ?? current.categoryId
    const type = rest.type ?? current.type

    const category = await prisma.category.findFirst({ where: { id: categoryId, householdId: household.id } })

    if (!category) throw createError({ statusCode: 400, message: 'Invalid category ID' })
    if (category.type !== type) throw createError({ statusCode: 400, message: 'Category type does not match transaction type' })
  }

  const ownedTagIds = await ownedFinanceTagIds(household.id, tagIds)

  const transaction = await prisma.transaction.update({
    where: {
      id: transactionId,
      householdId: household.id
    },
    data: {
      ...rest,
      ...(date && { date: new Date(date) }),
      ...(ownedTagIds && { tags: { deleteMany: {}, create: ownedTagIds.map(tagId => ({ tagId })) } })
    },
    include: transactionTags
  })

  return toTransactionItem(transaction)
})
