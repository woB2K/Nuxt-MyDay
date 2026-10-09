<script lang="ts" setup>
import type { HouseholdMemberItem, HouseholdResponse } from '~~/shared/types'

const props = defineProps<{
  household: HouseholdResponse
  me: HouseholdMemberItem | undefined
}>()

const emit = defineEmits<{ invite: [] }>()

const { t } = useI18n()

const shared = computed(() => [
  { icon: 'i-lucide-receipt', label: t('family.solo.transactions') },
  { icon: 'i-lucide-shapes', label: t('family.solo.categories') }
])
</script>

<template>
  <div class="flex flex-col">
    <div class="relative mt-3 flex justify-center">
      <div class="pointer-events-none absolute left-1/2 top-1/2 h-[200px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,var(--c-accent-soft),transparent)]" />
      <div class="relative flex animate-pop items-center">
        <UiAvatar :name="props.me?.name" :color-index="props.me?.colorIndex ?? 0" :size="64" ring="var(--c-bg)" class="relative z-10" />
        <UiAvatar dashed :size="64" class="-ml-3" />
      </div>
    </div>

    <h2 class="mt-5 text-balance text-center text-[28px] font-bold tracking-[-0.02em] text-text">
      {{ t('family.solo.title') }}
    </h2>
    <p class="mx-auto mt-2 max-w-[330px] text-center text-[15px] leading-[21px] text-text-dim">
      {{ t('family.solo.body') }}
    </p>

    <UiCard class="mt-6 animate-step-in border border-hairline" style="animation-delay: 60ms">
      <span class="text-[11px] font-semibold uppercase tracking-wider text-text-mute">{{ t('family.solo.sharedOverline') }}</span>
      <div class="mt-3.5 grid grid-cols-2 gap-x-3 gap-y-3.5">
        <div v-for="item in shared" :key="item.label" class="flex items-center gap-2.5">
          <UiIconDisc :icon="item.icon" :size="36" />
          <span class="text-[15px] font-semibold text-text">{{ item.label }}</span>
        </div>
        <div class="col-span-2 flex items-center gap-2.5">
          <UiIconDisc icon="i-lucide-piggy-bank" :size="36" />
          <span class="flex flex-col">
            <span class="text-[15px] font-semibold text-text">{{ t('family.solo.savings') }}</span>
            <span class="text-xs font-medium text-text-mute">{{ t('family.solo.savingsSub') }}</span>
          </span>
        </div>
      </div>
    </UiCard>

    <UiCard class="mt-2 animate-step-in flex-row items-center gap-3 border border-hairline" style="animation-delay: 100ms">
      <UiIconDisc icon="i-lucide-list-checks" tone="neutral" :size="36" />
      <span class="flex min-w-0 flex-1 flex-col">
        <span class="text-[11px] font-semibold uppercase tracking-wider text-text-mute">{{ t('family.solo.privateOverline') }}</span>
        <span class="text-[15px] font-semibold text-text">{{ t('family.solo.tasks') }}</span>
        <span class="text-xs font-medium text-text-mute">{{ t('family.solo.tasksSub') }}</span>
      </span>
      <UIcon name="i-lucide-lock" class="size-3.5 shrink-0 text-text-mute" />
    </UiCard>

    <UiCard v-if="props.household.invite" :padding="0" class="mt-5 overflow-hidden border border-hairline">
      <PendingInviteRow :expires-at="props.household.invite.expiresAt" @open="emit('invite')" />
    </UiCard>
    <UiButton v-else class="mt-5 w-full" data-testid="family-invite" @click="emit('invite')">
      <UIcon name="i-lucide-user-plus" class="size-5" />
      {{ t('family.solo.cta') }}
    </UiButton>

    <p class="mt-3 text-center text-[13px] leading-[18px] text-text-mute">
      {{ t('family.solo.note') }}
    </p>
  </div>
</template>
