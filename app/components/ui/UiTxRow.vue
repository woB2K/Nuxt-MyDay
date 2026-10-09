<script lang="ts" setup>
import type { Category, Transaction } from '~~/prisma/.generated/prisma'
import type { TxAuthor } from '~/utils/family'
import { categoryLabel } from '~/utils/categoryLabel'

interface Props {
  transaction: Transaction
  category: Category
  showDate?: boolean
  author?: TxAuthor
  authorRing?: string
}

const props = withDefaults(defineProps<Props>(), { showDate: true, authorRing: 'var(--c-elev2)' })

const { t } = useI18n()
const label = computed(() => categoryLabel(props.category, t))
</script>

<template>
  <div class="flex items-center gap-3 p-4 border-b border-hairline last:border-b-0">
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
      <span class="text-text-dim text-xs">
        {{ label }}<template v-if="props.author?.named"> · {{ props.author.name }}</template><template v-if="props.showDate"> · {{ formatDay(props.transaction.date) }}</template>
      </span>
    </div>
    <span
      class="ml-auto text-sm font-semibold truncate"
      :class="props.transaction.type === 'INCOME' ? 'text-success' : 'text-text'"
    >
      {{ props.transaction.type === 'INCOME' ? '+' : '-' }}{{ formatAmount(props.transaction.amount) }} ₽
    </span>
  </div>
</template>
