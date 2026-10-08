<script lang="ts" setup>
const collapseMs = 360

const { t } = useI18n()
const { bannerVisible, dismissBanner } = usePwaInstall()

const closing = ref(false)
const sheetOpen = ref(false)

let collapseTimer: ReturnType<typeof setTimeout> | null = null

function dismiss() {
  if (closing.value) return

  closing.value = true
  collapseTimer = setTimeout(() => {
    dismissBanner()
    closing.value = false
  }, collapseMs)
}

onUnmounted(() => {
  if (collapseTimer) clearTimeout(collapseTimer)
})
</script>

<template>
  <div v-if="bannerVisible" class="banner-slot grid" :class="{ closing }">
    <div class="min-h-0 overflow-hidden">
      <div
        class="banner relative rounded-2xl border border-accent-soft p-4 bg-[linear-gradient(135deg,var(--c-accent-soft)_0%,var(--c-elev1)_70%)]"
      >
        <div class="flex items-start gap-3">
          <UiLogoMark :size="44" class="shrink-0" />

          <div class="flex min-w-0 flex-1 flex-col items-start pr-7">
            <p class="font-display text-[17px] font-semibold leading-[22px] tracking-tight text-text">
              {{ t('install.banner.title') }}
            </p>
            <p class="mt-0.5 text-[13px] font-medium leading-[18px] text-text-dim text-pretty">
              {{ t('install.banner.body') }}
            </p>
            <UiButton size="sm" class="mt-3" @click="sheetOpen = true">
              {{ t('install.banner.cta') }}
            </UiButton>
          </div>
        </div>

        <button
          class="absolute top-1.5 right-1.5 flex size-11 items-center justify-center"
          type="button"
          :aria-label="t('install.banner.dismiss')"
          @click="dismiss"
        >
          <span class="flex size-7 items-center justify-center rounded-full bg-elev3 text-text-dim">
            <UIcon name="i-lucide-x" class="size-4" />
          </span>
        </button>
      </div>
    </div>
  </div>

  <InstallSheet v-model:open="sheetOpen" context="today" />
</template>

<style scoped>
.banner-slot {
  grid-template-rows: 1fr;
  transition: grid-template-rows var(--duration-base) var(--ease-out);
}

.banner-slot.closing {
  grid-template-rows: 0fr;
  transition-delay: 120ms;
}

.banner {
  animation: banner-in var(--duration-base) var(--ease-out) 600ms backwards;
  transition: opacity var(--duration-fast) var(--ease-out), transform var(--duration-fast) var(--ease-out);
}

.closing .banner {
  opacity: 0;
  transform: scale(0.98);
}

@keyframes banner-in {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
}
</style>
