<script lang="ts" setup>
import { accentNames, accentSwatches } from '~/utils/accents'

const { t } = useI18n()
const { accent, resolved, setAccent } = useTheme()

function swatch(name: typeof accentNames[number]) {
  return accentSwatches[name][resolved.value]
}
</script>

<template>
  <div class="flex items-center gap-4">
    <button
      v-for="name in accentNames"
      :key="name"
      type="button"
      class="size-10 shrink-0 flex items-center justify-center rounded-full transition-transform duration-fast ease-spring"
      :class="accent === name ? 'scale-[1.06]' : 'active:scale-[0.94]'"
      :style="{
        backgroundColor: swatch(name),
        boxShadow: accent === name ? `0 0 0 3px var(--c-elev2), 0 0 0 5px ${swatch(name)}` : undefined
      }"
      :aria-label="t(`settings.accents.${name}`)"
      :aria-pressed="accent === name"
      @click="setAccent(name)"
    >
      <UIcon v-if="accent === name" name="i-lucide-check" class="size-5 text-accent-ink" />
    </button>
  </div>
</template>
