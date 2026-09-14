import process from 'node:process'
import { defineConfig, devices } from '@playwright/test'

const PORT = 3100
const baseURL = `http://localhost:${PORT}`

export default defineConfig({
  testDir: './tests/e2e',
  globalSetup: './tests/e2e/global-setup.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'html',
  use: {
    baseURL,
    trace: 'on-first-retry'
  },
  projects: [
    {
      name: 'Mobile Chrome',
      use: {
        ...devices['Pixel 5']
      }
    }
  ],
  webServer: {
    command: `pnpm dev --dotenv .env.test --port ${PORT}`,
    url: baseURL,
    timeout: 180 * 1000,
    reuseExistingServer: false
  }
})
