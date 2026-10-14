<script lang="ts" setup>
const { t } = useI18n()
const { members, others, isFamily } = useFamily()

const sub = computed(() => {
  if (!isFamily.value) return t('family.settings.solo')
  if (others.value.length === 1) return t('family.settings.pair', { name: others.value[0]!.name })
  return t('family.plural.people', members.value.length)
})
</script>

<template>
  <UiCard :padding="0" class="overflow-hidden" data-testid="family-row">
    <UiSettingRow
      icon="i-lucide-users"
      :label="t('family.settings.label')"
      :sub="sub"
      clickable
      last
      @click="navigateTo('/settings/family')"
    >
      <template v-if="isFamily" #trailing>
        <span class="flex shrink-0 items-center gap-2">
          <UiAvatarStack :members="others" :size="26" ring="var(--c-elev2)" />
          <UIcon name="i-lucide-chevron-right" class="size-4.5 text-text-mute" />
        </span>
      </template>
    </UiSettingRow>
  </UiCard>
</template>
