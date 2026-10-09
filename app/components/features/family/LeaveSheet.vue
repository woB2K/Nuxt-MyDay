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

const items = computed<Consequence[]>(() => {
  const me = props.household.members.find(member => member.userId === props.myId)
  const nextOwner = props.household.role === 'OWNER' ? nextOwnerOf(props.household.members, props.myId) : undefined

  return [
    {
      icon: 'i-lucide-copy',
      tone: 'accent',
      title: t('family.leave.take'),
      sub: t('family.leave.takeSub', {
        tx: t('family.plural.tx', me?.transactionCount ?? 0),
        sv: t('family.plural.sv', me?.savingsCount ?? 0)
      })
    },
    {
      icon: 'i-lucide-users',
      tone: 'neutral',
      title: t('family.leave.stays'),
      sub: props.household.shareSavings ? t('family.leave.staysSub') : t('family.leave.staysSubSeparate')
    },
    ...(nextOwner
      ? [{ icon: 'i-lucide-user-check', tone: 'warning', title: t('family.leave.owner', { name: nextOwner.name }), sub: t('family.leave.ownerSub') } as const]
      : []),
    { icon: 'i-lucide-user', tone: 'neutral', title: t('family.leave.solo'), sub: t('family.leave.soloSub') }
  ]
})

function confirm() {
  leave(undefined, {
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
