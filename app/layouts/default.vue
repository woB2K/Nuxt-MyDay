<script lang="ts" setup>
import { provideFabAction } from '~/composables/useFabAction'

const route = useRoute()
const { t } = useI18n()
const toast = useAppToast()
useCategoriesQuery()

const { data: household } = useHouseholdQuery()
const { mutate: dismissNotice } = useDismissNoticeMutation()

watch(() => household.value?.removedNotice, (removed) => {
  if (!removed) return

  toast.info(t('family.remove.removedToast'), { persistent: true })
  dismissNotice()
}, { immediate: true })

const fabAction = provideFabAction()
</script>

<template>
  <div class="min-h-dvh bg-bg">
    <main class="pt-safe pb-shell">
      <slot />
    </main>
    <UiFab v-if="!route.meta.hideFab" @click="fabAction?.()" />
    <UiTabBar />
  </div>
</template>
