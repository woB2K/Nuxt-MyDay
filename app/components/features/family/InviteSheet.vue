<script lang="ts" setup>
import type { HouseholdResponse } from '~~/shared/types'
import { canShare, copyText } from '~/utils/clipboard'
import { inviteLink } from '~/utils/family'
import { formatLongDay } from '~/utils/formatDate'

type Step = 'savings' | 'ready' | 'active'

const props = defineProps<{
  open: boolean
  household: HouseholdResponse
}>()

const emit = defineEmits<{ 'update:open': [value: boolean] }>()

const COPIED_MS = 2000

const { t, locale } = useI18n()
const toast = useAppToast()

const { mutateAsync: updateHousehold, isPending: isUpdating } = useUpdateHouseholdMutation()
const { mutateAsync: createInvite, isPending: isCreating } = useCreateInviteMutation()
const { mutate: revokeInvite, isPending: isRevoking } = useRevokeInviteMutation()

const step = ref<Step>('savings')
const shareSavings = ref(true)
const token = ref('')
const expiresAt = ref<Date | string>('')
const copied = ref(false)

let copiedTimer: ReturnType<typeof setTimeout> | undefined

const link = computed(() => token.value ? inviteLink(window.location.origin, token.value) : '')
const until = computed(() => expiresAt.value ? formatLongDay(expiresAt.value, locale.value) : '')
const isBusy = computed(() => isUpdating.value || isCreating.value)
const shareable = ref(false)

function close() {
  emit('update:open', false)
}

async function create() {
  try {
    if (step.value === 'savings' && shareSavings.value !== props.household.shareSavings) {
      await updateHousehold(shareSavings.value)
    }

    const created = await createInvite()
    token.value = created.token
    expiresAt.value = created.expiresAt
    step.value = 'ready'
  } catch {}
}

async function copy() {
  if (!(await copyText(link.value))) {
    toast.error(t('toast.family.copyError'))
    return
  }

  copied.value = true
  clearTimeout(copiedTimer)
  copiedTimer = setTimeout(() => {
    copied.value = false
  }, COPIED_MS)
}

async function share() {
  try {
    await navigator.share({ title: t('family.invite.shareText'), text: t('family.invite.shareText'), url: link.value })
  } catch {}
}

function revoke() {
  revokeInvite(undefined, { onSuccess: close })
}

watch(() => props.open, (open) => {
  if (!open) return

  shareable.value = canShare()
  copied.value = false
  token.value = ''
  shareSavings.value = props.household.shareSavings

  if (props.household.invite) {
    step.value = 'active'
    expiresAt.value = props.household.invite.expiresAt
    return
  }

  if (props.household.members.length > 1) {
    step.value = 'ready'
    create()
    return
  }

  step.value = 'savings'
}, { immediate: true })

onUnmounted(() => clearTimeout(copiedTimer))
</script>

<template>
  <UiSheet :open="props.open" @update:open="emit('update:open', $event)">
    <Transition name="family-step" mode="out-in">
      <div v-if="step === 'savings'" key="savings" class="flex flex-col">
        <FamilySheetHead
          icon="i-lucide-piggy-bank"
          :title="t('family.invite.savingsTitle')"
          :sub="t('family.invite.savingsSub')"
        />

        <div class="mt-5 flex flex-col gap-2" role="radiogroup">
          <FamilyRadioCard
            :title="t('family.invite.shared')"
            :body="t('family.invite.sharedBody')"
            :badge="t('family.invite.byDefault')"
            :selected="shareSavings"
            @select="shareSavings = true"
          />
          <FamilyRadioCard
            :title="t('family.invite.separate')"
            :body="t('family.invite.separateBody')"
            :selected="!shareSavings"
            @select="shareSavings = false"
          />
        </div>

        <UiButton class="mt-6 w-full" :loading="isBusy" data-testid="invite-create" @click="create">
          <UIcon name="i-lucide-link" class="size-5" />
          {{ t('family.invite.create') }}
        </UiButton>
      </div>

      <div v-else-if="step === 'ready'" key="ready" class="flex flex-col">
        <FamilySheetHead
          icon="i-lucide-check"
          tone="success"
          pop
          :title="t('family.invite.readyTitle')"
          :sub="t('family.invite.readySub')"
        />

        <template v-if="token">
          <button
            class="mt-5 flex h-13 w-full items-center gap-2.5 rounded-xl border border-hairline2 bg-field px-3.5 text-left"
            type="button"
            data-testid="invite-link"
            @click="copy"
          >
            <UIcon name="i-lucide-link" class="size-4.5 shrink-0 text-text-mute" />
            <span class="truncate font-mono text-sm text-text">{{ link }}</span>
          </button>

          <p class="mt-2 flex items-center gap-1.5 text-[13px] font-medium text-text-mute">
            <UIcon name="i-lucide-clock" class="size-3.5" />
            {{ t('family.invite.until', { date: until }) }}
          </p>

          <div class="mt-4 grid gap-2" :class="shareable ? 'grid-cols-2' : 'grid-cols-1'">
            <UiButton v-if="shareable" @click="share">
              <UIcon name="i-lucide-share" class="size-5" />
              {{ t('family.invite.share') }}
            </UiButton>
            <UiButton variant="secondary" class="bg-field" data-testid="invite-copy" @click="copy">
              <UIcon
                :name="copied ? 'i-lucide-check' : 'i-lucide-copy'"
                class="size-5"
                :class="{ 'text-success': copied }"
              />
              {{ copied ? t('family.invite.copied') : t('family.invite.copy') }}
            </UiButton>
          </div>

          <div class="mt-4 flex items-start gap-2.5 rounded-xl bg-accent-soft p-3">
            <UIcon name="i-lucide-info" class="mt-px size-4.5 shrink-0 text-accent" />
            <p class="text-[13px] font-medium text-text">
              {{ t('family.invite.once') }}
            </p>
          </div>

          <button
            class="mt-2 h-12 w-full text-[15px] font-semibold text-danger disabled:opacity-50"
            type="button"
            :disabled="isRevoking"
            @click="revoke"
          >
            {{ t('family.invite.revoke') }}
          </button>
        </template>

        <div v-else class="flex h-40 items-center justify-center">
          <UIcon name="i-heroicons-arrow-path" class="size-6 animate-spin text-text-mute" />
        </div>
      </div>

      <div v-else key="active" class="flex flex-col">
        <FamilySheetHead
          icon="i-lucide-clock"
          tone="warning"
          :title="t('family.invite.activeTitle')"
          :sub="t('family.invite.activeSub', { date: until })"
        />

        <div class="mt-5 flex items-start gap-2.5 rounded-xl bg-accent-soft p-3">
          <UIcon name="i-lucide-info" class="mt-px size-4.5 shrink-0 text-accent" />
          <p class="text-[13px] font-medium text-text">
            {{ t('family.invite.activeNote') }}
          </p>
        </div>

        <UiButton variant="secondary" class="mt-5 w-full bg-field" :loading="isBusy" @click="create">
          <UIcon name="i-lucide-refresh-cw" class="size-5" />
          {{ t('family.invite.renew') }}
        </UiButton>
        <p class="mt-2 text-center text-[13px] text-text-mute">
          {{ t('family.invite.renewHint') }}
        </p>

        <button
          class="mt-2 h-12 w-full text-[15px] font-semibold text-danger disabled:opacity-50"
          type="button"
          :disabled="isRevoking"
          @click="revoke"
        >
          {{ t('family.invite.revoke') }}
        </button>
      </div>
    </Transition>
  </UiSheet>
</template>
