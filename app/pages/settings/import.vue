<script lang="ts" setup>
import type { ImportTransactionsResult } from '~~/shared/types'
import type { ImportSkipReason, ParsedImport } from '~/utils/csvImport'
import type { ImportCategoryChoice } from '~/utils/importCategories'
import { categoryLabel } from '~/utils/categoryLabel'
import { decodeCsv, parseImport } from '~/utils/csvImport'
import { importPayload, matchImportCategories, summarizeImport } from '~/utils/importCategories'

definePageMeta({ hideFab: true })

const SKIP_REASONS: ImportSkipReason[] = ['transfer', 'date', 'amount', 'type']

const { t } = useI18n()
const toast = useAppToast()
const { currency } = useCurrency()
const { data: categories } = useCategoriesQuery()
const { mutate: importRows, isPending, done } = useImportTransactionsMutation()

const fileInput = ref<HTMLInputElement | null>(null)
const fileName = ref('')
const parsed = ref<ParsedImport | null>(null)
const unknownFile = ref(false)
const choices = ref<ImportCategoryChoice[]>([])
const result = ref<ImportTransactionsResult | null>(null)

const summary = computed(() => parsed.value ? summarizeImport(parsed.value.rows) : null)
const foreignCurrencies = computed(() => summary.value?.currencies.filter(code => code !== currency.value) ?? [])
const skippedBy = computed(() => SKIP_REASONS
  .map(reason => ({ reason, count: parsed.value?.skipped.filter(item => item.reason === reason).length ?? 0 }))
  .filter(item => item.count > 0))

function optionsFor(choice: ImportCategoryChoice) {
  return (categories.value ?? [])
    .filter(category => category.type === choice.type)
    .map(category => ({ id: category.id, label: categoryLabel(category, t) }))
    .sort((a, b) => a.label.localeCompare(b.label))
}

function reset() {
  parsed.value = null
  unknownFile.value = false
  choices.value = []
  result.value = null
  fileName.value = ''
  if (fileInput.value) fileInput.value.value = ''
}

async function onFile(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  reset()
  fileName.value = file.name

  const data = parseImport(decodeCsv(await file.arrayBuffer()))

  if (!data) {
    unknownFile.value = true
    return
  }

  parsed.value = data
  choices.value = matchImportCategories(data.rows, categories.value ?? [], category => categoryLabel(category, t))
}

function setMatch(choice: ImportCategoryChoice, value: string) {
  choice.match = value || null
}

function submit() {
  if (!parsed.value?.rows.length) return

  importRows(importPayload(parsed.value.rows, choices.value, t('settings.importScreen.noCategory')), {
    onSuccess: (data) => {
      result.value = data
    },
    onError: () => toast.error(t('settings.importScreen.error'))
  })
}
</script>

<template>
  <div class="flex flex-col gap-3 p-4">
    <UiRoundBtn class="mb-1 self-start" @click="navigateTo('/settings')">
      <UIcon name="i-lucide-chevron-left" class="w-4.5 h-4.5" />
    </UiRoundBtn>

    <div class="flex flex-col gap-1">
      <h1 class="text-3xl font-bold text-text">
        {{ t('settings.importScreen.title') }}
      </h1>
      <span class="text-sm text-text-dim">{{ t('settings.importScreen.subtitle') }}</span>
    </div>

    <input
      ref="fileInput"
      type="file"
      accept=".csv,text/csv,text/plain"
      class="hidden"
      data-testid="import-file"
      @change="onFile"
    >

    <UiCard v-if="result" class="gap-3" data-testid="import-result">
      <div class="flex items-center gap-3">
        <UiIconDisc icon="i-lucide-circle-check" tone="success" :size="36" />
        <span class="text-[17px] font-semibold text-text">{{ t('settings.importScreen.doneTitle') }}</span>
      </div>
      <p class="text-sm text-text-dim">
        {{ t('settings.importScreen.doneBody', { created: result.created, existing: result.existing, categories: result.categories, tags: result.tags }) }}
      </p>
      <div class="flex gap-2">
        <UiButton size="md" class="flex-1" @click="navigateTo('/finance')">
          {{ t('settings.importScreen.toFinance') }}
        </UiButton>
        <UiButton size="md" variant="secondary" class="flex-1" @click="reset">
          {{ t('settings.importScreen.another') }}
        </UiButton>
      </div>
    </UiCard>

    <template v-else-if="parsed">
      <UiCard class="gap-2" data-testid="import-summary">
        <div class="flex items-center justify-between gap-3">
          <span class="truncate text-[15px] font-semibold text-text">{{ fileName }}</span>
          <button type="button" class="shrink-0 text-sm text-accent" @click="fileInput?.click()">
            {{ t('settings.importScreen.change') }}
          </button>
        </div>
        <span class="text-sm text-text-dim">
          {{ t('settings.importScreen.detected', { format: t(`settings.importScreen.formats.${parsed.source}`) }) }}
        </span>
        <span class="text-sm text-text">
          {{ t('family.plural.tx', parsed.rows.length) }}<template v-if="summary">
            · {{ formatDate(summary.from) }} — {{ formatDate(summary.to) }}
          </template>
        </span>
        <span v-for="item in skippedBy" :key="item.reason" class="text-xs text-text-mute" :data-skip="item.reason">
          {{ t(`settings.importScreen.skipped.${item.reason}`, { count: item.count }) }}
        </span>
        <span v-if="foreignCurrencies.length" class="text-xs text-warning" data-testid="import-currency">
          {{ t('settings.importScreen.currencyWarning', { list: foreignCurrencies.join(', '), currency }) }}
        </span>
      </UiCard>

      <template v-if="choices.length">
        <UiSectionHeader :title="t('settings.importScreen.categoriesTitle')" :caption="t('settings.importScreen.categoriesHint')" />
        <UiCard :padding="0" class="overflow-hidden">
          <label
            v-for="choice in choices"
            :key="choice.key"
            class="flex items-center gap-3 border-b border-hairline px-4 py-3 last:border-b-0"
            data-testid="import-category"
          >
            <span class="flex min-w-0 flex-1 flex-col">
              <span class="truncate text-[15px] font-medium text-text">{{ choice.name || t('settings.importScreen.noCategory') }}</span>
              <span class="text-xs text-text-mute">
                {{ t(choice.type === 'INCOME' ? 'settings.importScreen.income' : 'settings.importScreen.expense') }} · {{ t('family.plural.tx', choice.rows) }}
              </span>
            </span>
            <select
              :value="choice.match ?? ''"
              class="max-w-[45%] truncate rounded-lg border border-hairline bg-elev3 px-2 py-1.5 text-sm text-text"
              @change="setMatch(choice, ($event.target as HTMLSelectElement).value)"
            >
              <option value="">{{ t('settings.importScreen.createNew') }}</option>
              <option v-for="option in optionsFor(choice)" :key="option.id" :value="option.id">{{ option.label }}</option>
            </select>
          </label>
        </UiCard>
      </template>

      <UiButton
        size="lg"
        class="mt-2"
        :loading="isPending"
        :disabled="!parsed.rows.length"
        data-testid="import-submit"
        @click="submit"
      >
        {{ isPending
          ? t('settings.importScreen.importing', { done, total: parsed.rows.length })
          : t('settings.importScreen.submit', { count: parsed.rows.length }) }}
      </UiButton>
    </template>

    <template v-else>
      <UiCard class="gap-3">
        <p class="text-sm text-text-dim">
          {{ t('settings.importScreen.intro') }}
        </p>
        <ul class="flex flex-col gap-2 text-sm text-text">
          <li v-for="format in ['zenmoney', 'coinkeeper', 'myday']" :key="format" class="flex flex-col">
            <span class="font-medium">{{ t(`settings.importScreen.formats.${format}`) }}</span>
            <span class="text-xs text-text-mute">{{ t(`settings.importScreen.howTo.${format}`) }}</span>
          </li>
        </ul>
        <p v-if="unknownFile" class="text-sm text-danger" data-testid="import-unknown">
          {{ t('settings.importScreen.unknown') }}
        </p>
      </UiCard>
      <UiButton size="lg" data-testid="import-pick" @click="fileInput?.click()">
        <UIcon name="i-lucide-file-up" />
        <span>{{ t('settings.importScreen.pick') }}</span>
      </UiButton>
    </template>
  </div>
</template>
