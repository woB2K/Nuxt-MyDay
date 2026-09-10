import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UiSwipeRow from '../../../app/components/ui/UiSwipeRow.vue'

const THRESHOLD = 90

function mountRow(props: Record<string, unknown> = {}) {
  return mount(UiSwipeRow, {
    props,
    slots: { default: '<div>row</div>' },
    global: { stubs: { UIcon: true } }
  })
}

async function swipe(wrapper: ReturnType<typeof mountRow>, dx: number, dy = 0) {
  const content = wrapper.find('.touch-pan-y')
  await content.trigger('pointerdown', { clientX: 0, clientY: 0 })
  await content.trigger('pointermove', { clientX: dx, clientY: dy })
  await content.trigger('pointerup')
}

describe('uiSwipeRow', () => {
  it('удаляет свайпом влево за порог', async () => {
    const wrapper = mountRow()

    await swipe(wrapper, -(THRESHOLD + 10))

    expect(wrapper.emitted('delete')).toHaveLength(1)
  })

  it('не удаляет, если свайп не дошёл до порога', async () => {
    const wrapper = mountRow()

    await swipe(wrapper, -(THRESHOLD - 10))

    expect(wrapper.emitted('delete')).toBeUndefined()
  })

  it('игнорирует вертикальный жест — это скролл списка', async () => {
    const wrapper = mountRow()

    await swipe(wrapper, -(THRESHOLD + 10), -200)

    expect(wrapper.emitted('delete')).toBeUndefined()
  })

  it('без правого действия свайп вправо ничего не эмитит', async () => {
    const wrapper = mountRow()

    await swipe(wrapper, THRESHOLD + 10)

    expect(wrapper.emitted('complete')).toBeUndefined()
  })

  it('с rightAction свайп вправо за порог эмитит complete', async () => {
    const wrapper = mountRow({
      rightAction: { label: 'Edit', icon: 'i-lucide-pencil' }
    })

    await swipe(wrapper, THRESHOLD + 10)

    expect(wrapper.emitted('complete')).toHaveLength(1)
  })

  it('не удаляет, когда deletable выключен', async () => {
    const wrapper = mountRow({ deletable: false })

    await swipe(wrapper, -(THRESHOLD + 10))

    expect(wrapper.emitted('delete')).toBeUndefined()
  })
})
