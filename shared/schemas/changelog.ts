import { z } from 'zod'

export const semverPattern = /^\d+\.\d+\.\d+$/

export const changeTypeSchema = z.enum(['new', 'improved', 'fixed'])

export const localizedTextSchema = z.object({
  en: z.string().trim().min(1),
  ru: z.string().trim().min(1)
})

export const releaseSchema = z.object({
  version: z.string().regex(semverPattern),
  date: z.iso.date(),
  title: localizedTextSchema.optional(),
  changes: z.array(z.object({
    type: changeTypeSchema,
    text: localizedTextSchema
  })).min(1)
})

export const changelogSchema = z.array(releaseSchema)
