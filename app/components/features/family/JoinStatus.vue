<script lang="ts" setup>
import type { HouseholdMemberItem } from '~~/shared/types'
import type { IconDiscTone } from '~/utils/family'

const props = defineProps<{
  state: 'busy' | 'invalid' | 'already'
  own?: boolean
  family?: HouseholdMemberItem[]
}>()

const emit = defineEmits<{ primary: [], cancel: [] }>()

const { t } = useI18n()

const LOOKS: Record<typeof props.state, { icon: string, tone: IconDiscTone }> = {
  busy: { icon: 'i-lucide-users', tone: 'warning' },
  invalid: { icon: 'i-lucide-link-2-off', tone: 'neutral' },
  already: { icon: 'i-lucide-user-check', tone: 'success' }
}

const body = computed(() => {
  if (props.state !== 'already') return t(`family.${props.state}.body`)
  return t(props.own ? 'family.already.ownBody' : 'family.already.memberBody')
})
</script>

<template>
  <div class="flex flex-1 flex-col items-center justify-center px-7 pb-36 text-center" :data-testid="`join-${props.state}`">
    <UiIconDisc :icon="LOOKS[props.state].icon" :tone="LOOKS[props.state].tone" :size="72" class="animate-pop" />
    <h1 class="mt-6 text-balance text-[26px] font-bold leading-8 text-text">
      {{ t(`family.${props.state}.title`) }}
    </h1>
    <p class="mt-2 max-w-[310px] text-[15px] leading-[21px] text-text-dim">
      {{ body }}
    </p>

    <UiCard v-if="props.state === 'busy' && props.family?.length" class="mt-6 w-full items-start gap-3 border border-hairline">
      <span class="text-[11px] font-semibold uppercase tracking-wider text-text-mute">{{ t('family.busy.current') }}</span>
      <span class="flex items-center gap-3">
        <UiAvatarStack :members="props.family" :size="32" ring="var(--c-elev2)" />
        <span class="truncate text-[15px] font-semibold text-text">{{ props.family.map(member => member.name).join(', ') }}</span>
      </span>
    </UiCard>

    <JoinFooter>
      <UiButton class="w-full" @click="emit('primary')">
        {{ t(`family.${props.state}.cta`) }}
      </UiButton>
      <UiButton v-if="props.state === 'busy'" variant="ghost" class="w-full" @click="emit('cancel')">
        {{ t('family.busy.notNow') }}
      </UiButton>
    </JoinFooter>
  </div>
</template>
