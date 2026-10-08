<script lang="ts" setup>
import type { StepVisualKind } from '~/utils/pwaInstall'

type StepSet = 'ios' | 'iosOther' | 'android'

interface Step {
  key: string
  visual: StepVisualKind
  label?: string
}

const props = defineProps<{ set: StepSet }>()

const { t } = useI18n()

const sets: Record<StepSet, Step[]> = {
  ios: [
    { key: 'ios.step1', visual: 'share' },
    { key: 'ios.step2', visual: 'menuAdd' },
    { key: 'ios.step3', visual: 'add', label: 'ios.visual.add' }
  ],
  iosOther: [
    { key: 'iosOther.step1', visual: 'share' },
    { key: 'ios.step2', visual: 'menuAdd' },
    { key: 'ios.step3', visual: 'add', label: 'ios.visual.add' }
  ],
  android: [
    { key: 'androidFallback.step1', visual: 'kebab' },
    { key: 'androidFallback.step2', visual: 'menuInstall' },
    { key: 'androidFallback.step3', visual: 'install', label: 'androidFallback.visual.install' }
  ]
}

const steps = computed(() => sets[props.set])
</script>

<template>
  <div class="flex flex-col gap-2">
    <UiInstallStep
      v-for="(step, index) in steps"
      :key="step.key"
      :n="index + 1"
      :title="t(`install.${step.key}.title`)"
      :hint="t(`install.${step.key}.hint`)"
      :visual="step.visual"
      :label="step.label ? t(`install.${step.label}`) : ''"
    />
  </div>
</template>
