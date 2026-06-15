import { defineConfig } from 'vitest/config'

// Отдельный конфиг для интеграционных тестов: они поднимают реальный
// Nuxt-сервер (@nuxt/test-utils/e2e) и бьют в Postgres из docker-compose.test.yml.
// Не смешиваем с unit (environment: 'nuxt') — здесь нужен чистый node.
export default defineConfig({
  test: {
    include: ['tests/integration/**/*.test.ts'],
    environment: 'node',
    globalSetup: ['tests/integration/global-setup.ts'],
    setupFiles: ['tests/integration/setup-env.ts'],
    // Одна общая БД — параллельные файлы устроят гонки. Гоняем последовательно.
    fileParallelism: false,
    testTimeout: 30_000,
    // Первый setup() собирает прод-билд Nuxt — это долго.
    hookTimeout: 180_000
  }
})
