import type { ChangeType, Release } from '../../shared/types/changelog'
import { changelogSchema } from '../../shared/schemas/changelog'

export interface Commit {
  hash: string
  subject: string
  body: string
}

export const releasableTypes = ['feat', 'fix', 'perf']

const subjectPattern = /^(\w+)(?:\([^)]*\))?(!)?:/

export function commitType(subject: string): string | null {
  return subjectPattern.exec(subject)?.[1] ?? null
}

export function isBreaking(commit: Commit): boolean {
  return subjectPattern.exec(commit.subject)?.[2] === '!' || /^BREAKING[ -]CHANGE:/m.test(commit.body)
}

export function releasableCommits(commits: Commit[]): Commit[] {
  return commits.filter(commit => releasableTypes.includes(commitType(commit.subject) ?? ''))
}

export function parseVersion(version: string): [number, number, number] {
  const match = /^v?(\d+)\.(\d+)\.(\d+)$/.exec(version)
  if (!match) throw new Error(`Not a semver version: ${version}`)

  return [Number(match[1]), Number(match[2]), Number(match[3])]
}

export function compareVersions(a: string, b: string): number {
  const left = parseVersion(a)
  const right = parseVersion(b)

  for (let i = 0; i < 3; i++) {
    if (left[i] !== right[i]) return left[i]! - right[i]!
  }

  return 0
}

export function nextVersion(current: string, commits: Commit[]): string | null {
  const releasable = releasableCommits(commits)
  if (releasable.length === 0) return null

  const [major, minor, patch] = parseVersion(current)

  if (major > 0 && releasable.some(isBreaking)) return `${major + 1}.0.0`
  if (releasable.some(commit => commitType(commit.subject) === 'feat')) return `${major}.${minor + 1}.0`

  return `${major}.${minor}.${patch + 1}`
}

interface CheckInput {
  lastTag: string | null
  version: string
  commits: Commit[]
  changelog: unknown
}

export function checkRelease({ lastTag, version, commits, changelog }: CheckInput): string[] {
  const parsed = changelogSchema.safeParse(changelog)
  if (!parsed.success) return [`shared/changelog.ts is invalid: ${parsed.error.message}`]

  const errors: string[] = []
  const releases = parsed.data
  const versions = releases.map(release => release.version)

  if (new Set(versions).size !== versions.length) errors.push('shared/changelog.ts has duplicate versions')

  if (versions.some((value, i) => i > 0 && compareVersions(versions[i - 1]!, value) <= 0)) {
    errors.push('shared/changelog.ts must list releases from newest to oldest')
  }

  if (releasableCommits(commits).length === 0) return errors

  if (lastTag && compareVersions(version, lastTag) <= 0) {
    errors.push(`package.json version ${version} is not newer than ${lastTag}: there are feat/fix/perf commits since the last release, run /release`)
  }

  if (versions[0] !== version) {
    errors.push(`shared/changelog.ts has no entry for ${version} on top: run /release`)
  }

  return errors
}

const typeLabels: Record<'en' | 'ru', Record<ChangeType, string>> = {
  en: { new: 'New', improved: 'Improved', fixed: 'Fixed' },
  ru: { new: 'Новое', improved: 'Улучшено', fixed: 'Исправлено' }
}

const languageTitles = { en: 'English', ru: 'Русский' }

export function renderNotes(release: Release): string {
  const sections = (['en', 'ru'] as const).map((lang) => {
    const heading = release.title ? `### ${languageTitles[lang]} — ${release.title[lang]}` : `### ${languageTitles[lang]}`
    const lines = release.changes.map(change => `- **${typeLabels[lang][change.type]}:** ${change.text[lang]}`)

    return [heading, '', ...lines].join('\n')
  })

  return `${sections.join('\n\n')}\n`
}
