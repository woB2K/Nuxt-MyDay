<script lang="ts" setup>
import type { TemplateItem } from '~~/shared/types'
import { priorityBarClass } from '~/utils/priority'

const props = defineProps<{ template: TemplateItem }>()

const emit = defineEmits<{ use: [], edit: [] }>()

const { t } = useI18n()
</script>

<template>
  <div
    class="flex items-center gap-3 py-3.5 px-4 rounded-lg bg-elev1 border border-hairline active:scale-[0.99] transition-transform duration-fast"
    @click="emit('edit')"
  >
    <span class="w-1 h-9 rounded-full shrink-0" :class="priorityBarClass[props.template.priority]" />

    <div class="flex flex-col gap-1 flex-1 min-w-0">
      <span class="text-text text-[15px] font-semibold truncate">{{ props.template.title }}</span>

      <div v-if="props.template.tags.length" class="flex items-center gap-1.5 min-w-0">
        <span
          v-for="tag in props.template.tags"
          :key="tag.id"
          class="shrink-0 px-1.5 py-0.5 rounded bg-hairline text-[11px] font-medium text-text-dim truncate"
        >
          {{ tag.name }}
        </span>
      </div>
    </div>

    <button
      class="shrink-0 h-8 px-3.5 rounded-sm bg-accent text-accent-ink text-[13px] font-bold transition-transform duration-fast active:scale-95"
      type="button"
      @click.stop="emit('use')"
    >
      {{ t('tasks.templates.use') }}
    </button>
  </div>
</template>
