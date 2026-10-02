<script lang="ts" setup>
import type { TaskItem } from '~~/shared/types'
import { formatDay, toDateString, toLocalDate } from '~/utils/formatDate'
import { priorityTextClass } from '~/utils/priority'

const props = defineProps<{ task: TaskItem }>()

const emit = defineEmits<{ toggle: [done: boolean], open: [] }>()

const { t } = useI18n()

const overdue = computed(() => {
  if (props.task.done || !props.task.dueDate) return false

  return toDateString(toLocalDate(props.task.dueDate)) < toDateString()
})
</script>

<template>
  <div
    class="relative overflow-hidden flex flex-col gap-4 p-5 rounded-xl border border-accent/20 bg-gradient-to-b from-accent-soft to-elev1"
    @click="emit('open')"
  >
    <div
      class="absolute -top-8 -right-8 w-32 h-32 rounded-full pointer-events-none bg-accent opacity-10 blur-3xl"
    />

    <div class="flex items-center gap-2">
      <UIcon name="i-lucide-target" class="w-4 h-4 text-accent" />
      <span class="text-xs font-semibold uppercase tracking-widest text-text-dim">
        {{ t('tasks.focus') }}
      </span>
    </div>

    <div class="flex items-start gap-3">
      <span class="shrink-0 mt-0.5" @click.stop>
        <UiCheckCircle
          :model-value="props.task.done"
          :size="32"
          @update:model-value="value => emit('toggle', value)"
        />
      </span>

      <div class="flex flex-col gap-2 flex-1 min-w-0">
        <span
          class="text-[28px] leading-[34px] font-bold font-display tracking-tight transition-colors duration-200 ease-in-out"
          :class="props.task.done ? 'text-text-mute line-through' : 'text-text'"
        >
          {{ props.task.title }}
        </span>

        <div
          v-if="props.task.dueDate || props.task.tags.length || props.task.priority !== 'NONE'"
          class="flex items-center gap-2 min-w-0"
        >
          <span
            v-if="props.task.priority !== 'NONE'"
            class="shrink-0 text-xs font-semibold uppercase tracking-wide"
            :class="priorityTextClass[props.task.priority]"
          >
            {{ t(`tasks.priority.${props.task.priority}`) }}
          </span>
          <span
            v-if="props.task.dueDate"
            class="shrink-0 text-xs font-medium"
            :class="overdue ? 'text-danger' : 'text-text-dim'"
          >
            {{ formatDay(props.task.dueDate) }}
          </span>
          <span
            v-for="tag in props.task.tags"
            :key="tag.id"
            class="shrink-0 px-1.5 py-0.5 rounded bg-hairline text-[11px] font-medium text-text-dim truncate"
          >
            {{ tag.name }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
