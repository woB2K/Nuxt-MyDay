import type { InjectionKey, ShallowRef } from 'vue'

export type FabAction = (() => void) | null

export const fabActionKey = Symbol('fabAction') as InjectionKey<ShallowRef<FabAction>>

export function provideFabAction(): ShallowRef<FabAction> {
  const action = shallowRef<FabAction>(null)

  provide(fabActionKey, action)

  return action
}

export function useFabAction(action: () => void): void {
  const current = inject(fabActionKey, null)

  if (!current) return

  onMounted(() => {
    current.value = action
  })

  onUnmounted(() => {
    if (current.value === action) current.value = null
  })
}
