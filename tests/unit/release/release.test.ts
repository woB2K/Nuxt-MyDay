import type { Commit } from '../../../scripts/release/release'
import type { Release } from '../../../shared/types'
import { describe, expect, it } from 'vitest'
import {
  checkRelease,
  commitType,
  compareVersions,
  nextVersion,
  releasableCommits,
  releaseName,
  renderNotes
} from '../../../scripts/release/release'

function commit(subject: string, body = ''): Commit {
  return { hash: 'abc1234', subject, body }
}

function release(version: string, overrides: Partial<Release> = {}): Release {
  return {
    version,
    date: '2026-10-08',
    changes: [{ type: 'new', text: { en: 'Something', ru: 'Что-то' } }],
    ...overrides
  }
}

describe('commitType', () => {
  it('достаёт тип со скоупом, без скоупа и с восклицательным знаком', () => {
    expect(commitType('feat(savings): opening balance')).toBe('feat')
    expect(commitType('fix: drop quoted restart policy')).toBe('fix')
    expect(commitType('feat(api)!: rename endpoint')).toBe('feat')
  })

  it('не считает типом произвольный заголовок', () => {
    expect(commitType('Release v1.0 — "Day One"')).toBeNull()
    expect(commitType('Merge branch dev')).toBeNull()
  })
})

describe('releasableCommits', () => {
  it('оставляет только feat, fix и perf', () => {
    const commits = [
      commit('feat(tasks): search'),
      commit('fix(ui): date picker'),
      commit('perf(finance): faster summary'),
      commit('docs(roadmap): close phase 6'),
      commit('refactor(ui): optional title'),
      commit('chore(release): v1.1.0')
    ]

    expect(releasableCommits(commits).map(c => c.subject)).toEqual([
      'feat(tasks): search',
      'fix(ui): date picker',
      'perf(finance): faster summary'
    ])
  })
})

describe('compareVersions', () => {
  it('сравнивает по числам, а не по строкам, и принимает префикс v', () => {
    expect(compareVersions('1.10.0', '1.9.0')).toBeGreaterThan(0)
    expect(compareVersions('v1.0.0', '1.0.0')).toBe(0)
    expect(compareVersions('1.0.1', 'v2.0.0')).toBeLessThan(0)
  })
})

describe('nextVersion', () => {
  it('feat поднимает minor, одни фиксы — patch', () => {
    expect(nextVersion('v1.0.0', [commit('fix: a'), commit('feat: b')])).toBe('1.1.0')
    expect(nextVersion('v1.2.3', [commit('fix: a'), commit('perf: b')])).toBe('1.2.4')
  })

  it('breaking change поднимает major', () => {
    expect(nextVersion('v1.4.2', [commit('feat(api)!: rename')])).toBe('2.0.0')
    expect(nextVersion('v1.4.2', [commit('fix: a', 'BREAKING CHANGE: drops old tokens')])).toBe('2.0.0')
  })

  it('без релизных коммитов релиза нет', () => {
    expect(nextVersion('v1.0.0', [commit('docs: a'), commit('chore: b')])).toBeNull()
  })
})

describe('checkRelease', () => {
  it('пропускает, если с тега были только служебные коммиты', () => {
    expect(checkRelease({
      lastTag: 'v1.0.0',
      version: '1.0.0',
      commits: [commit('docs: a'), commit('refactor: b')],
      changelog: [release('1.0.0')]
    })).toEqual([])
  })

  it('пропускает, когда версия поднята и запись наверху', () => {
    expect(checkRelease({
      lastTag: 'v1.0.0',
      version: '1.1.0',
      commits: [commit('feat: a')],
      changelog: [release('1.1.0', { title: { en: 'Savings Day', ru: 'День накоплений' } }), release('1.0.0')]
    })).toEqual([])
  })

  it('требует название у minor и major, но не у патча', () => {
    expect(checkRelease({
      lastTag: 'v1.0.0',
      version: '1.1.0',
      commits: [commit('feat: a')],
      changelog: [release('1.1.0'), release('1.0.0')]
    })).toEqual(['shared/changelog.ts entry for 1.1.0 needs a title: minor and major releases are named'])

    expect(checkRelease({
      lastTag: 'v1.1.0',
      version: '1.1.1',
      commits: [commit('fix: a')],
      changelog: [release('1.1.1'), release('1.1.0')]
    })).toEqual([])
  })

  it('ругается, если фичи есть, а версия не поднята', () => {
    const errors = checkRelease({
      lastTag: 'v1.0.0',
      version: '1.0.0',
      commits: [commit('fix: a')],
      changelog: [release('1.0.0')]
    })

    expect(errors).toHaveLength(1)
    expect(errors[0]).toContain('not newer than v1.0.0')
  })

  it('ругается, если версия поднята, а записи нет', () => {
    const errors = checkRelease({
      lastTag: 'v1.0.0',
      version: '1.1.0',
      commits: [commit('feat: a')],
      changelog: [release('1.0.0')]
    })

    expect(errors).toEqual(['shared/changelog.ts has no entry for 1.1.0 on top: run /release'])
  })

  it('ловит битую запись, дубли и неправильный порядок', () => {
    expect(checkRelease({
      lastTag: null,
      version: '1.0.0',
      commits: [],
      changelog: [{ version: '1.0', date: '2026-10-08', changes: [] }]
    })[0]).toContain('invalid')

    expect(checkRelease({
      lastTag: null,
      version: '1.1.0',
      commits: [],
      changelog: [release('1.0.0'), release('1.1.0'), release('1.1.0')]
    })).toEqual([
      'shared/changelog.ts has duplicate versions',
      'shared/changelog.ts must list releases from newest to oldest'
    ])
  })
})

describe('releaseName', () => {
  it('добавляет к версии английское название, если оно есть', () => {
    expect(releaseName(release('1.2.0', { title: { en: 'No-Loss Day', ru: 'День без потерь' } }))).toBe('v1.2.0 — No-Loss Day')
    expect(releaseName(release('1.1.1'))).toBe('v1.1.1')
  })
})

describe('renderNotes', () => {
  it('собирает markdown на двух языках с подписями типов', () => {
    const notes = renderNotes(release('1.1.0', {
      title: { en: 'Savings', ru: 'Накопления' },
      changes: [
        { type: 'new', text: { en: 'Opening balance', ru: 'Начальный остаток' } },
        { type: 'fixed', text: { en: 'Amounts are grouped', ru: 'Суммы группируются' } }
      ]
    }))

    expect(notes).toContain('### English — Savings')
    expect(notes).toContain('- **New:** Opening balance')
    expect(notes).toContain('### Русский — Накопления')
    expect(notes).toContain('- **Исправлено:** Суммы группируются')
  })
})
