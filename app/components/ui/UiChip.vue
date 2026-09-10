<script lang="ts" setup>
interface Props {
  label: string
  count?: number
  active?: boolean
  icon?: string
  trailingIcon?: string
}

const props = withDefaults(defineProps<Props>(), { active: false })
</script>

<template>
  <button
    class="shrink-0 inline-flex items-center gap-1.5 h-9 px-3 rounded-full border text-[13px] font-semibold transition-all duration-fast ease-spring active:scale-[0.96]"
    :class="props.active
      ? 'bg-accent-soft border-accent text-accent'
      : 'bg-elev1 border-hairline text-text-dim'"
    type="button"
  >
    <UIcon v-if="props.icon" :name="props.icon" class="w-3.5 h-3.5" />
    {{ props.label }}
    <span
      v-if="props.count"
      class="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-accent text-accent-ink text-[11px] font-bold"
    >{{ props.count }}</span>
    <UIcon v-if="props.trailingIcon" :name="props.trailingIcon" class="w-3 h-3" />
  </button>
</template>
