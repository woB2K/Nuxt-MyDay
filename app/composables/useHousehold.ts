import type { QueryClient } from '@tanstack/vue-query'
import type { GuestInvitePreviewResponse, HouseholdResponse, InviteCreatedResponse, InvitePreviewResponse } from '~~/shared/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { authorOf, othersOf } from '~/utils/family'
import { queryKeys } from './queryKeys'
import { useApi } from './useApi'

const FAMILY_SCOPED_KEYS = ['household', 'transactions', 'summary', 'savings', 'budgets', 'categories', 'trash']

function resetFamilyScope(queryClient: QueryClient) {
  return Promise.all(FAMILY_SCOPED_KEYS.map(key => queryClient.resetQueries({ queryKey: [key] })))
}

export function useHouseholdQuery() {
  const api = useApi()

  return useQuery({
    queryKey: queryKeys.household(),
    queryFn: () => api<HouseholdResponse>('/api/household')
  })
}

export function useFamily() {
  const authStore = useAuthStore()
  const query = useHouseholdQuery()

  const myId = computed(() => authStore.user?.id)
  const members = computed(() => query.data.value?.members ?? [])
  const me = computed(() => members.value.find(member => member.userId === myId.value))
  const others = computed(() => othersOf(members.value, myId.value))
  const isFamily = computed(() => members.value.length > 1)
  const isOwner = computed(() => query.data.value?.role === 'OWNER')

  function authorFor(userId: string) {
    return authorOf(members.value, myId.value, userId)
  }

  return { ...query, myId, members, me, others, isFamily, isOwner, authorFor }
}

export function useInvitePreviewQuery(token: Ref<string>) {
  const api = useApi()

  return useQuery({
    queryKey: computed(() => queryKeys.invitePreview(token.value)),
    queryFn: () => api<InvitePreviewResponse>('/api/household/join', { query: { token: token.value } }),
    retry: false,
    staleTime: 0
  })
}

export function useGuestInviteQuery(token: Ref<string | undefined>) {
  return useQuery({
    queryKey: computed(() => queryKeys.guestInvite(token.value ?? '')),
    queryFn: () => $fetch<GuestInvitePreviewResponse>('/api/auth/invite', { query: { token: token.value } }),
    enabled: computed(() => Boolean(token.value)),
    retry: false
  })
}

export function useUpdateHouseholdMutation() {
  const api = useApi()
  const queryClient = useQueryClient()
  const { t } = useI18n()
  const toast = useAppToast()

  return useMutation({
    mutationFn: (shareSavings: boolean) =>
      api<HouseholdResponse>('/api/household', { method: 'PATCH', body: { shareSavings } }),
    onSuccess: (household) => {
      queryClient.setQueryData(queryKeys.household(), household)
      queryClient.invalidateQueries({ queryKey: ['savings'] })
    },
    onError: () => toast.error(t('toast.family.updateError'))
  })
}

export function useCreateInviteMutation() {
  const api = useApi()
  const queryClient = useQueryClient()
  const { t } = useI18n()
  const toast = useAppToast()

  return useMutation({
    mutationFn: () => api<InviteCreatedResponse>('/api/household/invite', { method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.household() }),
    onError: () => toast.error(t('toast.family.inviteError'))
  })
}

export function useRevokeInviteMutation() {
  const api = useApi()
  const queryClient = useQueryClient()
  const { t } = useI18n()
  const toast = useAppToast()

  return useMutation({
    mutationFn: () => api('/api/household/invite', { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.setQueryData<HouseholdResponse>(queryKeys.household(), household => household && { ...household, invite: null })
      queryClient.invalidateQueries({ queryKey: queryKeys.household() })
      toast.info(t('family.invite.revoked'))
    },
    onError: () => toast.error(t('toast.family.revokeError'))
  })
}

export function useJoinHouseholdMutation() {
  const api = useApi()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (token: string) => api<HouseholdResponse>('/api/household/join', { method: 'POST', body: { token } }),
    onSuccess: () => resetFamilyScope(queryClient)
  })
}

export function useLeaveHouseholdMutation() {
  const api = useApi()
  const queryClient = useQueryClient()
  const { t } = useI18n()
  const toast = useAppToast()

  return useMutation({
    mutationFn: () => api<HouseholdResponse>('/api/household/leave', { method: 'POST' }),
    onSuccess: async () => {
      await resetFamilyScope(queryClient)
      toast.success(t('family.leave.done'))
    },
    onError: () => toast.error(t('toast.family.leaveError'))
  })
}

export function useRemoveMemberMutation() {
  const api = useApi()
  const queryClient = useQueryClient()
  const { t } = useI18n()
  const toast = useAppToast()

  return useMutation({
    mutationFn: ({ userId }: { userId: string, name: string }) =>
      api<HouseholdResponse>(`/api/household/members/${userId}`, { method: 'DELETE' }),
    onSuccess: (household, { name }) => {
      queryClient.setQueryData(queryKeys.household(), household)
      queryClient.invalidateQueries({ queryKey: ['savings'] })
      toast.success(t('family.remove.done', { name }))
    },
    onError: () => toast.error(t('toast.family.removeError'))
  })
}

export function useTransferOwnershipMutation() {
  const api = useApi()
  const queryClient = useQueryClient()
  const { t } = useI18n()
  const toast = useAppToast()

  return useMutation({
    mutationFn: ({ userId }: { userId: string, name: string }) =>
      api<HouseholdResponse>(`/api/household/members/${userId}`, { method: 'PATCH', body: { role: 'OWNER' } }),
    onSuccess: (household, { name }) => {
      queryClient.setQueryData(queryKeys.household(), household)
      toast.success(t('family.transfer.done', { name }))
    },
    onError: () => toast.error(t('toast.family.transferError'))
  })
}

export function useDismissNoticeMutation() {
  const api = useApi()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => api('/api/household/notice', { method: 'DELETE' }),
    onMutate: () => {
      queryClient.setQueryData<HouseholdResponse>(queryKeys.household(), household => household && { ...household, removedNotice: false })
    }
  })
}
