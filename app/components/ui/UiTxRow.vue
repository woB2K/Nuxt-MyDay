<script lang="ts" setup>
import type { Category, TransactionType } from '~~/prisma/.generated/prisma'
import type { TxAuthor } from '~/utils/family'
import { categoryLabel } from '~/utils/categoryLabel'

interface Props {
  transaction: { type: TransactionType, amount: number, notes?: string | null, date: Date | string }
  category: Pick<Category, 'icon' | 'color' | 'name' | 'key'>
  showDate?: boolean
  author?: TxAuthor
  authorRing?: string
  tags?: string[]
  pending?: boolean
}

const props = withDefaults(defineProps<Props>(), { showDate: true, authorRing: 'var(--c-elev2)', tags: () => [] })

const VISIBLE_TAGS = 2

const { t } = useI18n()
const label = computed(() => categoryLabel(props.category, t))
const visibleTags = computed(() => props.tags.slice(0, VISIBLE_TAGS))
const hiddenTags = computed(() => Math.max(0, props.tags.length - VISIBLE_TAGS))
</script>

<template>
  <div class="flex items-center gap-3 p-4 border-b border-hairline last:border-b-0" :class="{ 'opacity-60': props.pending }">
    <div
      class="relative shrink-0 w-10 h-10 rounded-md flex items-center justify-center"
      :style="{ backgroundColor: `${props.category.color}33` }"
    >
      <UIcon
        :name="props.category.icon"
        :style="{ color: `${props.category.color}`}"
        class="w-5 h-5"
      />
      <UiAvatar
        v-if="props.author"
        class="absolute -right-1 -bottom-1"
        :name="props.author.name ?? ''"
        :color-index="props.author.colorIndex"
        :size="18"
        :ring="props.authorRing"
        data-testid="tx-author"
      />
    </div>
    <div class="flex flex-col gap-1 flex-1 min-w-0">
      <span class="text-text text-sm font-semibold">{{ props.transaction.notes || label }}</span>
      <span class="flex min-w-0 items-center gap-1.5 text-text-dim text-xs">
        <span class="truncate">{{ label }}<template v-if="props.author?.named"> · {{ props.author.name }}</template><template v-if="props.showDate"> · {{ formatDay(props.transaction.date) }}</template></span>
        <span
          v-for="tag in visibleTags"
          :key="tag"
          class="max-w-24 shrink-0 truncate rounded-full bg-elev3 px-1.5 py-px text-[11px] font-medium"
          data-testid="tx-tag"
        >#{{ tag }}</span>
        <span v-if="hiddenTags" class="shrink-0 text-[11px] font-medium text-text-mute">+{{ hiddenTags }}</span>
      </span>
    </div>
    <UIcon
      v-if="props.pending"
      name="i-lucide-clock"
      class="ml-auto shrink-0 w-4 h-4 text-text-mute"
      :aria-label="t('outbox.title')"
      data-testid="tx-pending"
    />
    <span
      class="text-sm font-semibold truncate"
      :class="[props.transaction.type === 'INCOME' ? 'text-success' : 'text-text', { 'ml-auto': !props.pending }]"
    >
      <UiMoney :amount="props.transaction.amount" :sign="props.transaction.type === 'INCOME' ? '+' : '-'" />
    </span>
  </div>
</template>
