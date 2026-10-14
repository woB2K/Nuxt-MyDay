import type { TestProject } from 'vitest/node'
import { execSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { rm } from 'node:fs/promises'
import { resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { createTestContext, startServer, stopServer } from '@nuxt/test-utils/e2e'

declare module 'vitest' {
  export interface ProvidedContext {
    apiUrl: string
  }
}

const rootDir = fileURLToPath(new URL('../..', import.meta.url))
const buildDir = resolve(rootDir, '.nuxt/test/api')
const outputDir = resolve(buildDir, 'output')

// globalSetup выполняется один раз в главном процессе (без setupFiles),
// поэтому env грузим повторно. Накатываем схему на тестовую БД — чтобы
// прогон работал на свежем контейнере без ручного migrate.
//
// Прод-билд Nuxt собирается один раз на весь прогон, отдельным процессом:
// setup() в каждом файле собирал бы приложение заново (8 файлов — 8 сборок),
// а buildNuxt внутри главного процесса vitest не возвращает управление.
// Файлы подключаются к общему серверу через setupApi() из helpers.ts.
export default async function setup(project: TestProject) {
  process.loadEnvFile(resolve(rootDir, '.env.test'))
  execSync('pnpm prisma migrate deploy', { stdio: 'inherit', env: process.env })
  execSync(`pnpm exec tsx tests/integration/build-api.ts ${buildDir}`, { stdio: 'inherit', cwd: rootDir, env: process.env })

  if (!existsSync(resolve(outputDir, 'server/index.mjs'))) throw new Error(`Nuxt build is missing in ${outputDir}`)

  const ctx = createTestContext({ rootDir, build: false, nuxtConfig: { nitro: { output: { dir: outputDir } } } })

  await startServer(ctx.options.env)

  project.provide('apiUrl', ctx.url!)

  return async () => {
    await stopServer()
    await rm(buildDir, { recursive: true, force: true })
  }
}
