<script lang="ts" setup>
const props = defineProps<{
  open: boolean
  selected: string | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'apply': [value: string | null]
}>()

const { t } = useI18n()
const { me, others } = useFamily()

const options = computed(() => [
  { id: null, label: t('family.finance.everyone'), member: null },
  ...(me.value ? [{ id: me.value.userId, label: t('family.finance.mine'), member: me.value }] : []),
  ...others.value.map(member => ({ id: member.userId, label: member.name, member }))
])

function pick(id: string | null) {
  emit('apply', id)
  emit('update:open', false)
}
</script>

<template>
  <UiSheet :open="props.open" :title="t('family.finance.whose')" @update:open="emit('update:open', $event)">
    <div class="overflow-hidden rounded-xl border border-hairline bg-elev2">
      <button
        v-for="option in options"
        :key="option.id ?? 'everyone'"
        class="w-full flex items-center gap-3 px-4 py-3 border-t border-hairline first:border-t-0"
        type="button"
        data-testid="author-option"
        @click="pick(option.id)"
      >
        <UiAvatar v-if="option.member" :name="option.member.name" :color-index="option.member.colorIndex" :size="28" />
        <span v-else class="size-7 shrink-0 flex items-center justify-center rounded-full bg-elev3">
          <UIcon name="i-lucide-users" class="size-4 text-text-mute" />
        </span>
        <span
          class="flex-1 min-w-0 truncate text-left text-[15px]"
          :class="props.selected === option.id ? 'text-accent font-semibold' : 'text-text font-medium'"
        >{{ option.label }}</span>
        <UIcon v-if="props.selected === option.id" name="i-lucide-check" class="size-4.5 shrink-0 text-accent" />
      </button>
    </div>
  </UiSheet>
</template>
