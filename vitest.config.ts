import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    // Интеграционные тесты живут в отдельном конфиге (vitest.integration.config.ts):
    // им нужен реальный сервер + Postgres, а не nuxt/happy-dom окружение.
    exclude: ['**/node_modules/**', 'tests/integration/**'],
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
