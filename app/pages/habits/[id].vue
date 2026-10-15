<script lang="ts" setup>
import { toDateString } from '~/utils/formatDate'
import { habitColor, habitIconName, habitSoft, habitStats, markRate, weeksOnPlan } from '~/utils/habits'

definePageMeta({ hideFab: true })

const route = useRoute()
const { t } = useI18n()
const labels = useHabitLabels()

const { data: habits, isPending } = useHabitsQuery()
const { mutate: deleteHabit } = useDeleteHabitMutation()

const today = computed(() => toDateString())
const { fx, toggle } = useHabitMarking(today)

const id = computed(() => String(route.params.id))
const habit = computed(() => habits.value?.find(item => item.id === id.value) ?? null)
const stats = computed(() => (habit.value ? habitStats(habit.value, today.value) : null))
const tint = computed(() => (habit.value ? habitColor(habit.value.color) : ''))
const soft = computed(() => (habit.value ? habitSoft(habit.value.color) : ''))
const habitFx = computed(() => (habit.value ? fx.value[habit.value.id] ?? null : null))

const sheetOpen = ref(false)

watch([habits, habit], ([list, current]) => {
  if (list && !current) navigateTo('/habits', { replace: true })
}, { immediate: true })

const weekLine = computed(() => {
  const value = stats.value
  if (!value || !habit.value?.perWeek) return ''
  if (value.atRisk) return t('habits.detail.weekRisk', { need: value.need, n: value.current })
  if (value.planDone) return t('habits.detail.weekDone')

  return t('habits.detail.weekProgress', { n: value.weekCount, m: habit.value.perWeek })
})

const planTile = computed(() => {
  if (!habit.value) return ''
  const { ok, total } = weeksOnPlan(habit.value, today.value)

  return total ? t('habits.detail.weeksValue', { n: ok, m: total }) : '—'
})

function mark(date?: string) {
  if (habit.value) toggle(habits.value ?? [], habit.value, date)
}

function remove() {
  if (habit.value) deleteHabit({ id: habit.value.id, name: habit.value.name })
}
</script>

<template>
  <div class="flex flex-col px-5 pt-1">
    <button
      class="-ml-1.5 flex h-11 items-center gap-0.5 self-start text-accent"
      type="button"
      @click="navigateTo('/habits')"
    >
      <UIcon name="i-lucide-chevron-left" class="size-6" />
      <span class="text-base font-medium">{{ t('habits.detail.back') }}</span>
    </button>

    <template v-if="isPending">
      <div class="mt-2 flex items-center gap-3.5" data-skeleton>
        <UiSkeleton :w="56" :h="56" :r="9999" />
        <UiSkeleton :w="160" :h="24" />
      </div>
      <UiSkeleton class="mt-5" :h="52" :r="12" />
      <UiSkeleton class="mt-4" :h="96" :r="16" />
      <UiSkeleton class="mt-4" :h="320" :r="16" />
    </template>

    <template v-else-if="habit && stats">
      <div class="mt-2 flex items-center gap-3.5">
        <span
          class="flex size-14 shrink-0 items-center justify-center rounded-full"
          :style="{ backgroundColor: soft, color: tint }"
        >
          <UIcon :name="habitIconName(habit.icon)" class="size-[26px]" />
        </span>
        <div class="min-w-0">
          <h1 class="font-display text-[28px] leading-[34px] font-bold tracking-[-0.02em] text-balance break-words text-text">
            {{ habit.name }}
          </h1>
          <div class="mt-0.5 flex items-center gap-[5px] text-sm font-medium text-text-dim" data-plan>
            <UIcon name="i-lucide-repeat" class="size-3.5" />
            {{ labels.plan(habit.perWeek) }}
          </div>
        </div>
      </div>

      <button
        :key="`mark-${habitFx?.key ?? 0}`"
        class="mt-5 flex h-13 w-full items-center justify-center gap-2 rounded-xl text-base font-semibold"
        type="button"
        :style="{
          backgroundColor: stats.doneToday ? tint : soft,
          color: stats.doneToday ? 'var(--c-h-ink)' : tint,
          transition: 'background-color 200ms var(--ease-out), color 200ms var(--ease-out)',
          animation: habitFx && habitFx.type !== 'off' ? 'habit-press 320ms var(--ease-spring) both' : 'none',
        }"
        :aria-pressed="stats.doneToday"
        data-mark-today
        @click="mark()"
      >
        <UIcon name="i-lucide-check" class="size-4.5" />
        {{ stats.doneToday ? t('habits.detail.doneToday') : t('habits.detail.markToday') }}
      </button>

      <div
        v-if="stats.weekly"
        class="mt-2 flex items-center justify-center gap-[5px] text-center text-[13px] text-pretty"
        :class="stats.planDone ? 'font-semibold' : 'text-text-dim'"
        :style="stats.planDone ? { color: tint } : undefined"
        data-week-line
      >
        <UIcon v-if="stats.planDone" name="i-lucide-check" class="size-3.5 shrink-0" />
        {{ weekLine }}
      </div>
      <div v-else-if="stats.atRisk" class="mt-2 text-center text-[13px] text-text-dim" data-at-risk>
        {{ t('habits.detail.atRisk', { n: stats.current }) }}
      </div>

      <div class="mt-4 grid grid-cols-3 gap-2">
        <HabitStatTile
          icon="i-lucide-flame"
          :color="stats.active ? tint : 'var(--c-text-mute)'"
          :value="stats.current"
          :label="t('habits.detail.current')"
          data-current
        />
        <HabitStatTile icon="i-lucide-trophy" :color="tint" :value="stats.best" :label="t('habits.detail.best')" data-best>
          <span
            v-if="stats.record"
            :key="`record-${habitFx?.type === 'record' ? habitFx.key : 0}`"
            class="absolute top-2.5 right-2.5 inline-flex h-5 items-center rounded-full px-[7px] text-[11px] font-semibold"
            :style="{
              backgroundColor: soft,
              color: tint,
              animation: habitFx?.type === 'record' ? 'habit-badge 360ms var(--ease-spring) both' : 'none',
            }"
            data-record
          >{{ t('habits.detail.record') }}</span>
        </HabitStatTile>
        <HabitStatTile
          v-if="stats.weekly"
          icon="i-lucide-calendar-check"
          color="var(--c-text-dim)"
          :value="planTile"
          :label="t('habits.detail.weeks')"
          data-third
        />
        <HabitStatTile
          v-else
          icon="i-lucide-percent"
          color="var(--c-text-dim)"
          :value="`${markRate(habit, today)}%`"
          :label="t('habits.detail.rate')"
          data-third
        />
      </div>

      <div v-if="stats.broken" class="mt-2 flex items-start gap-3 rounded-lg border border-hairline bg-elev1 px-4 py-3.5" data-broken>
        <span class="flex size-8 shrink-0 items-center justify-center rounded-full bg-elev3 text-text-dim">
          <UIcon name="i-lucide-rotate-ccw" class="size-4" />
        </span>
        <div>
          <div class="text-[15px] font-semibold text-text">
            {{ t('habits.detail.brokenTitle') }}
          </div>
          <div class="mt-0.5 text-[13px] leading-[18px] text-pretty text-text-dim">
            {{ t('habits.detail.brokenBody', { n: labels.streak(habit, stats.best) }) }}
          </div>
        </div>
      </div>

      <HabitMonthCalendar class="mt-4" :habit="habit" :today="today" @toggle="mark" />

      <div class="mt-5 grid grid-cols-2 gap-2">
        <UiButton variant="secondary" size="md" data-edit @click="sheetOpen = true">
          <UIcon name="i-lucide-pencil" class="size-4" />
          {{ t('habits.detail.edit') }}
        </UiButton>
        <UiButton variant="danger" size="md" data-delete @click="remove">
          <UIcon name="i-lucide-trash-2" class="size-4" />
          {{ t('habits.detail.delete') }}
        </UiButton>
      </div>

      <HabitSheet v-model:open="sheetOpen" :habit="habit" />
    </template>
  </div>
</template>
