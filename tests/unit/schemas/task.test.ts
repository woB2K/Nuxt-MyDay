import { describe, expect, it } from 'vitest'
import { createTaskSchema, updateTaskSchema } from '../../../shared/schemas/task'

describe('createTaskSchema', () => {
  it('accepts minimal valid input', () => {
    const result = createTaskSchema.safeParse({ title: 'Buy milk' })
    expect(result.success).toBe(true)
  })

  it('defaults priority to NONE', () => {
    const result = createTaskSchema.safeParse({ title: 'Buy milk' })
    expect(result.success).toBe(true)
    expect(result.data?.priority).toBe('NONE')
  })

  it('rejects empty title', () => {
    const result = createTaskSchema.safeParse({ title: '' })
    expect(result.success).toBe(false)
  })

  it('rejects missing title', () => {
    const result = createTaskSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it('accepts valid priority values', () => {
    for (const priority of ['HIGH', 'MEDIUM', 'LOW', 'NONE']) {
      const result = createTaskSchema.safeParse({ title: 'Task', priority })
      expect(result.success).toBe(true)
    }
  })

  it('rejects invalid priority', () => {
    const result = createTaskSchema.safeParse({ title: 'Task', priority: 'URGENT' })
    expect(result.success).toBe(false)
  })

  it('accepts valid ISO datetime for dueDate', () => {
    const result = createTaskSchema.safeParse({
      title: 'Task',
      dueDate: '2026-05-08T00:00:00.000Z'
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid dueDate format', () => {
    const result = createTaskSchema.safeParse({ title: 'Task', dueDate: '2026-05-08' })
    expect(result.success).toBe(false)
  })

  it('accepts tagIds array', () => {
    const result = createTaskSchema.safeParse({
      title: 'Task',
      tagIds: ['clx1', 'clx2']
    })
    expect(result.success).toBe(true)
  })

  it('accepts task without tagIds', () => {
    const result = createTaskSchema.safeParse({ title: 'Task' })
    expect(result.success).toBe(true)
    expect(result.data?.tagIds).toBeUndefined()
  })
})

describe('updateTaskSchema', () => {
  it('accepts empty object (all fields optional)', () => {
    const result = updateTaskSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('accepts partial update', () => {
    const result = updateTaskSchema.safeParse({ title: 'Updated title' })
    expect(result.success).toBe(true)
  })

  it('still rejects empty title if provided', () => {
    const result = updateTaskSchema.safeParse({ title: '' })
    expect(result.success).toBe(false)
  })
})
