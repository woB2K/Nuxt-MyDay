export default defineEventHandler(async (event) => {
  await prisma.householdMember.update({
    where: { userId: event.context.userId },
    data: { removedAt: null }
  })

  return { ok: true }
})
