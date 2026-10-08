<script lang="ts" setup>
defineEmits<{ close: [] }>()

const { t } = useI18n()
</script>

<template>
  <div class="fade-in flex flex-col items-center pt-4 text-center">
    <div class="flex gap-4 rounded-[20px] border border-hairline bg-bg px-6 py-5">
      <span v-for="n in 3" :key="n" class="flex w-13 flex-col items-center gap-2">
        <span class="size-13 rounded-[14px] bg-elev3" />
        <span class="my-1 h-1 w-7 rounded-full bg-elev3" />
      </span>

      <span class="flex w-13 flex-col items-center gap-2">
        <span class="pop-in relative">
          <UiLogoMark :size="52" />
          <span
            class="pop-in pop-in-late absolute -top-1.5 -right-1.5 flex size-[22px] items-center justify-center rounded-full border-2 border-elev2 bg-success text-[#0F0F14]"
          >
            <UIcon name="i-lucide-check" class="size-3" />
          </span>
        </span>
        <span class="text-xs font-medium leading-3 text-text">{{ t('install.success.appLabel') }}</span>
      </span>
    </div>

    <p class="mt-6 font-display text-[22px] font-semibold leading-7 tracking-tight text-text text-balance">
      {{ t('install.success.title') }}
    </p>
    <p class="mt-2 max-w-[300px] text-[15px] leading-5 text-text-dim text-pretty">
      {{ t('install.success.body') }}
    </p>

    <UiButton class="mt-6 w-full" @click="$emit('close')">
      {{ t('install.success.cta') }}
    </UiButton>
  </div>
</template>

<style scoped>
.fade-in {
  animation: fade-in var(--duration-base) var(--ease-out) both;
}

.pop-in {
  animation: pop-in var(--duration-sheet) var(--ease-spring) 120ms both;
}

.pop-in-late {
  animation-delay: 240ms;
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
}

@keyframes pop-in {
  from {
    opacity: 0;
    transform: scale(0.6);
  }
}
</style>
