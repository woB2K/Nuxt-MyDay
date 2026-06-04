<script lang="ts" setup>
import type { Category, Transaction } from '~~/prisma/.generated/prisma'

definePageMeta({ layout: false })

const mockCategories: Category[] = [
  { id: '1', userId: 'u1', name: 'Food', icon: 'i-lucide-utensils', color: '#FB923C', type: 'EXPENSE', createdAt: new Date(), updatedAt: new Date() },
  { id: '2', userId: 'u1', name: 'Shopping', icon: 'i-lucide-shopping-cart', color: '#34D399', type: 'EXPENSE', createdAt: new Date(), updatedAt: new Date() },
  { id: '3', userId: 'u1', name: 'Rent', icon: 'i-lucide-house', color: '#60A5FA', type: 'EXPENSE', createdAt: new Date(), updatedAt: new Date() },
  { id: '4', userId: 'u1', name: 'Transport', icon: 'i-lucide-car', color: '#A78BFA', type: 'EXPENSE', createdAt: new Date(), updatedAt: new Date() },
  { id: '5', userId: 'u1', name: 'Fun', icon: 'i-lucide-film', color: '#F472B6', type: 'EXPENSE', createdAt: new Date(), updatedAt: new Date() },
  { id: '6', userId: 'u1', name: 'Health', icon: 'i-lucide-heart', color: '#F87171', type: 'EXPENSE', createdAt: new Date(), updatedAt: new Date() },
  { id: '7', userId: 'u1', name: 'Learning', icon: 'i-lucide-book', color: '#34D399', type: 'EXPENSE', createdAt: new Date(), updatedAt: new Date() },
  { id: '8', userId: 'u1', name: 'Gifts', icon: 'i-lucide-gift', color: '#FBBF24', type: 'EXPENSE', createdAt: new Date(), updatedAt: new Date() }
]

const selectedCategoryId = ref('1')

const mockTransactions = [
  { id: 't1', userId: 'u1', type: 'EXPENSE', amount: 24.50, categoryId: '1', notes: 'Lunch at cafe', date: new Date('2026-05-27'), createdAt: new Date(), updatedAt: new Date() },
  { id: 't2', userId: 'u1', type: 'INCOME', amount: 3200.00, categoryId: '2', notes: null, date: new Date('2026-05-25'), createdAt: new Date(), updatedAt: new Date() },
  { id: 't3', userId: 'u1', type: 'EXPENSE', amount: 8.90, categoryId: '3', notes: 'Metro', date: new Date('2026-05-24'), createdAt: new Date(), updatedAt: new Date() }
] as unknown as (Transaction & { amount: number })[]

const categoryMap = new Map(mockCategories.map(c => [c.id, c]))

const mockCategoryBars = [
  { category: mockCategories[0]!, amount: 4100 },
  { category: mockCategories[4]!, amount: 2400 },
  { category: mockCategories[1]!, amount: 3200 },
  { category: mockCategories[3]!, amount: 1800 },
  { category: mockCategories[5]!, amount: 900 }
]

const barMaxAmount = Math.max(...mockCategoryBars.map(b => b.amount))
const barTotalAmount = mockCategoryBars.reduce((sum, b) => sum + b.amount, 0)
</script>

<template>
  <div class="min-h-screen bg-bg p-4 flex flex-col gap-6">
    <section>
      <p class="text-text-dim text-xs uppercase tracking-widest mb-3">
        UiTxRow
      </p>
      <UiCard :padding="0">
        <UiTxRow
          v-for="tx in mockTransactions"
          :key="tx.id"
          :transaction="tx as unknown as Transaction"
          :category="categoryMap.get(tx.categoryId)!"
        />
      </UiCard>
    </section>

    <section>
      <p class="text-text-dim text-xs uppercase tracking-widest mb-3">
        UiCategoryTile
      </p>
      <div class="grid grid-cols-4 gap-3">
        <UiCategoryTile
          v-for="cat in mockCategories"
          :key="cat.id"
          :category="cat"
          :selected="selectedCategoryId === cat.id"
          @click="selectedCategoryId = cat.id"
        />
      </div>
    </section>

    <section>
      <p class="text-text-dim text-xs uppercase tracking-widest mb-3">
        UiCategoryBar
      </p>
      <UiCard :padding="0">
        <UiCategoryBar
          v-for="bar in mockCategoryBars"
          :key="bar.category.id"
          :category="bar.category"
          :amount="bar.amount"
          :max-amount="barMaxAmount"
          :total-amount="barTotalAmount"
        />
      </UiCard>
    </section>
  </div>
</template>
