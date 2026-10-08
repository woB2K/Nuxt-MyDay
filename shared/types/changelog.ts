import type { z } from 'zod'
import type { changeTypeSchema, localizedTextSchema, releaseSchema } from '../schemas/changelog'

export type ChangeType = z.infer<typeof changeTypeSchema>
export type LocalizedText = z.infer<typeof localizedTextSchema>
export type Release = z.infer<typeof releaseSchema>
