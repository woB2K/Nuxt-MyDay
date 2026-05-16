<script lang="ts" setup>
import { resolveComponent } from 'vue'

interface Props {
  size?: 'sm' | 'md' | 'lg'
  to?: string
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  loading?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'lg',
  variant: 'primary',
  loading: false,
  disabled: false
})

const NuxtLink = resolveComponent('NuxtLink')

const variants = {
  primary: 'bg-accent text-accent-ink border-transparent shadow-md',
  secondary: 'bg-elev2 text-text border-hairline shadow-md',
  ghost: 'bg-transparent text-text-dim border-transparent',
  danger: 'bg-danger/10 text-danger border-transparent'
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm rounded-xl',
  md: 'px-4 py-3 text-base rounded-2xl',
  lg: 'px-6 py-4 text-lg rounded-2xl'
}
</script>

<template>
  <component
    :is="props.to ? NuxtLink : 'button'"
    :to="props.to"
    class="border cursor-pointer flex items-center justify-center gap-2 font-medium transition-transform duration-150 active:scale-[0.97]"
    :class="[
      variants[props.variant],
      sizes[props.size],
      { 'opacity-50 cursor-not-allowed pointer-events-none': props.disabled || props.loading }
    ]"
    :disabled="!to ? (props.disabled || props.loading) : undefined"
  >
    <UIcon v-if="loading" name="i-heroicons-arrow-path" class="animate-spin" />
    <slot v-else />
  </component>
</template>
