<script lang="ts" setup>
import type { HabitItem } from '~~/shared/types'
import { toDateString } from '~/utils/formatDate'
import { habitsProgress, moveItem } from '~/utils/habits'

definePageMeta({ hideFab: true })

interface DragState {
  from: number
  to: number
  dy: number
  step: number
  startY: number
}

const ROW_GAP = 8

const { t } = useI18n()

const { data: habits, isPending } = useHabitsQuery()
const { mutate: reorder } = useReorderHabitsMutation()
const { mutate: deleteHabit } = useDeleteHabitMutation()

const today = computed(() => toDateString())
const { fx, toggle } = useHabitMarking(today)

const rows = ref<HabitItem[]>([])
const drag = ref<DragState | null>(null)
const settling = ref(false)
const reordering = ref(false)
const sheetOpen = ref(false)

watch(habits, (value) => {
  if (!drag.value) rows.value = value ?? []
}, { immediate: true })

const canReorder = computed(() => rows.value.length > 1)

watch(canReorder, (can) => {
  if (!can) reordering.value = false
})

const progress = computed(() => habitsProgress(rows.value, today.value))

const subtitle = computed(() => {
  if (reordering.value) return t('habits.list.reorderHint')

  const params = { n: progress.value.done, m: progress.value.total }

  return progress.value.weekly ? t('habits.list.subWeek', params) : t('habits.list.sub', params)
})

function shiftOf(index: number): number {
  const state = drag.value
  if (!state) return 0
  if (index === state.from) return state.dy
  if (state.from < state.to && index > state.from && index <= state.to) return -state.step
  if (state.from > state.to && index < state.from && index >= state.to) return state.step

  return 0
}

function rowStyle(index: number) {
  const dragged = drag.value?.from === index

  return {
    transform: `translateY(${shiftOf(index)}px)`,
    transition: dragged || settling.value ? 'none' : 'transform 200ms var(--ease-out)',
    zIndex: dragged ? 10 : undefined
  }
}

function startDrag(event: PointerEvent, index: number) {
  if (!reordering.value) return

  const target = event.target as HTMLElement | null
  if (!target?.closest('[data-grip]')) return

  const row = event.currentTarget as HTMLElement
  row.setPointerCapture?.(event.pointerId)
  drag.value = { from: index, to: index, dy: 0, step: row.offsetHeight + ROW_GAP, startY: event.clientY }
}

function moveDrag(event: PointerEvent) {
  const state = drag.value
  if (!state) return

  const dy = event.clientY - state.startY
  const to = Math.min(rows.value.length - 1, Math.max(0, state.from + Math.round(dy / state.step)))

  drag.value = { ...state, dy, to }
}

function endDrag() {
  const state = drag.value
  if (!state) return

  drag.value = null
  if (state.to === state.from) return

  settling.value = true
  rows.value = moveItem(rows.value, state.from, state.to)
  reorder(rows.value.map(habit => habit.id))
  requestAnimationFrame(() => {
    settling.value = false
  })
}

function mark(habit: HabitItem) {
  toggle(rows.value, habit)
}

function remove(habit: HabitItem) {
  deleteHabit({ id: habit.id, name: habit.name })
}
</script>

<template>
  <div class="flex flex-col px-5 pt-1">
    <button
      class="-ml-1.5 flex h-11 items-center gap-0.5 self-start text-accent"
      type="button"
      @click="navigateTo('/today')"
    >
      <UIcon name="i-lucide-chevron-left" class="size-6" />
      <span class="text-base font-medium">{{ t('habits.list.back') }}</span>
    </button>

    <div class="mt-1 flex items-end justify-between gap-3">
      <h1 class="font-display text-[34px] leading-10 font-bold tracking-[-0.02em] text-text">
        {{ t('habits.title') }}
      </h1>
      <button
        v-if="canReorder && !isPending"
        class="h-9 px-1 text-[15px] font-semibold text-accent"
        type="button"
        data-reorder
        @click="reordering = !reordering"
      >
        {{ reordering ? t('habits.list.done') : t('habits.list.reorder') }}
      </button>
    </div>

    <UiSkeleton v-if="isPending" class="mt-2.5" :w="120" :h="14" />
    <span v-else-if="rows.length" class="mt-1 text-[15px] text-text-dim" data-subtitle>{{ subtitle }}</span>

    <div class="mt-5 flex flex-col gap-2">
      <template v-if="isPending">
        <div
          v-for="n in 4"
          :key="n"
          class="flex min-h-[68px] items-center gap-3 rounded-lg border border-hairline bg-elev1 py-3 pr-4 pl-3.5"
          data-skeleton
        >
          <UiSkeleton :w="44" :h="44" :r="9999" />
          <div class="flex flex-1 flex-col gap-[9px]">
            <UiSkeleton class="!w-[55%]" :h="13" />
            <UiSkeleton class="!w-[45%]" :h="8" :r="3" />
          </div>
          <UiSkeleton :w="30" :h="30" :r="9999" />
        </div>
      </template>

      <div
        v-for="(habit, index) in rows"
        v-else
        :key="habit.id"
        class="relative"
        :style="rowStyle(index)"
        data-reorder-row
        @pointerdown="startDrag($event, index)"
        @pointermove="moveDrag"
        @pointerup="endDrag"
        @pointercancel="endDrag"
      >
        <div class="animate-step-in" :style="{ animationDelay: `${index * 30}ms` }">
          <UiSwipeRow class="rounded-lg" :deletable="!reordering" @delete="remove(habit)">
            <HabitRow
              :habit="habit"
              :today="today"
              :fx="fx[habit.id]"
              :reorder="reordering"
              @toggle="mark(habit)"
              @open="navigateTo(`/habits/${habit.id}`)"
            />
          </UiSwipeRow>
        </div>
      </div>
    </div>

    <div v-if="!isPending && !rows.length" class="flex flex-col items-center px-6 pt-[72px] text-center" data-empty>
      <span class="mb-4 flex size-16 items-center justify-center rounded-full bg-elev2 text-text-mute">
        <UIcon name="i-lucide-flame" class="size-7" />
      </span>
      <span class="mb-1.5 font-display text-lg font-semibold text-text">{{ t('habits.list.emptyTitle') }}</span>
      <span class="text-sm text-text-dim">{{ t('habits.list.emptySub') }}</span>
    </div>

    <span
      v-if="!isPending && rows.length && !reordering"
      class="mt-4 text-center text-xs leading-4 text-text-mute"
      data-hint
    >{{ t('habits.list.hint') }}</span>

    <UiFab v-if="!reordering" @click="sheetOpen = true" />
    <HabitSheet v-model:open="sheetOpen" />
  </div>
</template>
