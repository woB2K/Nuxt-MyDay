<script lang="ts" setup>
import type { StepVisualKind } from '~/utils/pwaInstall'

interface Props {
  n: number
  title: string
  hint: string
  visual: StepVisualKind
  label?: string
}

const props = withDefaults(defineProps<Props>(), { label: '' })
</script>

<template>
  <div
    class="step-in grid grid-cols-[24px_minmax(0,1fr)_76px] items-center gap-3 rounded-2xl border border-hairline bg-elev1 p-3"
    :style="{ animationDelay: `${(props.n - 1) * 40}ms` }"
  >
    <span class="flex size-6 items-center justify-center rounded-full bg-accent-soft font-display text-[13px] font-semibold text-accent">
      {{ props.n }}
    </span>

    <span class="flex min-w-0 flex-col gap-0.5">
      <span class="text-base font-semibold leading-[21px] text-text text-pretty">{{ props.title }}</span>
      <span class="text-[13px] font-medium leading-[18px] text-text-dim text-pretty">{{ props.hint }}</span>
    </span>

    <UiStepVisual :kind="props.visual" :label="props.label" />
  </div>
</template>

<style scoped>
.step-in {
  animation: step-in var(--duration-base) var(--ease-out) both;
}

@keyframes step-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
}
</style>
