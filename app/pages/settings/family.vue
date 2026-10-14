<script lang="ts" setup>
definePageMeta({ hideFab: true })

const { t } = useI18n()
const { data: household, isPending, isFamily, me, myId } = useFamily()

const inviteSheetOpen = ref(false)
</script>

<template>
  <div class="flex flex-col px-5 pt-1">
    <button
      class="-ml-1.5 flex h-11 items-center gap-0.5 self-start text-accent"
      type="button"
      @click="navigateTo('/settings')"
    >
      <UIcon name="i-lucide-chevron-left" class="size-6" />
      <span class="text-base font-medium">{{ t('family.screen.back') }}</span>
    </button>

    <template v-if="isPending">
      <UiSkeleton class="mt-6 h-40 rounded-2xl" />
      <UiSkeleton class="mt-3 h-24 rounded-2xl" />
    </template>

    <template v-else-if="household">
      <FamilyMembers
        v-if="isFamily"
        :household="household"
        :my-id="myId"
        @invite="inviteSheetOpen = true"
      />
      <FamilySolo
        v-else
        :household="household"
        :me="me"
        @invite="inviteSheetOpen = true"
      />

      <InviteSheet v-model:open="inviteSheetOpen" :household="household" />
    </template>
  </div>
</template>
