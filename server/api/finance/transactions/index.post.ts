import { isUniqueViolation } from '~~/server/utils/dbError'
import { ownedFinanceTagIds } from '~~/server/utils/financeTags'
import { getHousehold } from '~~/server/utils/household'
import { toTransactionItem, transactionTags } from '~~/server/utils/mapper'
import { createTransactionSchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId
  const household = await getHousehold(event)

  const { id, tagIds, ...body } = await readValidatedBody(event, createTransactionSchema.parse)

  async function alreadyCreated() {
    if (!id) return null

    const existing = await prisma.transaction.findFirst({
      where: { id, householdId: household.id, userId },
      include: transactionTags
    })

    return existing && toTransactionItem(existing)
  }

  const replay = await alreadyCreated()

  if (replay) return replay

  const category = await prisma.category.findFirst({
    where: { id: body.categoryId, householdId: household.id }
  })

  if (!category) throw createError({ statusCode: 400, message: 'Invalid category ID' })
  if (category.type !== body.type) throw createError({ statusCode: 400, message: 'Category type does not match transaction type' })

  const ownedTagIds = await ownedFinanceTagIds(household.id, tagIds)

  try {
    const transaction = await prisma.transaction.create({
      data: {
        ...(id && { id }),
        ...body,
        date: new Date(body.date),
        householdId: household.id,
        userId,
        ...(ownedTagIds?.length && { tags: { create: ownedTagIds.map(tagId => ({ tagId })) } })
      },
      include: transactionTags
    })

    return toTransactionItem(transaction)
  } catch (error) {
    if (!id || !isUniqueViolation(error)) throw error

    const winner = await alreadyCreated()

    if (!winner) throw createError({ statusCode: 409, message: 'Transaction ID is already taken' })

    return winner
  }
})
