<script lang="ts" setup>
import type { AccentSetting, LangSetting, ThemeSetting } from '~~/shared/types'
import { TRASH_RETENTION_DAYS } from '~~/shared/schemas'
import { themePreferences } from '~/composables/useTheme'

definePageMeta({ hideFab: true })

const { t, locale, setLocale } = useI18n()
const authStore = useAuthStore()
const { preference, setTheme, setAccent } = useTheme()
const { mutate: saveSettings } = useUpdateSettingsMutation()
const { appVersion } = useRuntimeConfig().public

function changeTheme(value: ThemeSetting) {
  setTheme(value)
  saveSettings({ theme: value })
}

function changeAccent(value: AccentSetting) {
  setAccent(value)
  saveSettings({ accent: value })
}

function changeLocale(value: LangSetting) {
  setLocale(value)
  saveSettings({ lang: value })
}

const themeOptions = computed(() => themePreferences.map(value => ({
  value,
  label: t(`settings.themes.${value}`)
})))

const localeOptions = [
  { value: 'en', label: 'EN' },
  { value: 'ru', label: 'RU' }
]

const { currency, name: currencyName } = useCurrency()
const { isOwner } = useFamily()
const { data: instance } = useInstanceQuery()
const currencySheetOpen = ref(false)

const canChangeCurrency = computed(() => isOwner.value && !instance.value?.demo)

const currencySub = computed(() => canChangeCurrency.value || instance.value?.demo
  ? `${currencyName()} · ${currency.value}`
  : t('settings.currencyOwnerOnly', { name: currencyName() }))

const habitsOnToday = computed(() => authStore.user?.settings.habitsOnToday ?? true)

function changeHabitsOnToday(value: boolean) {
  if (authStore.user) authStore.user.settings.habitsOnToday = value
  saveSettings({ habitsOnToday: value })
}

const initial = computed(() => authStore.user?.name?.trim().charAt(0).toUpperCase() ?? '?')

const pinEnabled = computed(() => authStore.user?.settings.pinEnabled ?? false)
const pinSheetOpen = ref(false)
const pinMode = ref<'enable' | 'change' | 'disable'>('enable')

function openPinSheet(mode: 'enable' | 'change' | 'disable') {
  pinMode.value = mode
  pinSheetOpen.value = true
}

function togglePin() {
  openPinSheet(pinEnabled.value ? 'disable' : 'enable')
}

const isSigningOut = ref(false)

async function signOut() {
  isSigningOut.value = true

  try {
    await authStore.logout()
    await navigateTo('/auth/welcome')
  } catch {
    useAppToast().error(t('settings.signOutError'))
  } finally {
    isSigningOut.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-4 p-4">
    <h1 class="text-3xl font-bold text-text">
      {{ t('settings.title') }}
    </h1>

    <UiCard class="flex-row items-center gap-3">
      <span
        class="shrink-0 flex size-12 items-center justify-center rounded-full bg-accent-soft text-lg font-semibold text-accent"
      >{{ initial }}</span>

      <span class="flex min-w-0 flex-col">
        <span class="truncate text-[15px] font-semibold text-text">{{ authStore.user?.name }}</span>
        <span class="truncate text-xs text-text-mute">{{ authStore.user?.email ?? t('settings.noEmail') }}</span>
      </span>
    </UiCard>

    <FamilyRow class="-mt-2" />

    <p v-if="instance?.demo" class="rounded-xl border border-hairline bg-elev2 px-4 py-3 text-[13px] text-text-dim" data-testid="demo-note">
      {{ t('settings.demoNote') }}
    </p>

    <InstallSettingsCard />

    <UiCard class="gap-5">
      <div class="flex flex-col gap-2">
        <span class="text-[11px] font-semibold uppercase tracking-wider text-text-mute">
          {{ t('settings.theme') }}
        </span>
        <UiPillSelect
          :model-value="preference"
          :options="themeOptions"
          bg-class="bg-elev3"
          full
          @update:model-value="changeTheme($event as ThemeSetting)"
        />
      </div>

      <div class="flex flex-col gap-3">
        <span class="text-[11px] font-semibold uppercase tracking-wider text-text-mute">
          {{ t('settings.accent') }}
        </span>
        <AccentPicker @select="changeAccent" />
      </div>
    </UiCard>

    <UiCard :padding="0">
      <UiSettingRow icon="i-lucide-languages" :label="t('settings.language')">
        <template #trailing>
          <UiPillSelect
            :model-value="locale"
            :options="localeOptions"
            bg-class="bg-elev3"
            @update:model-value="changeLocale($event as LangSetting)"
          />
        </template>
      </UiSettingRow>

      <UiSettingRow
        icon="i-lucide-coins"
        :label="t('settings.currency')"
        :sub="currencySub"
        :clickable="canChangeCurrency"
        data-testid="currency-row"
        @click="currencySheetOpen = true"
      />

      <UiSettingRow
        icon="i-lucide-shapes"
        :label="t('settings.categories')"
        :sub="t('settings.categoriesSub')"
        clickable
        @click="navigateTo('/settings/categories')"
      />

      <UiSettingRow
        icon="i-lucide-tags"
        :label="t('settings.tags')"
        :sub="t('settings.tagsSub')"
        clickable
        @click="navigateTo('/settings/tags')"
      />

      <UiSettingRow
        icon="i-lucide-file-up"
        :label="t('settings.import')"
        :sub="t('settings.importSub')"
        clickable
        data-testid="import-row"
        @click="navigateTo('/settings/import')"
      />

      <UiSettingRow
        icon="i-lucide-trash-2"
        :label="t('settings.trash')"
        :sub="t('settings.trashSub', { days: TRASH_RETENTION_DAYS })"
        clickable
        @click="navigateTo('/settings/trash')"
      />

      <UiSettingRow
        icon="i-lucide-layout-template"
        :label="t('settings.templates')"
        :sub="t('settings.templatesSub')"
        clickable
        last
        @click="navigateTo('/tasks/templates')"
      />
    </UiCard>

    <UiCard :padding="0">
      <UiSettingRow
        icon="i-lucide-flame"
        :label="t('settings.habits')"
        :sub="t('settings.habitsSub')"
        clickable
        @click="navigateTo('/habits')"
      />

      <UiSettingRow
        icon="i-lucide-sun"
        :label="t('settings.habitsOnToday')"
        last
      >
        <template #trailing>
          <UiSwitch
            :model-value="habitsOnToday"
            :aria-label="t('settings.habitsOnToday')"
            data-habits-on-today
            @update:model-value="changeHabitsOnToday"
          />
        </template>
      </UiSettingRow>
    </UiCard>

    <UiCard :padding="0">
      <UiSettingRow
        icon="i-lucide-lock"
        :label="t('settings.pin.lock')"
        :sub="t('settings.pin.lockSub')"
        :last="!pinEnabled"
      >
        <template #trailing>
          <UiSwitch :model-value="pinEnabled" :aria-label="t('settings.pin.lock')" @update:model-value="togglePin" />
        </template>
      </UiSettingRow>

      <Transition name="pin-row">
        <UiSettingRow
          v-if="pinEnabled"
          icon="i-lucide-key-round"
          :label="t('settings.pin.change')"
          clickable
          last
          @click="openPinSheet('change')"
        />
      </Transition>
    </UiCard>

    <UiCard :padding="0">
      <UiSettingRow
        icon="i-lucide-sparkles"
        :label="t('settings.whatsNew')"
        :sub="t('settings.version', { version: appVersion })"
        clickable
        last
        @click="navigateTo('/settings/changelog')"
      />
    </UiCard>

    <button
      class="h-13 w-full rounded-xl bg-danger/10 text-base font-semibold text-danger transition-transform duration-fast active:scale-[0.98] disabled:opacity-50"
      type="button"
      :disabled="isSigningOut"
      @click="signOut"
    >
      {{ t('settings.signOut') }}
    </button>

    <PinSheet v-model:open="pinSheetOpen" :mode="pinMode" />
    <CurrencySheet v-model:open="currencySheetOpen" />
  </div>
</template>

<style scoped>
.pin-row-enter-active,
.pin-row-leave-active {
  transition: opacity var(--duration-base) var(--ease-out), max-height var(--duration-base) var(--ease-out);
  max-height: 80px;
  overflow: hidden;
}
.pin-row-enter-from,
.pin-row-leave-to {
  opacity: 0;
  max-height: 0;
}
</style>
