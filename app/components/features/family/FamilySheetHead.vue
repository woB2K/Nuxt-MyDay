<script lang="ts" setup>
import type { IconDiscTone } from '~/utils/family'

interface Props {
  title: string
  sub?: string
  icon?: string
  tone?: IconDiscTone
  pop?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  sub: '',
  icon: '',
  tone: 'accent',
  pop: false
})
</script>

<template>
  <div class="flex items-center gap-3.5 pt-2 pr-11">
    <slot name="lead">
      <UiIconDisc
        :icon="props.icon"
        :tone="props.tone"
        :size="48"
        :class="{ 'animate-pop': props.pop }"
      />
    </slot>
    <div class="flex min-w-0 flex-col gap-0.5">
      <h2 class="font-display text-[22px] font-semibold leading-tight text-text">
        {{ props.title }}
      </h2>
      <p v-if="props.sub" class="text-[15px] text-text-dim">
        {{ props.sub }}
      </p>
    </div>
  </div>
</template>
