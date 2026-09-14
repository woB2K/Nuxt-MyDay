<script lang="ts" setup>
import type { TaskItem } from '~~/shared/types'
import { formatDay, toDateString, toLocalDate } from '~/utils/formatDate'
import { priorityBarClass } from '~/utils/priority'

interface Props {
  task: TaskItem
  showDate?: boolean
}

const props = withDefaults(defineProps<Props>(), { showDate: true })

const emit = defineEmits<{ toggle: [done: boolean], open: [] }>()

const dueDate = computed(() => props.showDate ? props.task.dueDate : null)

const overdue = computed(() => {
  if (props.task.done || !dueDate.value) return false

  return toDateString(toLocalDate(dueDate.value)) < toDateString()
})
</script>

<template>
  <div
    class="flex items-center gap-3 p-4 border-b border-hairline last:border-b-0"
    @click="emit('open')"
  >
    <span class="shrink-0" @click.stop>
      <UiCheckCircle
        :model-value="props.task.done"
        @update:model-value="value => emit('toggle', value)"
      />
    </span>

    <div class="flex flex-col gap-1 flex-1 min-w-0">
      <span
        class="text-[17px] leading-[22px] font-semibold truncate transition-colors duration-200 ease-in-out"
        :class="props.task.done ? 'text-text-mute line-through' : 'text-text'"
      >
        {{ props.task.title }}
      </span>

      <div
        v-if="dueDate || props.task.tags.length"
        class="flex items-center gap-1.5 min-w-0"
      >
        <span
          v-if="dueDate"
          class="shrink-0 text-xs font-medium"
          :class="overdue ? 'text-danger' : 'text-text-dim'"
        >
          {{ formatDay(dueDate) }}
        </span>
        <span
          v-for="tag in props.task.tags"
          :key="tag.id"
          class="shrink-0 px-1.5 py-0.5 rounded bg-white/5 text-[11px] font-medium text-text-dim truncate"
        >
          {{ tag.name }}
        </span>
      </div>
    </div>

    <span
      class="w-1 h-8 rounded-full shrink-0 transition-opacity duration-200 ease-in-out"
      :class="[priorityBarClass[props.task.priority], props.task.done ? 'opacity-30' : 'opacity-100']"
    />
  </div>
</template>
