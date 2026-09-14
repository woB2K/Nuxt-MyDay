<script lang="ts" setup>
import type { TaskPriority, TemplateItem } from '~~/shared/types'
import { priorityKeys } from '~/utils/priority'

const props = defineProps<{
  open: boolean
  template?: TemplateItem | null
}>()

const emit = defineEmits<{ 'update:open': [value: boolean] }>()

const { t } = useI18n()
const toast = useAppToast()

const { mutate: addTemplate, isPending: isAdding } = useAddTemplateMutation()
const { mutate: updateTemplate, isPending: isUpdating } = useUpdateTemplateMutation()
const { mutate: deleteTemplate, isPending: isDeleting } = useDeleteTemplateMutation()
const { mutate: addTask, isPending: isUsing } = useAddTaskMutation()

const title = ref('')
const notes = ref('')
const priority = ref<TaskPriority>('NONE')
const tagIds = ref<string[]>([])

const isEdit = computed(() => !!props.template)
const isPending = computed(() =>
  isAdding.value || isUpdating.value || isDeleting.value || isUsing.value)

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
  const template = props.template

  title.value = template?.title ?? ''
  notes.value = template?.notes ?? ''
  priority.value = template?.priority ?? 'NONE'
  tagIds.value = template?.tags.map(tag => tag.id) ?? []
}

watch(() => props.open, (open) => {
  if (open) reset()
}, { immediate: true })

function close() {
  emit('update:open', false)
}

function payload() {
  return {
    title: title.value.trim(),
    notes: notes.value.trim(),
    priority: priority.value,
    tagIds: tagIds.value
  }
}

function submit() {
  const data = payload()

  if (!data.title) {
    toast.error(t('tasks.error.title'))
    return
  }

  if (props.template) {
    updateTemplate({ id: props.template.id, ...data }, { onSuccess: close })
    return
  }

  addTemplate(data, { onSuccess: close })
}

function use() {
  const data = payload()

  if (!data.title) {
    toast.error(t('tasks.error.title'))
    return
  }

  addTask(data, { onSuccess: close })
}

function remove() {
  if (!props.template) return

  deleteTemplate(props.template.id, { onSuccess: close })
}
</script>

<template>
  <UiSheet
    :open="props.open"
    :title="isEdit ? t('tasks.templates.edit') : t('tasks.templates.add')"
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

      <TagPicker v-model="tagIds" />

      <UiInput v-model="notes" :label="t('tasks.notes')" multiline :rows="3" />

      <UiButton
        class="w-full"
        type="submit"
        :variant="isEdit ? 'secondary' : 'primary'"
        :disabled="isPending"
      >
        {{ t('general.save') }}
      </UiButton>

      <UiButton
        v-if="isEdit"
        class="w-full"
        type="button"
        :disabled="isPending"
        @click="use"
      >
        {{ t('tasks.templates.use') }}
      </UiButton>

      <button
        v-if="isEdit"
        class="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-danger/10 text-danger text-[15px] font-semibold disabled:opacity-50"
        :disabled="isPending"
        type="button"
        @click="remove"
      >
        <UIcon name="i-lucide-trash-2" class="w-4.5 h-4.5" />
        {{ t('tasks.templates.delete') }}
      </button>
    </form>
  </UiSheet>
</template>
