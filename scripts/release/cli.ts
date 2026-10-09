import type { Commit } from './release'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import process from 'node:process'
import { changelog } from '../../shared/changelog'
import { checkRelease, nextVersion, releasableCommits, releaseName, renderNotes } from './release'

function git(...args: string[]): string {
  return execFileSync('git', args, { encoding: 'utf8' }).trim()
}

function lastTag(): string | null {
  return git('tag', '--list', 'v[0-9]*.[0-9]*.[0-9]*', '--sort=-v:refname').split('\n')[0] || null
}

function commitsSince(tag: string | null): Commit[] {
  const range = tag ? [`${tag}..HEAD`] : ['HEAD']
  const log = git('log', ...range, '--no-merges', '--format=%H%x1f%s%x1f%b%x1e')

  return log.split('\x1E').map(entry => entry.trim()).filter(Boolean).map((entry) => {
    const [hash = '', subject = '', body = ''] = entry.split('\x1F')
    return { hash, subject, body: body.trim() }
  })
}

function packageVersion(): string {
  const pkg = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8')) as { version: string }
  return pkg.version
}

function print(text: string) {
  process.stdout.write(`${text}\n`)
}

function status() {
  const tag = lastTag()
  const version = packageVersion()
  const commits = commitsSince(tag)
  const releasable = releasableCommits(commits)
  const base = tag ?? '0.0.0'

  print(`Last tag: ${tag ?? 'none'}`)
  print(`package.json version: ${version}`)
  print(`Commits since tag: ${commits.length}, releasable: ${releasable.length}`)
  print(`Next version: ${nextVersion(base, commits) ?? 'nothing to release'}`)

  for (const commit of releasable) {
    print(`\n${commit.hash.slice(0, 7)} ${commit.subject}`)
    if (commit.body) print(commit.body.replace(/^/gm, '    '))
  }
}

function check() {
  const tag = lastTag()
  const errors = checkRelease({ lastTag: tag, version: packageVersion(), commits: commitsSince(tag), changelog })

  if (errors.length > 0) {
    for (const error of errors) process.stderr.write(`✗ ${error}\n`)
    process.exit(1)
  }

  print(`✓ changelog is up to date (last tag: ${tag ?? 'none'}, version: ${packageVersion()})`)
}

function findRelease(version: string | undefined) {
  const release = changelog.find(entry => entry.version === version)

  if (!release) {
    process.stderr.write(`No changelog entry for ${version ?? '(no version given)'}\n`)
    process.exit(1)
  }

  return release
}

const [command, argument] = process.argv.slice(2)

if (command === 'status') status()
else if (command === 'check') check()
else if (command === 'notes') process.stdout.write(renderNotes(findRelease(argument)))
else if (command === 'title') print(releaseName(findRelease(argument)))
else {
  process.stderr.write('Usage: tsx scripts/release/cli.ts <status|check|notes VERSION|title VERSION>\n')
  process.exit(1)
}
