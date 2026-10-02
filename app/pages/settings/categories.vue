<script lang="ts" setup>
import type { Category } from '~~/prisma/.generated/prisma'
import { categoryLabel } from '~/utils/categoryLabel'

definePageMeta({ hideFab: true })

const { t } = useI18n()

const { data: categories, isPending } = useCategoriesQuery()
const { mutate: deleteCategory } = useDeleteCategoryMutation()

const sheetOpen = ref(false)
const editing = ref<Category | null>(null)

const sorted = computed(() => [...(categories.value ?? [])].sort((a, b) =>
  a.type === b.type
    ? categoryLabel(a, t).localeCompare(categoryLabel(b, t))
    : a.type.localeCompare(b.type)))

function openSheet(category: Category | null = null) {
  editing.value = category
  sheetOpen.value = true
}
</script>

<template>
  <div class="flex flex-col gap-3 p-4">
    <div class="flex items-start justify-between gap-3">
      <UiRoundBtn class="mb-1" @click="navigateTo('/settings')">
        <UIcon name="i-lucide-chevron-left" class="w-4.5 h-4.5" />
      </UiRoundBtn>

      <button
        class="shrink-0 flex size-9 items-center justify-center rounded-full bg-accent text-accent-ink transition-transform duration-fast ease-spring active:scale-[0.94]"
        type="button"
        :aria-label="t('settings.categoriesScreen.add')"
        @click="openSheet()"
      >
        <UIcon name="i-lucide-plus" class="size-5" />
      </button>
    </div>

    <div class="flex flex-col gap-1">
      <h1 class="text-3xl font-bold text-text">
        {{ t('settings.categoriesScreen.title') }}
      </h1>
      <span class="text-sm text-text-dim">{{ t('settings.categoriesScreen.subtitle') }}</span>
      <span class="text-xs text-text-mute">{{ t('settings.categoriesScreen.hint') }}</span>
    </div>

    <template v-if="isPending">
      <UiSkeletonRow v-for="n in 6" :key="n" />
    </template>

    <UiCard v-else :padding="0" class="overflow-hidden">
      <UiSwipeRow
        v-for="category in sorted"
        :key="category.id"
        :deletable="!category.isSystem"
        @delete="deleteCategory(category.id)"
      >
        <button
          class="flex w-full items-center gap-3 border-b border-hairline p-4 text-left transition-colors duration-fast last:border-b-0 active:bg-elev3"
          type="button"
          @click="openSheet(category)"
        >
          <span
            class="shrink-0 flex size-10 items-center justify-center rounded-xl"
            :style="{ backgroundColor: `${category.color}33` }"
          >
            <UIcon :name="category.icon" class="size-5" :style="{ color: category.color }" />
          </span>

          <span class="flex min-w-0 flex-1 flex-col">
            <span class="truncate text-[15px] font-semibold text-text">{{ categoryLabel(category, t) }}</span>
            <span class="text-xs text-text-mute">
              {{ category.type === 'INCOME'
                ? t('settings.categoriesScreen.income')
                : t('settings.categoriesScreen.expense') }}
            </span>
          </span>

          <UIcon name="i-lucide-chevron-right" class="size-4.5 shrink-0 text-text-mute" />
        </button>
      </UiSwipeRow>
    </UiCard>

    <CategoryEditSheet v-model:open="sheetOpen" :category="editing" />
  </div>
</template>
