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

const { data: tags } = useTagsQuery()
const { mutate: addTask, isPending: isAdding } = useAddTaskMutation()
const { mutate: updateTask, isPending: isUpdating } = useUpdateTaskMutation()
const { mutate: deleteTask, isPending: isDeleting } = useDeleteTaskMutation()
const { mutate: addTag, isPending: isTagging } = useAddTagMutation()

const title = ref('')
const notes = ref('')
const priority = ref<TaskPriority>('NONE')
const dueDate = ref('')
const tagIds = ref<string[]>([])
const newTag = ref('')

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
  newTag.value = ''
}

watch(() => props.open, (open) => {
  if (open) reset()
}, { immediate: true })

function toggleTag(id: string) {
  tagIds.value = tagIds.value.includes(id)
    ? tagIds.value.filter(tagId => tagId !== id)
    : [...tagIds.value, id]
}

function createTag() {
  const name = newTag.value.trim()
  if (!name || isTagging.value) return

  addTag({ name }, {
    onSuccess: (tag) => {
      tagIds.value = [...tagIds.value, tag.id]
      newTag.value = ''
    }
  })
}

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
          class="h-12 w-full px-3.5 rounded-xl border border-hairline bg-elev2 text-text text-base outline-none [color-scheme:dark]"
          type="date"
        >
      </div>

      <div class="flex flex-col gap-2.5">
        <span class="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-dim">
          {{ t('tasks.tags') }}
        </span>

        <div v-if="tags?.length" class="flex flex-wrap gap-2">
          <UiChip
            v-for="tag in tags"
            :key="tag.id"
            :label="tag.name"
            :active="tagIds.includes(tag.id)"
            @click="toggleTag(tag.id)"
          />
        </div>

        <div class="flex items-center gap-2">
          <input
            v-model="newTag"
            class="flex-1 min-w-0 h-10 px-3.5 rounded-full border border-hairline bg-elev1 text-text text-sm outline-none"
            :placeholder="t('tasks.newTag')"
            type="text"
            @keydown.enter.prevent="createTag"
          >
          <UiRoundBtn :disabled="!newTag.trim() || isTagging" @click="createTag">
            <UIcon name="i-lucide-plus" class="w-4.5 h-4.5" />
          </UiRoundBtn>
        </div>
      </div>

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
