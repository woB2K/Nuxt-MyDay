<script lang="ts" setup>
import type { HouseholdMemberItem } from '~~/shared/types'

const props = defineProps<{
  open: boolean
  target: boolean
  members: HouseholdMemberItem[]
}>()

const emit = defineEmits<{ 'update:open': [value: boolean] }>()

const { t } = useI18n()
const toast = useAppToast()

const { mutate: update, isPending } = useUpdateHouseholdMutation()

const toShared = computed(() => props.target)

function confirm() {
  const mode = t(toShared.value ? 'family.savingsMode.sharedLower' : 'family.savingsMode.separateLower')

  update(props.target, {
    onSuccess: () => {
      toast.success(t('family.savingsMode.done', { mode }))
      emit('update:open', false)
    }
  })
}
</script>

<template>
  <UiSheet :open="props.open" @update:open="emit('update:open', $event)">
    <div class="flex flex-col">
      <FamilySheetHead
        icon="i-lucide-piggy-bank"
        :title="t(toShared ? 'family.savingsMode.toSharedTitle' : 'family.savingsMode.toSeparateTitle')"
      />
      <p class="mt-3 text-[15px] leading-[21px] text-text-dim">
        {{ t(toShared ? 'family.savingsMode.toSharedBody' : 'family.savingsMode.toSeparateBody') }}
      </p>

      <div
        v-if="!toShared"
        class="mt-5 overflow-hidden rounded-2xl border border-hairline bg-elev1"
      >
        <div
          v-for="(member, index) in props.members"
          :key="member.userId"
          class="flex items-center gap-3 px-4 py-3"
          :class="{ 'border-t border-hairline': index > 0 }"
        >
          <UiAvatar :name="member.name" :color-index="member.colorIndex" :size="32" />
          <span class="flex-1 truncate text-[15px] font-semibold text-text">{{ member.name }}</span>
          <span class="font-display text-base font-semibold text-text">
            {{ formatAmount(member.savingsBalance ?? 0) }} ₽
          </span>
        </div>
      </div>

      <UiButton class="mt-6 w-full" :loading="isPending" data-testid="savings-mode-confirm" @click="confirm">
        {{ t('family.savingsMode.confirm') }}
      </UiButton>
      <UiButton variant="ghost" class="mt-1 w-full" @click="emit('update:open', false)">
        {{ t('family.savingsMode.cancel') }}
      </UiButton>
    </div>
  </UiSheet>
</template>
