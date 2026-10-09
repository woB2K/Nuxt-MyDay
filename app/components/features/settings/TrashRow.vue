<script lang="ts" setup>
interface Props {
  icon: string
  title: string
  caption: string
  tileClass?: string
  tileColor?: string
  inkClass?: string
  amount?: string
}

const props = defineProps<Props>()
</script>

<template>
  <div class="flex items-center gap-3 p-4">
    <span
      class="shrink-0 flex size-10 items-center justify-center rounded-md"
      :class="props.tileClass"
      :style="props.tileColor ? { backgroundColor: `${props.tileColor}33` } : undefined"
    >
      <UIcon
        :name="props.icon"
        class="size-5"
        :class="props.inkClass"
        :style="props.tileColor ? { color: props.tileColor } : undefined"
      />
    </span>

    <span class="flex min-w-0 flex-1 flex-col gap-0.5">
      <span class="truncate text-sm font-semibold text-text">{{ props.title }}</span>
      <span class="truncate text-xs text-text-dim">{{ props.caption }}</span>
    </span>

    <span v-if="props.amount" class="ml-auto shrink-0 text-sm font-semibold" :class="props.inkClass">
      {{ props.amount }}
    </span>
  </div>
</template>
