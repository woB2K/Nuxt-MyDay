<script lang="ts" setup>
import type { TrashKind } from '~~/shared/types'
import { TRASH_RETENTION_DAYS } from '~~/shared/schemas'
import { categoryLabel } from '~/utils/categoryLabel'
import { savingsEntryLooks } from '~/utils/savingsLooks'
import { trashDaysLeft, trashSize } from '~/utils/trash'

definePageMeta({ hideFab: true })

interface Row {
  kind: TrashKind
  id: string
  icon: string
  title: string
  caption: string
  tileClass?: string
  tileColor?: string
  inkClass?: string
  amount?: string
}

const { t } = useI18n()

const { data: trash, isPending } = useTrashQuery()
const { data: categories } = useCategoriesQuery()
const { mutate: restoreTask } = useRestoreTaskMutation()
const { mutate: restoreTransaction } = useRestoreTransactionMutation()
const { mutate: restoreSavings } = useRestoreSavingsMutation()
const { mutate: deleteForever } = useDeleteForeverMutation()
const { mutate: emptyTrash, isPending: isEmptying } = useEmptyTrashMutation()

const confirmOpen = ref(false)

const size = computed(() => trashSize(trash.value))

const restoreAction = computed(() => ({
  label: t('settings.trashScreen.restore'),
  icon: 'i-lucide-rotate-ccw',
  gradient: 'linear-gradient(90deg, var(--c-accent) 0%, var(--c-accent-soft) 100%)',
  inkColor: 'var(--c-accent-ink)'
}))

function daysLeft(deletedAt: Date | string | null) {
  const days = trashDaysLeft(deletedAt ?? new Date())
  return t('settings.trashScreen.daysLeft', { count: days }, days)
}

const sections = computed(() => {
  if (!trash.value) return []

  const tasks: Row[] = trash.value.tasks.map(task => ({
    kind: 'task',
    id: task.id,
    icon: 'i-lucide-square-check',
    tileClass: 'bg-accent-soft',
    inkClass: 'text-accent',
    title: task.title,
    caption: daysLeft(task.deletedAt)
  }))

  const transactions: Row[] = trash.value.transactions.map((transaction) => {
    const category = categories.value?.find(el => el.id === transaction.categoryId)
    const label = category ? categoryLabel(category, t) : ''
    const income = transaction.type === 'INCOME'

    return {
      kind: 'transaction',
      id: transaction.id,
      icon: category?.icon ?? 'i-lucide-receipt',
      tileColor: category?.color,
      tileClass: category ? undefined : 'bg-elev3',
      inkClass: income ? 'text-success' : 'text-text',
      title: transaction.notes || label,
      caption: [label, daysLeft(transaction.deletedAt)].filter(Boolean).join(' · '),
      amount: `${income ? '+' : '-'}${formatAmount(transaction.amount)} ₽`
    }
  })

  const savings: Row[] = trash.value.savings.map((entry) => {
    const looks = savingsEntryLooks[entry.type]

    return {
      kind: 'savings',
      id: entry.id,
      icon: looks.icon,
      tileClass: looks.tile,
      inkClass: looks.ink,
      title: entry.notes || t(looks.title),
      caption: daysLeft(entry.deletedAt),
      amount: `${looks.sign}${formatAmount(entry.amount)} ₽`
    }
  })

  return [
    { key: 'tasks', title: t('settings.trashScreen.tasks'), rows: tasks },
    { key: 'transactions', title: t('settings.trashScreen.transactions'), rows: transactions },
    { key: 'savings', title: t('settings.trashScreen.savings'), rows: savings }
  ].filter(section => section.rows.length)
})

function restore(row: Row) {
  if (row.kind === 'task') restoreTask(row.id)
  if (row.kind === 'transaction') restoreTransaction(row.id)
  if (row.kind === 'savings') restoreSavings(row.id)
}

function confirmEmpty() {
  emptyTrash(undefined, {
    onSettled: () => {
      confirmOpen.value = false
    }
  })
}
</script>

<template>
  <div class="flex flex-col gap-3 p-4">
    <UiRoundBtn class="mb-1 self-start" @click="navigateTo('/settings')">
      <UIcon name="i-lucide-chevron-left" class="w-4.5 h-4.5" />
    </UiRoundBtn>

    <div class="flex flex-col gap-1">
      <h1 class="text-3xl font-bold text-text">
        {{ t('settings.trashScreen.title') }}
      </h1>
      <span class="text-sm text-text-dim">{{ t('settings.trashScreen.subtitle', { days: TRASH_RETENTION_DAYS }) }}</span>
      <span v-if="size" class="text-xs text-text-mute">{{ t('settings.trashScreen.hint') }}</span>
    </div>

    <template v-if="isPending">
      <UiSkeletonRow v-for="n in 4" :key="n" />
    </template>

    <UiEmptyState
      v-else-if="!size"
      icon="i-lucide-trash-2"
      :title="t('settings.trashScreen.emptyTitle')"
      :subtitle="t('settings.trashScreen.emptySubtitle', { days: TRASH_RETENTION_DAYS })"
    />

    <template v-else>
      <section v-for="section in sections" :key="section.key" :data-section="section.key">
        <UiSectionHeader class="px-1" :title="section.title" :caption="`${section.rows.length}`" />

        <UiCard :padding="0" class="overflow-hidden border border-hairline">
          <template v-for="(row, index) in section.rows" :key="row.id">
            <div v-if="index > 0" class="h-px ml-[66px] bg-hairline" />
            <UiSwipeRow
              :right-action="restoreAction"
              @complete="restore(row)"
              @delete="deleteForever({ kind: row.kind, id: row.id })"
            >
              <TrashRow v-bind="row" />
            </UiSwipeRow>
          </template>
        </UiCard>
      </section>

      <button
        class="mt-2 w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-danger/10 text-danger text-[15px] font-semibold disabled:opacity-50"
        type="button"
        :disabled="isEmptying"
        @click="confirmOpen = true"
      >
        <UIcon name="i-lucide-trash-2" class="w-4.5 h-4.5" />
        {{ t('settings.trashScreen.empty') }}
      </button>
    </template>

    <UiSheet v-model:open="confirmOpen" :title="t('settings.trashScreen.confirmTitle')">
      <div class="flex flex-col gap-3">
        <p class="text-sm text-text-dim">
          {{ t('settings.trashScreen.confirmText', { count: size }, size) }}
        </p>
        <button
          class="w-full h-12 rounded-xl bg-danger text-white text-[15px] font-semibold disabled:opacity-50"
          type="button"
          data-confirm
          :disabled="isEmptying"
          @click="confirmEmpty"
        >
          {{ t('settings.trashScreen.confirm') }}
        </button>
        <UiButton variant="ghost" class="w-full" @click="confirmOpen = false">
          {{ t('settings.trashScreen.cancel') }}
        </UiButton>
      </div>
    </UiSheet>
  </div>
</template>
