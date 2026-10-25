import { useQuery } from '@tanstack/vue-query'
import { pendingInvite } from '~/utils/family'
import { queryKeys } from './queryKeys'

export function useRegistration() {
  const query = useQuery({
    queryKey: queryKeys.registration(),
    queryFn: () => $fetch<{ open: boolean }>('/api/auth/registration'),
    staleTime: Infinity
  })

  const invite = ref<string>()

  onMounted(() => {
    invite.value = pendingInvite()
  })

  const canRegister = computed(() => query.data.value?.open !== false || Boolean(invite.value))

  return { ...query, invite, canRegister }
}
