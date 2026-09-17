<script lang="ts" setup>
import type { TaskItem, TaskPriority } from '~~/shared/types'
import { toDayKey } from '~/utils/formatDate'
import { priorityKeys } from '~/utils/priority'

const props = defineProps<{
  open: boolean
  task?: TaskItem | null
}>()

const emit = defineEmits<{ 'update:open': [value: boolean] }>()

const { t } = useI18n()
const toast = useAppToast()

const { mutate: addTask, isPending: isAdding } = useAddTaskMutation()
const { mutate: updateTask, isPending: isUpdating } = useUpdateTaskMutation()
const { mutate: deleteTask, isPending: isDeleting } = useDeleteTaskMutation()

const title = ref('')
const notes = ref('')
const priority = ref<TaskPriority>('NONE')
const dueDate = ref('')
const tagIds = ref<string[]>([])

const isEdit = computed(() => !!props.task)
const isPending = computed(() => isAdding.value || isUpdating.value || isDeleting.value)

const priorityColors: Record<TaskPriority, string | undefined> = {
  NONE: undefined,
  LOW: 'var(--c-p-low)',
  MEDIUM: 'var(--c-p-med)',
  HIGH: 'var(--c-p-high)'
}

const priorityOptions = computed(() => priorityKeys.map(key => ({
  value: key,
  label: t(`tasks.priority.${key}`),
  color: priorityColors[key]
})))

const priorityValue = computed({
  get: () => priority.value as string,
  set: (value: string) => { priority.value = value as TaskPriority }
})

function reset() {
  const task = props.task

  title.value = task?.title ?? ''
  notes.value = task?.notes ?? ''
  priority.value = task?.priority ?? 'NONE'
  dueDate.value = task?.dueDate ? toDayKey(task.dueDate) : ''
  tagIds.value = task?.tags.map(tag => tag.id) ?? []
}

watch(() => props.open, (open) => {
  if (open) reset()
}, { immediate: true })

function close() {
  emit('update:open', false)
}

function submit() {
  const value = title.value.trim()

  if (!value) {
    toast.error(t('tasks.error.title'))
    return
  }

  const payload = {
    title: value,
    notes: notes.value.trim(),
    priority: priority.value,
    tagIds: tagIds.value
  }

  if (props.task) {
    updateTask({ id: props.task.id, ...payload, dueDate: dueDate.value || null }, { onSuccess: close })
    return
  }

  addTask({ ...payload, ...(dueDate.value && { dueDate: dueDate.value }) }, { onSuccess: close })
}

function remove() {
  if (!props.task) return

  deleteTask(props.task.id, { onSuccess: close })
}
</script>

<template>
  <UiSheet
    :open="props.open"
    :title="isEdit ? t('tasks.edit') : t('tasks.add')"
    @update:open="emit('update:open', $event)"
  >
    <form class="flex flex-col gap-5" @submit.prevent="submit">
      <UiInput v-model="title" :label="t('tasks.title')" type="text" />

      <div class="flex flex-col gap-2.5">
        <span class="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-dim">
          {{ t('tasks.priorityLabel') }}
        </span>
        <UiPillSelect
          v-model="priorityValue"
          :options="priorityOptions"
          bg-class="bg-elev3"
          full
        />
      </div>

      <div class="flex flex-col gap-2.5">
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-dim">
            {{ t('tasks.dueDate') }}
          </span>
          <button
            v-if="dueDate"
            class="text-[13px] font-semibold text-text-mute"
            type="button"
            @click="dueDate = ''"
          >
            {{ t('tasks.clearDate') }}
          </button>
        </div>

        <UiDateStrip v-model="dueDate" />

        <input
          v-model="dueDate"
          class="h-12 w-full min-w-0 px-3.5 rounded-xl border border-hairline bg-elev2 text-text text-base outline-none"
          type="date"
        >
      </div>

      <TagPicker v-model="tagIds" />

      <UiInput v-model="notes" :label="t('tasks.notes')" multiline :rows="3" />

      <UiButton class="w-full" type="submit" :disabled="isPending">
        {{ t('general.save') }}
      </UiButton>

      <button
        v-if="isEdit"
        class="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-danger/10 text-danger text-[15px] font-semibold disabled:opacity-50"
        :disabled="isPending"
        type="button"
        @click="remove"
      >
        <UIcon name="i-lucide-trash-2" class="w-4.5 h-4.5" />
        {{ t('tasks.delete') }}
      </button>
    </form>
  </UiSheet>
</template>
