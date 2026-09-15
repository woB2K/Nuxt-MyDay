<script lang="ts" setup>
type PinMode = 'enable' | 'change' | 'disable'
type PinStep = 'current' | 'next' | 'confirm'

const props = defineProps<{
  open: boolean
  mode: PinMode
}>()

const emit = defineEmits<{ 'update:open': [value: boolean] }>()

const { t } = useI18n()

const { mutate: setPin, isPending: isSaving } = useSetPinMutation()
const { mutate: disablePin, isPending: isDisabling } = useDisablePinMutation()

const pad = ref<{ clear: () => void, reject: () => void } | null>(null)

const step = ref<PinStep>('next')
const currentPin = ref('')
const nextPin = ref('')
const error = ref('')

const isPending = computed(() => isSaving.value || isDisabling.value)

const title = computed(() => t(`settings.pin.${props.mode}Title`))

const hint = computed(() => {
  if (step.value === 'current') return t('settings.pin.enterCurrent')
  if (step.value === 'confirm') return t('settings.pin.repeatNew')

  return props.mode === 'change' ? t('settings.pin.enterNew') : t('settings.pin.enterFirst')
})

function reset() {
  step.value = props.mode === 'enable' ? 'next' : 'current'
  currentPin.value = ''
  nextPin.value = ''
  error.value = ''
}

watch(() => props.open, (open) => {
  if (open) reset()
}, { immediate: true })

function close() {
  emit('update:open', false)
}

function fail(message: string) {
  error.value = message
  pad.value?.reject()
}

function save() {
  setPin(
    { pin: nextPin.value, ...(currentPin.value ? { currentPin: currentPin.value } : {}) },
    {
      onSuccess: close,
      onError: () => {
        step.value = props.mode === 'enable' ? 'next' : 'current'
        nextPin.value = ''
        fail(t('settings.pin.saveError'))
      }
    }
  )
}

function submit(pin: string) {
  error.value = ''

  if (props.mode === 'disable') {
    disablePin({ pin }, {
      onSuccess: close,
      onError: () => fail(t('pin.wrongSimple'))
    })
    return
  }

  if (step.value === 'current') {
    currentPin.value = pin
    step.value = 'next'
    pad.value?.clear()
    return
  }

  if (step.value === 'next') {
    nextPin.value = pin
    step.value = 'confirm'
    pad.value?.clear()
    return
  }

  if (pin !== nextPin.value) {
    step.value = 'next'
    nextPin.value = ''
    fail(t('settings.pin.mismatch'))
    return
  }

  save()
}
</script>

<template>
  <UiSheet :open="props.open" :title="title" @update:open="emit('update:open', $event)">
    <div class="flex flex-col gap-5 pb-2">
      <p class="text-center text-sm text-text-dim">
        {{ hint }}
      </p>

      <UiPinPad
        ref="pad"
        :error="error"
        :disabled="isPending"
        @submit="submit"
      />
    </div>
  </UiSheet>
</template>
