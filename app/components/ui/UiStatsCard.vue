<script lang="ts" setup>
interface Props {
  type: 'streak' | 'progress'
  value: number
  total?: number
}

const props = withDefaults(defineProps<Props>(), { total: 0 })

const { t } = useI18n()

const percent = computed(() => {
  if (props.total <= 0) return 0

  return Math.min(100, Math.round((props.value / props.total) * 100))
})
</script>

<template>
  <div class="flex flex-col gap-2 p-4 rounded-2xl bg-elev2">
    <template v-if="props.type === 'streak'">
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-flame" class="w-4.5 h-4.5 text-warning" />
        <span class="text-[28px] font-bold leading-none text-text font-display">{{ props.value }}</span>
      </div>
      <span class="text-xs text-text-dim">{{ t('tasks.stats.streak', props.value) }}</span>
    </template>

    <template v-else>
      <div class="flex items-baseline gap-1">
        <span class="text-[28px] font-bold leading-none text-text font-display">{{ props.value }}</span>
        <span class="text-sm font-medium text-text-mute">/ {{ props.total }}</span>
      </div>
      <span class="text-xs text-text-dim">{{ t('tasks.stats.done') }}</span>
      <div class="h-1.5 rounded-full bg-elev3 overflow-hidden">
        <div
          class="h-full rounded-full bg-accent transition-[width] duration-base ease-out"
          :style="{ width: `${percent}%` }"
        />
      </div>
    </template>
  </div>
</template>
