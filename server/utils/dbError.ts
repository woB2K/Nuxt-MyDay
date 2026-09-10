import { createError } from 'h3'

const MISSING_RECORD = 'P2025'
const UNIQUE_VIOLATION = 'P2002'

function hasCode(error: unknown, code: string): boolean {
  return typeof error === 'object' && error !== null && (error as { code?: unknown }).code === code
}

export async function orNotFound<T>(query: Promise<T>, message: string): Promise<T> {
  try {
    return await query
  } catch (error) {
    if (hasCode(error, MISSING_RECORD)) throw createError({ statusCode: 404, message })
    throw error
  }
}

export async function orConflict<T>(query: Promise<T>, message: string): Promise<T> {
  try {
    return await query
  } catch (error) {
    if (hasCode(error, UNIQUE_VIOLATION)) throw createError({ statusCode: 409, message })
    throw error
  }
}
