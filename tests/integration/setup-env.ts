import process from 'node:process'
import { fileURLToPath } from 'node:url'

// setupFiles выполняется в каждом воркере ДО setup() из @nuxt/test-utils.
// Грузим .env.test здесь, чтобы и тестовый prisma-клиент, и порождённый
// Nitro-сервер (наследует process.env воркера) смотрели в тестовую БД.
process.loadEnvFile(fileURLToPath(new URL('../../.env.test', import.meta.url)))
