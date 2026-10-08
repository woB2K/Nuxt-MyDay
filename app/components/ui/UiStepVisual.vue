<script lang="ts" setup>
import type { StepVisualKind } from '~/utils/pwaInstall'

interface Props {
  kind: StepVisualKind
  label?: string
}

const props = withDefaults(defineProps<Props>(), { label: '' })

const menuIcon = computed(() => props.kind === 'menuAdd' ? 'i-lucide-square-plus' : 'i-lucide-download')
</script>

<template>
  <div class="flex h-14 w-[76px] shrink-0 items-center justify-center overflow-hidden rounded-[10px] border border-hairline bg-bg">
    <div v-if="props.kind === 'share'" class="flex items-center gap-1.5">
      <span class="flex size-8 items-center justify-center rounded-full bg-accent-soft text-accent">
        <UIcon name="i-lucide-share" class="size-4" />
      </span>
      <span class="flex size-[22px] items-center justify-center rounded-full bg-elev3 text-text-dim">
        <UIcon name="i-lucide-ellipsis" class="size-3" />
      </span>
    </div>

    <div v-else-if="props.kind === 'menuAdd' || props.kind === 'menuInstall'" class="flex w-14 flex-col gap-1">
      <span class="flex h-3 items-center px-1"><span class="h-[5px] w-[30px] rounded-full bg-elev3" /></span>
      <span class="flex h-4 items-center gap-[5px] rounded px-1 bg-accent-soft text-accent">
        <UIcon :name="menuIcon" class="size-3 shrink-0" />
        <span class="h-1 w-7 rounded-full bg-accent" />
      </span>
      <span class="flex h-3 items-center px-1"><span class="h-[5px] w-[22px] rounded-full bg-elev3" /></span>
    </div>

    <div v-else-if="props.kind === 'add'" class="flex w-16 flex-col gap-2">
      <span class="flex items-center justify-between gap-1">
        <span class="h-1 w-2.5 shrink-0 rounded-full bg-text-mute" />
        <span class="whitespace-nowrap text-[10px] font-semibold leading-[14px] text-accent">{{ props.label }}</span>
      </span>
      <span class="flex items-center gap-1.5">
        <UiLogoMark :size="18" />
        <span class="h-[5px] w-[26px] rounded-full bg-elev3" />
      </span>
    </div>

    <div v-else-if="props.kind === 'kebab'" class="flex items-center gap-1.5">
      <span class="h-3.5 w-9 rounded-full bg-elev3" />
      <span class="flex size-[22px] items-center justify-center rounded-full bg-accent-soft text-accent">
        <UIcon name="i-lucide-ellipsis-vertical" class="size-3" />
      </span>
    </div>

    <span
      v-else
      class="flex h-6 items-center whitespace-nowrap rounded-full px-1.5 text-[10px] font-semibold tracking-tight bg-accent text-accent-ink"
    >{{ props.label }}</span>
  </div>
</template>
