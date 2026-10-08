import { describe, expect, it } from 'vitest'
import pkg from '../../../package.json'
import { changelog } from '../../../shared/changelog'
import { changelogSchema, releaseSchema } from '../../../shared/schemas'

describe('changelogSchema', () => {
  it('отвергает версию не по semver, кривую дату и пустой список изменений', () => {
    const valid = {
      version: '1.1.0',
      date: '2026-10-08',
      changes: [{ type: 'fixed', text: { en: 'A', ru: 'Б' } }]
    }

    expect(releaseSchema.safeParse(valid).success).toBe(true)
    expect(releaseSchema.safeParse({ ...valid, version: 'v1.1' }).success).toBe(false)
    expect(releaseSchema.safeParse({ ...valid, date: '08.10.2026' }).success).toBe(false)
    expect(releaseSchema.safeParse({ ...valid, changes: [] }).success).toBe(false)
  })

  it('требует текст на обоих языках', () => {
    expect(releaseSchema.safeParse({
      version: '1.1.0',
      date: '2026-10-08',
      changes: [{ type: 'new', text: { en: 'Only English', ru: ' ' } }]
    }).success).toBe(false)
  })
})

describe('shared/changelog.ts', () => {
  it('проходит схему', () => {
    expect(changelogSchema.safeParse(changelog).success).toBe(true)
  })

  it('сверху лежит запись для версии из package.json', () => {
    expect(changelog[0]?.version).toBe(pkg.version)
  })
})
