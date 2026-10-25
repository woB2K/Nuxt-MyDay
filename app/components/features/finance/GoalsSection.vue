<script lang="ts" setup>
import type { SavingsGoalItem } from '~~/shared/types'
import { formatLongDay } from '~/utils/formatDate'
import { goalProgress } from '~/utils/goals'

const emit = defineEmits<{ edit: [goal: SavingsGoalItem | null] }>()

const { t, locale } = useI18n()
const { hidden } = useMoney()
const { money } = useCurrency()
const { data: goals } = useGoalsQuery()

const rows = computed(() => (goals.value ?? []).map((goal) => {
  const progress = goalProgress(goal)
  const until = goal.deadline ? t('finance.goals.until', { date: formatLongDay(goal.deadline, locale.value) }) : ''

  let status = until
  let tone = 'text-text-mute'

  if (progress.reached) {
    status = t('finance.goals.reached')
    tone = 'text-success'
  } else if (progress.overdue) {
    status = t('finance.goals.overdue')
    tone = 'text-warning'
  } else if (progress.monthly && !hidden.value) {
    status = `${until} · ${t('finance.goals.monthly', { amount: money(progress.monthly) })}`
  }

  return { goal, progress, status, tone }
}))
</script>

<template>
  <div class="flex flex-col">
    <UiSectionHeader :title="t('finance.goals.title')" :caption="rows.length ? `${rows.length}` : ''">
      <template v-if="rows.length" #action>
        <button
          class="flex size-8 items-center justify-center rounded-full bg-accent-soft text-accent"
          type="button"
          :aria-label="t('finance.goals.add')"
          data-testid="goal-add"
          @click="emit('edit', null)"
        >
          <UIcon name="i-lucide-plus" class="size-4.5" />
        </button>
      </template>
    </UiSectionHeader>

    <button
      v-if="!rows.length"
      class="flex items-center gap-3 rounded-2xl border border-dashed border-hairline2 p-4 text-left"
      type="button"
      data-testid="goal-add"
      @click="emit('edit', null)"
    >
      <UiIconDisc icon="i-lucide-target" :size="40" />
      <span class="flex min-w-0 flex-1 flex-col">
        <span class="text-[15px] font-semibold text-text">{{ t('finance.goals.emptyTitle') }}</span>
        <span class="text-[13px] text-text-dim">{{ t('finance.goals.emptySub') }}</span>
      </span>
      <UIcon name="i-lucide-plus" class="size-5 shrink-0 text-accent" />
    </button>

    <div v-else class="flex flex-col gap-2">
      <button
        v-for="{ goal, progress, status, tone } in rows"
        :key="goal.id"
        class="flex flex-col gap-2 rounded-2xl border border-hairline bg-elev2 p-4 text-left transition-transform duration-fast active:scale-[0.99]"
        type="button"
        data-testid="goal-row"
        @click="emit('edit', goal)"
      >
        <span class="flex items-center justify-between gap-3">
          <span class="truncate text-[15px] font-semibold text-text">{{ goal.name }}</span>
          <span class="shrink-0 text-[13px] font-semibold" :class="progress.reached ? 'text-success' : 'text-text-dim'">
            {{ Math.floor(progress.percent) }}%
          </span>
        </span>
        <span class="h-2 overflow-hidden rounded-full bg-hairline">
          <span
            class="block h-full rounded-full bg-[linear-gradient(90deg,#5EEAD4,var(--c-accent))] transition-[width] duration-500"
            :style="{ width: `${progress.percent}%` }"
          />
        </span>
        <span class="flex items-center justify-between gap-3 text-xs">
          <span class="text-text-dim" data-testid="goal-saved">
            <UiMoney :amount="goal.saved" /> {{ t('finance.goals.of') }} <UiMoney :amount="goal.target" />
          </span>
          <span v-if="status" class="truncate text-right" :class="tone">{{ status }}</span>
        </span>
      </button>
    </div>
  </div>
</template>
