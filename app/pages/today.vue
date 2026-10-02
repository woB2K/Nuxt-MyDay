<script lang="ts" setup>
import type { TaskItem } from '~~/shared/types'
import { useFabAction } from '~/composables/useFabAction'
import { fromDateString, toDateString } from '~/utils/formatDate'
import {
  completionStreak,
  doneTodayCount,
  focusTask,
  sortTasks,
  todayTasks
} from '~/utils/taskStats'

const { t, locale } = useI18n()

const authStore = useAuthStore()

const filter = ref<TaskFilter>('all')
const search = ref('')

const { data: tasks, isPending } = useTasksQuery(filter, search)
const { mutate: toggleTask } = useToggleTaskMutation()
const { mutate: deleteTask } = useDeleteTaskMutation()

const today = computed(() => toDateString())

const list = computed(() => sortTasks(todayTasks(tasks.value ?? [], today.value)))
const focus = computed(() => focusTask(list.value))
const doneCount = computed(() => doneTodayCount(list.value, today.value))
const streak = computed(() => completionStreak(tasks.value ?? []))
const openCount = computed(() => list.value.length - doneCount.value)

const greeting = computed(() => {
  const hour = new Date().getHours()
  const part = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening'
  const name = authStore.user?.name

  return name ? `${t(`tasks.greeting.${part}`)}, ${name}` : t(`tasks.greeting.${part}`)
})

const dateLabel = computed(() => {
  const label = new Intl.DateTimeFormat(locale.value, { weekday: 'long', day: 'numeric', month: 'long' })
    .format(fromDateString(today.value))

  return label.charAt(0).toUpperCase() + label.slice(1)
})

function toggle(task: TaskItem, done = !task.done) {
  toggleTask({ id: task.id, done })
}

const sheetOpen = ref(false)
const editing = ref<TaskItem | null>(null)

function openSheet(task: TaskItem | null = null) {
  editing.value = task
  sheetOpen.value = true
}

useFabAction(() => openSheet())
</script>

<template>
  <div class="flex flex-col p-4 gap-3">
    <div class="flex flex-col gap-1">
      <h1 class="text-3xl font-bold text-text">
        {{ greeting }}
      </h1>
      <span class="text-sm text-text-dim">{{ dateLabel }}</span>
    </div>

    <div class="grid grid-cols-2 gap-3">
      <UiStatsCard type="streak" :value="streak" />
      <UiStatsCard type="progress" :value="doneCount" :total="list.length" />
    </div>

    <template v-if="isPending">
      <UiSkeleton class="h-28 rounded-2xl" />
      <UiCard :padding="0" class="overflow-hidden border border-hairline">
        <UiSkeletonRow v-for="n in 5" :key="n" />
      </UiCard>
    </template>

    <template v-else>
      <FocusCard
        v-if="focus"
        :task="focus"
        class="mt-1"
        @toggle="done => toggle(focus!, done)"
        @open="openSheet(focus)"
      />

      <UiSectionHeader :title="t('tasks.today')" :caption="`${openCount}`" />

      <UiEmptyState
        v-if="list.length === 0"
        icon="i-lucide-sun"
        :title="t('tasks.empty')"
        :subtitle="t('tasks.emptySub')"
      />

      <UiCard v-else :padding="0" class="overflow-hidden border border-hairline">
        <template v-for="(task, index) in list" :key="task.id">
          <div v-if="index > 0" class="h-px ml-[58px] bg-hairline" />
          <UiSwipeRow
            completable
            :completed="task.done"
            @complete="toggle(task)"
            @delete="deleteTask(task.id)"
          >
            <UiTaskRow
              :task="task"
              class="cursor-pointer"
              @toggle="done => toggle(task, done)"
              @open="openSheet(task)"
            />
          </UiSwipeRow>
        </template>
      </UiCard>
    </template>

    <TaskSheet v-model:open="sheetOpen" :task="editing" />
  </div>
</template>
