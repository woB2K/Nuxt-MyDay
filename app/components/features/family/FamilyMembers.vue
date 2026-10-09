<script lang="ts" setup>
import type { HouseholdMemberItem, HouseholdResponse } from '~~/shared/types'

const props = defineProps<{
  household: HouseholdResponse
  myId: string | undefined
}>()

const emit = defineEmits<{ invite: [] }>()

const { t } = useI18n()

const isOwner = computed(() => props.household.role === 'OWNER')

const memberSheetOpen = ref(false)
const selected = ref<HouseholdMemberItem | null>(null)
const savingsSheetOpen = ref(false)
const savingsTarget = ref(true)
const leaveSheetOpen = ref(false)

const savingsOptions = computed(() => [
  { value: 'shared', label: t('family.screen.sharedShort') },
  { value: 'separate', label: t('family.screen.separateShort') }
])

const savingsMode = computed(() => props.household.shareSavings ? 'shared' : 'separate')

function openMember(member: HouseholdMemberItem) {
  selected.value = member
  memberSheetOpen.value = true
}

function changeSavings(value: string) {
  const target = value === 'shared'
  if (target === props.household.shareSavings) return

  savingsTarget.value = target
  savingsSheetOpen.value = true
}
</script>

<template>
  <div class="flex flex-col">
    <h1 class="text-[34px] font-bold leading-tight text-text">
      {{ t('family.screen.title') }}
    </h1>
    <p class="text-[15px] text-text-dim">
      {{ t('family.screen.sub', { people: t('family.plural.people', props.household.members.length) }) }}
    </p>

    <UiSectionHeader class="mt-5" :title="t('family.screen.members')" />
    <UiCard :padding="0" class="overflow-hidden border border-hairline">
      <div
        v-for="(member, index) in props.household.members"
        :key="member.userId"
        class="flex min-h-16 items-center gap-3 py-3 pl-4 pr-2 animate-step-in"
        :class="{ 'border-t border-hairline': index > 0 }"
        data-testid="family-member"
      >
        <UiAvatar :name="member.name" :color-index="member.colorIndex" :size="40" />
        <span class="flex min-w-0 flex-1 flex-col">
          <span class="flex items-center gap-1.5">
            <span class="truncate text-[15px] font-semibold text-text">{{ member.name }}</span>
            <span
              v-if="member.role === 'OWNER'"
              class="shrink-0 rounded-full bg-elev3 px-2 py-0.5 text-[11px] font-semibold text-text-dim"
            >{{ t('family.screen.owner') }}</span>
            <span
              v-if="member.userId === props.myId"
              class="shrink-0 rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-semibold text-accent"
            >{{ t('family.screen.you') }}</span>
          </span>
          <span class="truncate text-[13px] text-text-dim">{{ member.email }}</span>
        </span>
        <button
          v-if="isOwner && member.userId !== props.myId"
          class="flex size-11 shrink-0 items-center justify-center rounded-full text-text-mute active:bg-elev3"
          type="button"
          :aria-label="t('family.screen.more')"
          data-testid="family-member-more"
          @click="openMember(member)"
        >
          <UIcon name="i-lucide-ellipsis" class="size-5" />
        </button>
      </div>

      <template v-if="isOwner">
        <PendingInviteRow
          v-if="props.household.invite"
          class="border-t border-hairline"
          :expires-at="props.household.invite.expiresAt"
          @open="emit('invite')"
        />
        <button
          v-else
          class="flex w-full items-center gap-3 border-t border-hairline px-4 py-3 text-left active:bg-elev3"
          type="button"
          data-testid="family-invite"
          @click="emit('invite')"
        >
          <UiIconDisc icon="i-lucide-plus" :size="40" />
          <span class="text-[15px] font-semibold text-accent">{{ t('family.screen.inviteMore') }}</span>
        </button>
      </template>
    </UiCard>

    <UiSectionHeader class="mt-5" :title="t('family.screen.savings')" />
    <UiCard v-if="isOwner" :padding="12" class="border border-hairline">
      <UiPillSelect
        :model-value="savingsMode"
        :options="savingsOptions"
        bg-class="bg-elev3"
        full
        @update:model-value="changeSavings($event as string)"
      />
      <p class="px-1 pt-2.5 pb-0.5 text-[13px] leading-[18px] text-text-dim">
        {{ props.household.shareSavings ? t('family.invite.sharedBody') : t('family.invite.separateBody') }}
      </p>
    </UiCard>
    <UiCard v-else :padding="0" class="overflow-hidden border border-hairline">
      <UiSettingRow
        icon="i-lucide-piggy-bank"
        :label="props.household.shareSavings ? t('family.screen.readonlyShared') : t('family.screen.readonlySeparate')"
        :sub="t('family.screen.readonlySub')"
        last
      >
        <template #trailing>
          <UIcon name="i-lucide-lock" class="size-4 shrink-0 text-text-mute" />
        </template>
      </UiSettingRow>
    </UiCard>

    <p class="mt-4 text-xs text-text-mute">
      {{ t('family.screen.refresh') }}
    </p>

    <button
      class="mt-5 flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-danger-soft text-base font-semibold text-danger transition-transform duration-fast active:scale-[0.98]"
      type="button"
      data-testid="family-leave"
      @click="leaveSheetOpen = true"
    >
      <UIcon name="i-lucide-log-out" class="size-4.5" />
      {{ t('family.screen.leave') }}
    </button>

    <MemberSheet v-model:open="memberSheetOpen" :member="selected" :share-savings="props.household.shareSavings" />
    <SavingsModeSheet v-model:open="savingsSheetOpen" :target="savingsTarget" :members="props.household.members" />
    <LeaveSheet v-model:open="leaveSheetOpen" :household="props.household" :my-id="props.myId" />
  </div>
</template>
