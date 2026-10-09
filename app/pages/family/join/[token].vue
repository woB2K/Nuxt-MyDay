<script lang="ts" setup>
import { clearPendingInvite, joinStateOf } from '~/utils/family'
import { statusOf } from '~/utils/httpStatus'

definePageMeta({ layout: 'auth' })

const { t } = useI18n()
const route = useRoute()
const toast = useAppToast()

const token = computed(() => String(route.params.token ?? ''))

const { data: preview, error, refetch } = useInvitePreviewQuery(token)
const { members, me, myId } = useFamily()
const { mutate: join, isPending: isJoining } = useJoinHouseholdMutation()

const joined = ref(false)

const state = computed(() => joinStateOf(preview.value, error.value))

onMounted(clearPendingInvite)

function confirm() {
  join(token.value, {
    onSuccess: () => {
      joined.value = true
    },
    onError: (joinError) => {
      if (statusOf(joinError) === 409) {
        toast.error(t('toast.family.joinConflict'))
        refetch()
        return
      }

      toast.error(t('toast.family.joinError'))
    }
  })
}

async function openFinance() {
  await navigateTo('/finance')
  toast.success(t('family.success.toast'))
}

function primary() {
  if (state.value === 'invalid') return navigateTo('/today')
  return navigateTo('/settings/family')
}
</script>

<template>
  <div class="flex flex-1 flex-col">
    <JoinSuccess
      v-if="joined"
      :members="members"
      :my-id="myId"
      @open="openFinance"
    />

    <JoinInvite
      v-else-if="state === 'ok' && preview"
      :preview="preview"
      :my-name="me?.name ?? ''"
      :my-color-index="me?.colorIndex ?? 0"
      :joining="isJoining"
      @join="confirm"
      @cancel="navigateTo('/today')"
    />

    <JoinStatus
      v-else-if="state === 'busy' || state === 'invalid' || state === 'already'"
      :state="state"
      :own="preview?.own"
      :family="members"
      @primary="primary"
      @cancel="navigateTo('/today')"
    />

    <div v-else-if="error" class="flex flex-1 flex-col items-center justify-center gap-4 px-7 text-center">
      <p class="text-[15px] text-text-dim">
        {{ t('general.somethingWrong') }}
      </p>
      <UiButton variant="secondary" size="md" @click="refetch()">
        {{ t('general.retry') }}
      </UiButton>
    </div>

    <div v-else class="flex flex-1 items-center justify-center">
      <UIcon name="i-heroicons-arrow-path" class="size-6 animate-spin text-text-mute" />
    </div>
  </div>
</template>
