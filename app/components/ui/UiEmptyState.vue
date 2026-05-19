<script lang="ts" setup>
interface Props {
  icon: string
  title?: string
  subtitle?: string
}

withDefaults(defineProps<Props>(), {
  title: 'Nothing found'
})
</script>

<template>
  <div class="flex flex-col items-center gap-4 py-12 text-center">
    <div class="flex items-center justify-center size-16 rounded-full bg-elev2">
      <UIcon :name="icon" class="size-7 text-text-dim" />
    </div>
    <div class="flex flex-col gap-1">
      <p class="text-lg font-semibold">
        {{ title }}
      </p>
      <p v-if="subtitle" class="text-sm text-text-dim">
        {{ subtitle }}
      </p>
    </div>
  </div>
</template>
