import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import FilterBar from '../../../app/components/features/finance/FilterBar.vue'
import { emptyFilters } from '../../../app/utils/transactionFilters'

const { family } = vi.hoisted(() => ({
  family: {
    myId: { value: 'me' },
    members: { value: [{ userId: 'me', name: 'Максим', colorIndex: 0 }, { userId: 'anya', name: 'Аня', colorIndex: 1 }] },
    isFamily: { value: true }
  }
}))

mockNuxtImport('useI18n', () => () => ({ t: (key: string) => key }))
mockNuxtImport('useFamily', () => () => family)
mockNuxtImport('useFinanceTagsQuery', () => () => ({ data: { value: [] } }))

function authorChip(authorId: string | null) {
  const wrapper = mount(FilterBar, {
    props: { filters: { ...emptyFilters(), authorId } },
    global: {
      stubs: {
        UiPillSelect: true,
        TagFilterSheet: true,
        AuthorFilterSheet: true,
        UiAvatar: { props: ['name'], template: '<i data-avatar>{{ name }}</i>' },
        UIcon: true
      }
    }
  })

  return wrapper.find('[data-testid="filter-author"]')
}

describe('filterBar: чип участника', () => {
  it('без выбора называется «Участники» и без аватара', () => {
    const chip = authorChip(null)

    expect(chip.text()).toBe('family.finance.members')
    expect(chip.find('[data-avatar]').exists()).toBe(false)
  })

  it('свои операции подписывает «Мои», чужие — именем, с аватаром автора', () => {
    const mine = authorChip('me')
    const theirs = authorChip('anya')

    expect(mine.find('[data-avatar]').text()).toBe('Максим')
    expect(mine.text()).toContain('family.finance.mine')
    expect(theirs.find('[data-avatar]').text()).toBe('Аня')
    expect(theirs.text()).toContain('Аня')
  })

  it('ушедшего участника называет бывшим', () => {
    expect(authorChip('gone').text()).toBe('family.formerMember')
  })

  it('прячется вне семьи, но остаётся, пока по нему фильтруют', () => {
    family.isFamily.value = false

    expect(authorChip(null).exists()).toBe(false)
    expect(authorChip('gone').exists()).toBe(true)

    family.isFamily.value = true
  })
})
