import type { InstanceInfo } from '~~/shared/types'
import { useQuery } from '@tanstack/vue-query'
import { pendingInvite } from '~/utils/family'
import { queryKeys } from './queryKeys'

export function useInstanceQuery() {
  return useQuery({
    queryKey: queryKeys.instance(),
    queryFn: () => $fetch<InstanceInfo>('/api/auth/instance'),
    staleTime: Infinity
  })
}

export function useRegistration() {
  const query = useInstanceQuery()
  const invite = ref<string>()

  onMounted(() => {
    invite.value = pendingInvite()
  })

  const canRegister = computed(() => query.data.value?.registration !== false || Boolean(invite.value))

  return { ...query, invite, canRegister }
}
