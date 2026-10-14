import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { buildFixture, createTestContext, loadFixture } from '@nuxt/test-utils/e2e'

createTestContext({
  rootDir: fileURLToPath(new URL('../..', import.meta.url)),
  buildDir: process.argv[2],
  nuxtConfig: {
    routeRules: { '/': { prerender: false } },
    nitro: { prerender: { crawlLinks: false, routes: [], ignore: ['/'] } }
  }
})

async function build() {
  await loadFixture()
  await buildFixture()
}

build().then(() => process.exit(0), (error) => {
  console.error(error)
  process.exit(1)
})
