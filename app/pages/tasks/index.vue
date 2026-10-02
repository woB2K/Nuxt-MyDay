<script lang="ts" setup>
import type { TaskItem } from '~~/shared/types'
import type { TaskFilter } from '~/utils/taskFilters'
import { useFabAction } from '~/composables/useFabAction'
import { sortTasks } from '~/utils/taskStats'

const { t } = useI18n()

const tasksStore = useTasksStore()
const filter = toRef(tasksStore, 'activeFilter')
const search = toRef(tasksStore, 'searchQuery')

const { data: tasks, isPending } = useTasksQuery(filter, search)
const { mutate: toggleTask } = useToggleTaskMutation()
const { mutate: deleteTask } = useDeleteTaskMutation()

const list = computed(() => sortTasks(tasks.value ?? []))

const sheetOpen = ref(false)
const editing = ref<TaskItem | null>(null)

function openSheet(task: TaskItem | null = null) {
  editing.value = task
  sheetOpen.value = true
}

function toggle(task: TaskItem, done = !task.done) {
  toggleTask({ id: task.id, done })
}

function applyFilter(next: TaskFilter) {
  tasksStore.activeFilter = next
}

function applySearch(next: string) {
  tasksStore.searchQuery = next
}

useFabAction(() => openSheet())
</script>

<template>
  <div class="flex flex-col p-4 gap-3">
    <div class="flex items-start justify-between gap-3">
      <div class="flex flex-col gap-1">
        <h1 class="text-3xl font-bold text-text">
          {{ t('tasks.allTasks') }}
        </h1>
        <span class="text-sm text-text-dim">{{ t('tasks.count', { count: list.length }, list.length) }}</span>
      </div>

      <UiRoundBtn class="mt-1" @click="navigateTo('/tasks/templates')">
        <UIcon name="i-lucide-repeat" class="w-4.5 h-4.5" />
      </UiRoundBtn>
    </div>

    <TaskFilterBar
      :filter="tasksStore.activeFilter"
      :search="tasksStore.searchQuery"
      @update:filter="applyFilter"
      @update:search="applySearch"
    />

    <template v-if="isPending">
      <UiCard :padding="0" class="overflow-hidden border border-hairline">
        <UiSkeletonRow v-for="n in 8" :key="n" />
      </UiCard>
    </template>

    <template v-else-if="list.length === 0">
      <UiEmptyState
        :icon="tasksStore.filtersActive ? 'i-lucide-search-x' : 'i-lucide-list-todo'"
        :title="tasksStore.filtersActive ? t('tasks.filters.noResults') : t('tasks.emptyAll')"
        :subtitle="tasksStore.filtersActive ? t('tasks.filters.noResultsSub') : t('tasks.emptyAllSub')"
      >
        <template v-if="tasksStore.filtersActive" #action>
          <UiButton size="sm" variant="secondary" @click="tasksStore.resetFilters()">
            {{ t('tasks.filters.clearFilters') }}
          </UiButton>
        </template>
      </UiEmptyState>
    </template>

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

    <TaskSheet v-model:open="sheetOpen" :task="editing" />
  </div>
</template>
