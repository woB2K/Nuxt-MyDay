<script lang="ts" setup>
import type { HouseholdMemberItem } from '~~/shared/types'

const props = defineProps<{
  members: HouseholdMemberItem[]
  myId: string | undefined
}>()

const emit = defineEmits<{ open: [] }>()

const { t } = useI18n()

const family = computed(() => props.members.filter(member => member.userId !== props.myId))
const me = computed(() => props.members.find(member => member.userId === props.myId))
</script>

<template>
  <div class="relative flex flex-1 flex-col items-center justify-center px-7 pb-40 text-center">
    <div class="pointer-events-none absolute left-1/2 top-1/2 size-[360px] -translate-x-1/2 -translate-y-[60%] rounded-full bg-[radial-gradient(closest-side,var(--c-accent-soft),transparent)]" />

    <div class="relative flex items-center">
      <UiAvatarStack :members="family" :size="56" />
      <span class="relative -ml-[17px] animate-slide-in">
        <UiAvatar :name="me?.name" :color-index="me?.colorIndex ?? 0" :size="56" ring="var(--c-bg)" />
        <span
          class="absolute -right-1 -bottom-1 flex size-5.5 animate-pop items-center justify-center rounded-full border-2 border-bg bg-success text-accent-ink"
          style="animation-delay: 240ms"
        >
          <UIcon name="i-lucide-check" class="size-3" />
        </span>
      </span>
    </div>

    <h1 class="relative mt-7 text-[28px] font-bold text-text">
      {{ t('family.success.title') }}
    </h1>
    <p class="relative mt-2 max-w-[300px] text-[15px] text-text-dim">
      {{ t('family.success.body') }}
    </p>

    <JoinFooter>
      <UiButton class="w-full" data-testid="join-open-finance" @click="emit('open')">
        <UIcon name="i-lucide-wallet" class="size-5" />
        {{ t('family.success.cta') }}
      </UiButton>
    </JoinFooter>
  </div>
</template>
