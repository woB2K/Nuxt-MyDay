<script lang="ts" setup>
import { copyText } from '~/utils/clipboard'

const props = defineProps<{ open: boolean, email: string }>()

const emit = defineEmits<{ 'update:open': [value: boolean] }>()

const { t } = useI18n()
const toast = useAppToast()

const command = computed(() => `docker compose run --rm migrate pnpm admin reset-password ${props.email.trim() || 'you@example.com'}`)

async function copy() {
  if (await copyText(command.value)) toast.success(t('auth.forgot.copied'))
  else toast.error(t('auth.forgot.copyError'))
}
</script>

<template>
  <UiSheet :open="props.open" :title="t('auth.forgot.title')" @update:open="emit('update:open', $event)">
    <div class="flex flex-col gap-4 pb-4">
      <p class="text-[15px] text-text">
        {{ t('auth.forgot.body') }}
      </p>

      <div class="flex flex-col gap-2 rounded-xl border border-hairline bg-elev2 p-4">
        <span class="text-[11px] font-semibold uppercase tracking-wider text-text-mute">
          {{ t('auth.forgot.adminTitle') }}
        </span>
        <p class="text-[13px] text-text-dim">
          {{ t('auth.forgot.adminHint') }}
        </p>
        <code class="block break-all rounded-lg bg-elev3 px-3 py-2 font-mono text-[12px] text-text" data-testid="forgot-command">{{ command }}</code>
        <UiButton variant="secondary" size="sm" @click="copy">
          {{ t('auth.forgot.copy') }}
        </UiButton>
      </div>
    </div>
  </UiSheet>
</template>
