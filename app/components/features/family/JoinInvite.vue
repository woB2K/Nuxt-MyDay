<script lang="ts" setup>
import type { InvitePreviewResponse } from '~~/shared/types'
import type { Consequence } from '~/utils/family'
import { categoryLabel } from '~/utils/categoryLabel'

const props = defineProps<{
  preview: InvitePreviewResponse
  myName: string
  myColorIndex: number
  joining: boolean
}>()

const emit = defineEmits<{ join: [], cancel: [] }>()

const MERGE_LIST_LIMIT = 4

const { t } = useI18n()

const mergeSub = computed(() => {
  const names = props.preview.mine.matchingCategories.map(category => categoryLabel(category, t))
  if (names.length === 0) return t('family.join.mergeNone')

  const shown = names.slice(0, MERGE_LIST_LIMIT).join(', ')
  const rest = names.length - MERGE_LIST_LIMIT
  const list = rest > 0 ? t('family.join.mergeMore', { list: shown, count: rest }) : shown

  return t('family.join.mergeSub', { list })
})

const items = computed<Consequence[]>(() => {
  const { transactionCount, savingsBalance } = props.preview.mine
  const amount = `${formatAmount(savingsBalance)} ₽`

  return [
    ...(transactionCount > 0 || savingsBalance > 0
      ? [{ icon: 'i-lucide-merge', tone: 'accent', title: t('family.join.move', { tx: t('family.plural.tx', transactionCount) }), sub: '' } as const]
      : []),
    { icon: 'i-lucide-shapes', tone: 'accent', title: t('family.join.merge'), sub: mergeSub.value },
    ...(savingsBalance > 0
      ? [props.preview.shareSavings
          ? { icon: 'i-lucide-piggy-bank', tone: 'accent', title: t('family.join.savingsShared'), sub: t('family.join.savingsSharedSub', { amount }) } as const
          : { icon: 'i-lucide-piggy-bank', tone: 'accent', title: t('family.join.savingsSeparate'), sub: t('family.join.savingsSeparateSub', { amount }) } as const]
      : []),
    { icon: 'i-lucide-lock', tone: 'neutral', title: t('family.join.tasks'), sub: t('family.join.tasksSub') }
  ]
})
</script>

<template>
  <div class="flex flex-col px-5 pt-5 pb-48">
    <div class="flex animate-pop items-center gap-3 self-start">
      <UiAvatarStack :members="props.preview.members" :size="56" />
      <UIcon name="i-lucide-plus" class="size-4.5 text-text-mute" />
      <UiAvatar
        :name="props.myName"
        :color-index="props.myColorIndex"
        :size="56"
        class="shadow-[0_0_0_2px_var(--c-bg),0_0_0_3.5px_var(--c-hairline2)]"
      />
    </div>

    <span class="mt-5 text-[11px] font-semibold uppercase tracking-wider text-accent">{{ t('family.join.overline') }}</span>
    <h1 class="mt-1 text-balance text-[26px] font-bold leading-8 text-text">
      {{ t('family.join.title', { name: props.preview.inviterName }) }}
    </h1>
    <p class="mt-1 text-sm text-text-dim">
      {{ t('family.join.count', { people: t('family.plural.people', props.preview.members.length) }) }}
    </p>

    <div class="mt-3 flex flex-wrap gap-2">
      <span
        v-for="(member, index) in props.preview.members"
        :key="index"
        class="flex h-7 items-center gap-1.5 rounded-full bg-elev1 pl-1 pr-2.5"
      >
        <UiAvatar :name="member.name" :color-index="member.colorIndex" :size="20" />
        <span class="text-[13px] font-semibold text-text">{{ member.name }}</span>
        <span v-if="member.role === 'OWNER'" class="text-[13px] text-text-mute">· {{ t('family.join.ownerSuffix') }}</span>
      </span>
    </div>

    <span class="mt-6 text-[11px] font-semibold uppercase tracking-wider text-text-mute">{{ t('family.join.dataTitle') }}</span>
    <FamilyConsequences class="mt-2" :items="items" />

    <p class="mt-4 text-center text-[13px] text-text-mute">
      {{ t('family.join.leaveNote') }}
    </p>

    <JoinFooter>
      <UiButton class="w-full" :loading="props.joining" data-testid="join-confirm" @click="emit('join')">
        {{ props.joining ? t('family.join.joining') : t('family.join.cta') }}
      </UiButton>
      <UiButton variant="ghost" class="w-full" @click="emit('cancel')">
        {{ t('family.join.notNow') }}
      </UiButton>
    </JoinFooter>
  </div>
</template>
