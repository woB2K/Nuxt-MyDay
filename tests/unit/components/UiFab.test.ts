import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import UiFab from '../../../app/components/ui/UiFab.vue'
import { useUiStore } from '../../../app/stores/ui'

beforeEach(() => {
  setActivePinia(createPinia())
})

function mountFab() {
  return mount(UiFab, { global: { stubs: { UIcon: true } } })
}

describe('uiFab', () => {
  it('без тостов стоит на месте', () => {
    expect(mountFab().attributes('style')).toBeUndefined()
  })

  it('поднимается над стеком тостов', async () => {
    const wrapper = mountFab()

    useUiStore().toastStackHeight = 56
    await wrapper.vm.$nextTick()

    expect(wrapper.attributes('style')).toContain('translateY(calc(-56px - 0.75rem))')
  })

  it('возвращается, когда тосты закрылись', async () => {
    const wrapper = mountFab()
    const uiStore = useUiStore()

    uiStore.toastStackHeight = 56
    await wrapper.vm.$nextTick()
    uiStore.toastStackHeight = 0
    await wrapper.vm.$nextTick()

    expect(wrapper.attributes('style')).toBeUndefined()
  })
})
