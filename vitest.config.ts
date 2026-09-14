import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    // Интеграционные тесты живут в отдельном конфиге (vitest.integration.config.ts):
    // им нужен реальный сервер + Postgres, а не nuxt/happy-dom окружение.
    // E2E-спеки гоняет Playwright (playwright.config.ts), vitest их не трогает.
    exclude: ['**/node_modules/**', 'tests/integration/**', 'tests/e2e/**'],
    environmentOptions: {
      nuxt: {
        domEnvironment: 'happy-dom'
      }
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['app/**', 'server/**', 'shared/**'],
      exclude: ['**/*.d.ts', 'server/utils/prisma.ts']
    }
  }
})
