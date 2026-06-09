<script lang="ts" setup>
import type { Category } from '~~/prisma/.generated/prisma'

interface Props {
  category: Category
  selected: boolean
}

const props = defineProps<Props>()
</script>

<template>
  <button
    class="w-full flex flex-col items-center justify-center gap-2 py-3 px-1 rounded-2xl border-2 transition-all duration-150 active:scale-95 cursor-pointer bg-elev-2"
    :style="props.selected
      ? { borderColor: props.category.color, backgroundColor: `${props.category.color}26` }
      : { borderColor: 'transparent' }"
    type="button"
  >
    <UIcon
      :name="props.category.icon"
      class="w-8 h-8 shrink-0 transition-colors duration-150"
      :class="props.selected ? '' : 'text-text-dim'"
      :style="props.selected ? { color: props.category.color } : {}"
    />
    <span
      class="text-xs font-medium leading-none w-full text-center truncate transition-colors duration-150"
      :class="props.selected ? '' : 'text-text-dim'"
      :style="props.selected ? { color: props.category.color } : {}"
    >
      {{ props.category.name }}
    </span>
  </button>
</template>
