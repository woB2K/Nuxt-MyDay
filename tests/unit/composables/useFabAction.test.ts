import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import { provideFabAction, useFabAction } from '../../../app/composables/useFabAction'

const Page = defineComponent({
  props: { onFab: { type: Function, required: true } },
  setup(props) {
    useFabAction(() => (props.onFab as () => void)())

    return () => h('div')
  }
})

function mountLayout() {
  let action: ReturnType<typeof provideFabAction>

  const wrapper = mount(defineComponent({
    props: { page: { type: String, default: 'a' }, calls: { type: Array, required: true } },
    setup(props) {
      action = provideFabAction()

      return () => h(Page, {
        key: props.page,
        onFab: () => (props.calls as string[]).push(props.page)
      })
    }
  }), { props: { calls: [] } })

  return { wrapper, fab: () => action!.value }
}

describe('useFabAction', () => {
  it('регистрирует действие страницы', async () => {
    const calls: string[] = []
    const { wrapper, fab } = mountLayout()
    await wrapper.setProps({ calls })
    await nextTick()

    fab()?.()

    expect(calls).toEqual(['a'])
  })

  it('не теряет действие, когда новая страница монтируется раньше размонтирования старой', async () => {
    const calls: string[] = []
    const { wrapper, fab } = mountLayout()
    await wrapper.setProps({ calls })

    await wrapper.setProps({ page: 'b' })
    await nextTick()

    expect(fab(), 'действие затёрто уходящей страницей').not.toBeNull()

    fab()?.()

    expect(calls).toEqual(['b'])
  })

  it('снимает действие, когда страница ушла и её никто не сменил', async () => {
    const { wrapper, fab } = mountLayout()
    await wrapper.setProps({ calls: [] })
    await nextTick()

    wrapper.unmount()

    expect(fab()).toBeNull()
  })
})
