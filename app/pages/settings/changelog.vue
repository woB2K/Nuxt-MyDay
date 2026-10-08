<script lang="ts" setup>
import type { ChangeType, LangSetting } from '~~/shared/types'
import { changelog } from '~~/shared/changelog'

definePageMeta({ hideFab: true })

const { t, locale } = useI18n()
const { appVersion } = useRuntimeConfig().public

const lang = computed(() => locale.value as LangSetting)

const typeClasses: Record<ChangeType, string> = {
  new: 'bg-accent-soft text-accent',
  improved: 'bg-info/15 text-info',
  fixed: 'bg-elev3 text-text-dim'
}
</script>

<template>
  <div class="flex flex-col gap-3 p-4">
    <UiRoundBtn class="mb-1 self-start" @click="navigateTo('/settings')">
      <UIcon name="i-lucide-chevron-left" class="w-4.5 h-4.5" />
    </UiRoundBtn>

    <div class="flex flex-col gap-1">
      <h1 class="text-3xl font-bold text-text">
        {{ t('settings.changelog.title') }}
      </h1>
      <span class="text-sm text-text-dim">{{ t('settings.changelog.current', { version: appVersion }) }}</span>
    </div>

    <UiCard
      v-for="release in changelog"
      :key="release.version"
      class="gap-3"
      data-testid="release"
    >
      <div class="flex items-baseline justify-between gap-3">
        <span class="flex min-w-0 items-baseline gap-2">
          <span class="shrink-0 text-[17px] font-bold text-text">{{ release.version }}</span>
          <span v-if="release.title" class="truncate text-sm text-text-dim">{{ release.title[lang] }}</span>
        </span>
        <span class="shrink-0 text-xs text-text-mute">{{ formatDate(release.date) }}</span>
      </div>

      <ul class="flex flex-col gap-2.5">
        <li
          v-for="(change, index) in release.changes"
          :key="index"
          class="flex items-start gap-2.5"
        >
          <span
            class="mt-px w-21 shrink-0 rounded-md py-0.5 text-center text-[11px] font-semibold"
            :class="typeClasses[change.type]"
          >{{ t(`settings.changelog.types.${change.type}`) }}</span>
          <span class="min-w-0 text-sm text-text">{{ change.text[lang] }}</span>
        </li>
      </ul>
    </UiCard>
  </div>
</template>
