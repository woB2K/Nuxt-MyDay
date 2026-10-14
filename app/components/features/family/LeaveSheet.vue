<script lang="ts" setup>
import type { HouseholdResponse } from '~~/shared/types'
import type { Consequence } from '~/utils/family'
import { nextOwnerOf } from '~/utils/family'

const props = defineProps<{
  open: boolean
  household: HouseholdResponse
  myId: string | undefined
}>()

const emit = defineEmits<{ 'update:open': [value: boolean] }>()

const { t } = useI18n()

const { mutate: leave, isPending } = useLeaveHouseholdMutation()

const takeRecords = ref(false)

watch(() => props.open, (open) => {
  if (open) takeRecords.value = false
})

const items = computed<Consequence[]>(() => {
  const me = props.household.members.find(member => member.userId === props.myId)
  const nextOwner = props.household.role === 'OWNER' ? nextOwnerOf(props.household.members, props.myId) : undefined
  const counts = {
    tx: t('family.plural.tx', me?.transactionCount ?? 0),
    sv: t('family.plural.sv', me?.savingsCount ?? 0)
  }

  const records: Consequence[] = takeRecords.value
    ? [
        { icon: 'i-lucide-package', tone: 'accent', title: t('family.leave.move'), sub: t('family.leave.moveSub', counts) },
        { icon: 'i-lucide-eye-off', tone: 'warning', title: t('family.leave.gone'), sub: t('family.leave.goneSub') }
      ]
    : [
        { icon: 'i-lucide-copy', tone: 'accent', title: t('family.leave.take'), sub: t('family.leave.takeSub', counts) },
        {
          icon: 'i-lucide-users',
          tone: 'neutral',
          title: t('family.leave.stays'),
          sub: props.household.shareSavings ? t('family.leave.staysSub') : t('family.leave.staysSubSeparate')
        }
      ]

  return [
    ...records,
    ...(nextOwner
      ? [{ icon: 'i-lucide-user-check', tone: 'warning', title: t('family.leave.owner', { name: nextOwner.name }), sub: t('family.leave.ownerSub') } as const]
      : []),
    { icon: 'i-lucide-user', tone: 'neutral', title: t('family.leave.solo'), sub: t('family.leave.soloSub') }
  ]
})

function confirm() {
  leave({ takeRecords: takeRecords.value }, {
    onSuccess: async () => {
      emit('update:open', false)
      await navigateTo('/settings')
    }
  })
}
</script>

<template>
  <UiSheet :open="props.open" @update:open="emit('update:open', $event)">
    <div class="flex flex-col">
      <FamilySheetHead icon="i-lucide-log-out" tone="danger" :title="t('family.leave.title')" />
      <FamilyConsequences class="mt-5" :items="items" />
      <label class="mt-3 flex cursor-pointer items-center gap-3 rounded-2xl border border-hairline bg-elev1 px-4 py-3.5">
        <span class="flex min-w-0 flex-1 flex-col gap-0.5">
          <span class="text-[15px] font-semibold text-text">{{ t('family.leave.takeRecords') }}</span>
          <span class="text-[13px] leading-[18px] text-text-dim">{{ t('family.leave.takeRecordsSub') }}</span>
        </span>
        <UiSwitch v-model="takeRecords" class="shrink-0" :aria-label="t('family.leave.takeRecords')" />
      </label>
      <UiButton
        variant="destructive"
        class="mt-6 w-full"
        :loading="isPending"
        data-testid="leave-confirm"
        @click="confirm"
      >
        {{ t('family.leave.cta') }}
      </UiButton>
      <UiButton variant="ghost" class="mt-1 w-full" @click="emit('update:open', false)">
        {{ t('family.leave.cancel') }}
      </UiButton>
    </div>
  </UiSheet>
</template>
