<script lang="ts" setup>
type InstallContext = 'welcome' | 'today' | 'settings'
type SheetState = 'guide' | 'prompting' | 'success'
type PickedPlatform = 'ios' | 'android'

const props = defineProps<{
  open: boolean
  context: InstallContext
}>()

const emit = defineEmits<{ 'update:open': [value: boolean] }>()

const { t } = useI18n()
const { platform, browser, canPrompt, promptDismissed, installed, install } = usePwaInstall()

const state = ref<SheetState>('guide')
const picked = ref<PickedPlatform>('ios')
const copied = ref(false)

let copiedTimer: ReturnType<typeof setTimeout> | null = null

const variant = computed(() => {
  if (platform.value === 'ios') return browser.value === 'safari' ? 'ios' : 'iosOther'
  if (platform.value === 'android') return canPrompt.value || state.value === 'prompting' ? 'prompt' : 'androidFallback'

  return 'unknown'
})

const showWelcomeNote = computed(() => props.context === 'welcome'
  && (platform.value === 'ios' || (platform.value === 'unknown' && picked.value === 'ios')))

const benefits = [
  { icon: 'i-lucide-maximize', key: 'fullscreen' },
  { icon: 'i-lucide-layout-grid', key: 'homeIcon' },
  { icon: 'i-lucide-zap', key: 'fast' },
  { icon: 'i-lucide-wifi-off', key: 'offline' }
]

const platformOptions = computed(() => [
  { value: 'ios', label: t('install.unknown.ios') },
  { value: 'android', label: t('install.unknown.android') }
])

watch(() => props.open, (open) => {
  if (open) state.value = installed.value ? 'success' : 'guide'
})

watch(installed, (value) => {
  if (value && props.open) state.value = 'success'
})

onUnmounted(() => {
  if (copiedTimer) clearTimeout(copiedTimer)
})

function close() {
  emit('update:open', false)
}

async function onInstall() {
  state.value = 'prompting'

  const outcome = await install().catch(() => 'unavailable' as const)

  state.value = outcome === 'accepted' ? 'success' : 'guide'
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(window.location.origin)
  } catch {
    useAppToast().error(t('install.iosOther.fallback.copyError'))
    return
  }

  copied.value = true

  if (copiedTimer) clearTimeout(copiedTimer)
  copiedTimer = setTimeout(() => {
    copied.value = false
  }, 2000)
}
</script>

<template>
  <UiSheet :open="props.open" @update:open="emit('update:open', $event)">
    <div class="relative pb-4">
      <button
        class="absolute -top-3 -right-3 flex size-11 items-center justify-center"
        type="button"
        :aria-label="t('install.sheet.close')"
        @click="close"
      >
        <span class="flex size-8 items-center justify-center rounded-full bg-elev3 text-text-dim">
          <UIcon name="i-lucide-x" class="size-4" />
        </span>
      </button>

      <InstallSuccess v-if="state === 'success'" @close="close" />

      <template v-else>
        <div class="flex items-center gap-3.5 pr-11">
          <UiLogoMark :size="52" class="shrink-0" />
          <div class="flex min-w-0 flex-col gap-0.5">
            <h2 class="font-display text-[22px] font-semibold leading-7 tracking-tight text-text">
              {{ t('install.sheet.title') }}
            </h2>
            <p class="text-[15px] leading-5 text-text-dim text-pretty">
              {{ t('install.sheet.subtitle') }}
            </p>
          </div>
        </div>

        <div v-if="showWelcomeNote" class="mt-4 flex items-start gap-2.5 rounded-xl bg-accent-soft px-3.5 py-3">
          <UIcon name="i-lucide-info" class="mt-px size-4.5 shrink-0 text-accent" />
          <span class="text-[13px] font-medium leading-[18px] text-text text-pretty">{{ t('install.sheet.welcomeNote') }}</span>
        </div>

        <div class="mt-5 grid grid-cols-2 gap-x-4 gap-y-3">
          <div v-for="benefit in benefits" :key="benefit.key" class="flex items-start gap-2.5">
            <span class="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
              <UIcon :name="benefit.icon" class="size-4" />
            </span>
            <span class="pt-[5px] text-[13px] font-medium leading-[18px] text-text-dim text-pretty">
              {{ t(`install.benefits.${benefit.key}`) }}
            </span>
          </div>
        </div>

        <div class="mt-6">
          <template v-if="variant === 'ios'">
            <p class="section-label">
              {{ t('install.ios.overline') }}
            </p>
            <InstallSteps set="ios" />
          </template>

          <template v-else-if="variant === 'iosOther'">
            <p class="section-label">
              {{ t('install.iosOther.overline') }}
            </p>
            <InstallSteps set="iosOther" />

            <div class="mt-3 flex flex-col items-start gap-3 rounded-2xl border border-hairline bg-elev1 p-3.5">
              <span class="flex items-start gap-2.5">
                <UIcon name="i-lucide-compass" class="mt-px size-4.5 shrink-0 text-text-dim" />
                <span class="text-[13px] font-medium leading-[18px] text-text-dim text-pretty">
                  {{ t('install.iosOther.fallback.text') }}
                </span>
              </span>
              <UiButton variant="secondary" size="sm" @click="copyLink">
                <UIcon
                  :name="copied ? 'i-lucide-check' : 'i-lucide-link'"
                  class="size-4"
                  :class="copied ? 'text-success' : ''"
                />
                {{ copied ? t('install.iosOther.fallback.copied') : t('install.iosOther.fallback.copy') }}
              </UiButton>
            </div>
          </template>

          <template v-else-if="variant === 'prompt'">
            <UiButton class="w-full" :disabled="state === 'prompting'" @click="onInstall">
              <UIcon name="i-lucide-download" class="size-5" />
              {{ state === 'prompting' ? t('install.android.waiting') : t('install.android.cta') }}
            </UiButton>
            <p class="mt-2.5 text-center text-[13px] font-medium leading-[18px] text-text-mute">
              {{ t('install.android.hint') }}
            </p>
          </template>

          <template v-else-if="variant === 'androidFallback'">
            <p v-if="promptDismissed" class="mb-3 text-[13px] font-medium leading-[18px] text-text-dim text-pretty">
              {{ t('install.android.promptDismissed') }}
            </p>
            <p class="section-label">
              {{ t('install.androidFallback.overline') }}
            </p>
            <InstallSteps set="android" />
          </template>

          <template v-else>
            <p class="section-label">
              {{ t('install.unknown.overline') }}
            </p>
            <UiPillSelect
              :model-value="picked"
              :options="platformOptions"
              bg-class="bg-elev1"
              full
              @update:model-value="picked = $event as PickedPlatform"
            />
            <InstallSteps :key="picked" class="mt-3" :set="picked" />
          </template>
        </div>

        <UiButton variant="ghost" size="md" class="mt-4 w-full" @click="close">
          {{ t('install.sheet.notNow') }}
        </UiButton>
      </template>
    </div>
  </UiSheet>
</template>

<style scoped>
.section-label {
  margin-bottom: 10px;
  font-size: 11px;
  line-height: 14px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-mute);
}
</style>
