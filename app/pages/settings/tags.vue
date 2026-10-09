<script lang="ts" setup>
definePageMeta({ hideFab: true })

const { t } = useI18n()

const { data: tags, isPending } = useTagsQuery()
const { mutate: deleteTag } = useDeleteTagMutation()

const sorted = computed(() => [...(tags.value ?? [])].sort((a, b) => a.name.localeCompare(b.name)))
</script>

<template>
  <div class="flex flex-col gap-3 p-4">
    <UiRoundBtn class="mb-1 self-start" @click="navigateTo('/settings')">
      <UIcon name="i-lucide-chevron-left" class="w-4.5 h-4.5" />
    </UiRoundBtn>

    <div class="flex flex-col gap-1">
      <h1 class="text-3xl font-bold text-text">
        {{ t('settings.tagsScreen.title') }}
      </h1>
      <span class="text-sm text-text-dim">{{ t('settings.tagsScreen.subtitle') }}</span>
      <span v-if="sorted.length" class="text-xs text-text-mute">{{ t('settings.tagsScreen.hint') }}</span>
    </div>

    <template v-if="isPending">
      <UiSkeletonRow v-for="n in 4" :key="n" />
    </template>

    <UiEmptyState
      v-else-if="!sorted.length"
      icon="i-lucide-tag"
      :title="t('settings.tagsScreen.emptyTitle')"
      :subtitle="t('settings.tagsScreen.emptySubtitle')"
    />

    <UiCard v-else :padding="0" class="overflow-hidden">
      <UiSwipeRow v-for="tag in sorted" :key="tag.id" @delete="deleteTag(tag.id)">
        <div class="flex items-center gap-3 border-b border-hairline p-4 last:border-b-0">
          <span class="shrink-0 flex size-10 items-center justify-center rounded-xl bg-accent-soft">
            <UIcon name="i-lucide-tag" class="size-5 text-accent" />
          </span>
          <span class="min-w-0 flex-1 truncate text-[15px] font-semibold text-text">{{ tag.name }}</span>
        </div>
      </UiSwipeRow>
    </UiCard>
  </div>
</template>
