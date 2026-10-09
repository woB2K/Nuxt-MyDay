<script lang="ts" setup>
import type { HouseholdMemberItem } from '~~/shared/types'
import type { Consequence } from '~/utils/family'
import { formatLongDay } from '~/utils/formatDate'

type Step = 'info' | 'transfer' | 'remove'

const props = defineProps<{
  open: boolean
  member: HouseholdMemberItem | null
  shareSavings: boolean
}>()

const emit = defineEmits<{ 'update:open': [value: boolean] }>()

const { t, locale } = useI18n()

const { mutate: transfer, isPending: isTransferring } = useTransferOwnershipMutation()
const { mutate: remove, isPending: isRemoving } = useRemoveMemberMutation()

const step = ref<Step>('info')

watch(() => props.open, (open) => {
  if (open) step.value = 'info'
})

function close() {
  emit('update:open', false)
}

const meta = computed(() => props.member
  ? `${t('family.member.since', { date: formatLongDay(props.member.joinedAt, locale.value) })} · ${t('family.member.added', { tx: t('family.plural.tx', props.member.transactionCount) })}`
  : '')

const transferItems = computed<Consequence[]>(() => {
  const name = props.member?.name ?? ''

  return [
    { icon: 'i-lucide-crown', tone: 'accent', title: t('family.transfer.rights', { name }), sub: t('family.transfer.rightsSub') },
    { icon: 'i-lucide-user', tone: 'neutral', title: t('family.transfer.you'), sub: t('family.transfer.youSub') }
  ]
})

const removeItems = computed<Consequence[]>(() => {
  const member = props.member
  if (!member) return []

  return [
    {
      icon: 'i-lucide-copy',
      tone: 'accent',
      title: t('family.remove.take'),
      sub: t('family.remove.takeSub', { tx: t('family.plural.tx', member.transactionCount), sv: t('family.plural.sv', member.savingsCount) })
    },
    {
      icon: 'i-lucide-users',
      tone: 'neutral',
      title: t('family.remove.stays'),
      sub: props.shareSavings ? t('family.remove.staysSub') : t('family.remove.staysSubSeparate')
    },
    { icon: 'i-lucide-user', tone: 'neutral', title: t('family.remove.solo'), sub: t('family.remove.soloSub') }
  ]
})

function confirmTransfer() {
  if (!props.member) return

  transfer({ userId: props.member.userId, name: props.member.name }, { onSuccess: close })
}

function confirmRemove() {
  if (!props.member) return

  remove({ userId: props.member.userId, name: props.member.name }, { onSuccess: close })
}
</script>

<template>
  <UiSheet :open="props.open" @update:open="emit('update:open', $event)">
    <Transition v-if="props.member" name="family-step" mode="out-in">
      <div v-if="step === 'info'" key="info" class="flex flex-col items-center pt-2 text-center">
        <UiAvatar :name="props.member.name" :color-index="props.member.colorIndex" :size="64" />
        <h2 class="mt-3 font-display text-[22px] font-semibold text-text">
          {{ props.member.name }}
        </h2>
        <p class="text-sm text-text-dim">
          {{ props.member.email }}
        </p>
        <p class="mt-1 text-[13px] text-text-mute">
          {{ meta }}
        </p>

        <div class="mt-6 flex w-full flex-col gap-2">
          <button
            class="flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-field text-base font-semibold text-text"
            type="button"
            data-testid="member-make-owner"
            @click="step = 'transfer'"
          >
            <UIcon name="i-lucide-crown" class="size-4.5" />
            {{ t('family.member.makeOwner') }}
          </button>
          <button
            class="flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-danger-soft text-base font-semibold text-danger"
            type="button"
            data-testid="member-remove"
            @click="step = 'remove'"
          >
            <UIcon name="i-lucide-user-minus" class="size-4.5" />
            {{ t('family.member.remove') }}
          </button>
        </div>
      </div>

      <div v-else-if="step === 'transfer'" key="transfer" class="flex flex-col">
        <FamilySheetHead :title="t('family.transfer.title', { name: props.member.name })" :sub="props.member.email">
          <template #lead>
            <UiAvatar :name="props.member.name" :color-index="props.member.colorIndex" :size="48" />
          </template>
        </FamilySheetHead>
        <FamilyConsequences class="mt-5" :items="transferItems" />
        <UiButton class="mt-6 w-full" :loading="isTransferring" @click="confirmTransfer">
          {{ t('family.transfer.cta') }}
        </UiButton>
        <UiButton variant="ghost" class="mt-1 w-full" @click="step = 'info'">
          {{ t('family.transfer.cancel') }}
        </UiButton>
      </div>

      <div v-else key="remove" class="flex flex-col">
        <FamilySheetHead :title="t('family.remove.title')" :sub="`${props.member.name} · ${props.member.email}`">
          <template #lead>
            <UiAvatar :name="props.member.name" :color-index="props.member.colorIndex" :size="48" />
          </template>
        </FamilySheetHead>
        <FamilyConsequences class="mt-5" :items="removeItems" />
        <UiButton
          variant="destructive"
          class="mt-6 w-full"
          :loading="isRemoving"
          data-testid="member-remove-confirm"
          @click="confirmRemove"
        >
          {{ t('family.remove.cta') }}
        </UiButton>
        <UiButton variant="ghost" class="mt-1 w-full" @click="step = 'info'">
          {{ t('family.remove.cancel') }}
        </UiButton>
      </div>
    </Transition>
  </UiSheet>
</template>
