import { describe, expect, it } from 'vitest'
import { normalizeTags } from '../../../server/utils/mapper'

const makeTag = (id: string) => ({ id, name: `tag-${id}`, color: null })

describe('normalizeTags', () => {
  it('unwraps join-table structure into flat tag array', () => {
    const tagA = makeTag('a')
    const tagB = makeTag('b')
    const input = {
      id: 'task-1',
      title: 'Buy milk',
      tags: [
        { taskId: 'task-1', tagId: 'a', tag: tagA },
        { taskId: 'task-1', tagId: 'b', tag: tagB }
      ]
    }

    const result = normalizeTags(input)

    expect(result.tags).toEqual([tagA, tagB])
  })

  it('preserves all non-tags fields', () => {
    const input = {
      id: 'task-1',
      title: 'Buy milk',
      done: false,
      priority: 'HIGH',
      tags: []
    }

    const result = normalizeTags(input)

    expect(result.id).toBe('task-1')
    expect(result.title).toBe('Buy milk')
    expect(result.done).toBe(false)
    expect(result.priority).toBe('HIGH')
  })

  it('returns empty tags array when there are no tags', () => {
    const input = { id: 'task-2', title: 'Empty', tags: [] }

    const result = normalizeTags(input)

    expect(result.tags).toEqual([])
  })

  it('works with TaskTemplate join structure', () => {
    const tag = makeTag('x')
    const input = {
      id: 'tpl-1',
      title: 'Weekly review',
      tags: [{ templateId: 'tpl-1', tagId: 'x', tag }]
    }

    const result = normalizeTags(input)

    expect(result.tags).toEqual([tag])
  })

  it('does not mutate the original object', () => {
    const originalTags = [{ taskId: 'task-1', tagId: 'a', tag: makeTag('a') }]
    const input = { id: 'task-1', title: 'Test', tags: originalTags }

    normalizeTags(input)

    expect(input.tags).toBe(originalTags)
  })
})
