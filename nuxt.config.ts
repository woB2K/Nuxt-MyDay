// https://nuxt.com/docs/api/configuration/nuxt-config
import process from 'node:process'
import { apiCacheName } from './app/utils/swCache'
import pkg from './package.json'
import { habitIcons } from './shared/schemas/habit'

let built = false

const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Content-Security-Policy': 'frame-ancestors \'none\'',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Strict-Transport-Security': 'max-age=31536000'
}

const contentSecurityPolicy = [
  'default-src \'self\'',
  'script-src \'self\' \'unsafe-inline\'',
  'style-src \'self\' \'unsafe-inline\'',
  'img-src \'self\' data: blob:',
  'font-src \'self\' data:',
  'connect-src \'self\'',
  'worker-src \'self\'',
  'manifest-src \'self\'',
  'object-src \'none\'',
  'base-uri \'self\'',
  'form-action \'self\'',
  'frame-ancestors \'none\''
].join('; ')

export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@pinia/nuxt',
    '@vite-pwa/nuxt',
    '@nuxtjs/i18n'
  ],

  $development: {
    routeRules: {
      '/**': { headers: securityHeaders }
    }
  },
  ssr: false,
  components: [
    { path: '~/components', pathPrefix: false }
  ],

  devtools: {
    enabled: false
  },

  app: {
    head: {
      link: [
        { rel: 'icon', href: '/favicon.ico', sizes: '48x48' },
        { rel: 'icon', href: '/icon.svg', type: 'image/svg+xml' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' }
      ],
      meta: [
        { name: 'theme-color', content: '#0F0F14' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'apple-mobile-web-app-title', content: 'MyDay' }
      ],
      script: [
        { innerHTML: 'globalThis.__zod_globalConfig = { jitless: true }', tagPosition: 'head' }
      ]
    }
  },
  css: ['~/assets/css/main.css'],
  colorMode: {
    preference: 'dark',
    fallback: 'dark'
  },
  runtimeConfig: {
    jwtAccessSecret: '',
    jwtRefreshSecret: '',
    googleClientId: '',
    googleClientSecret: '',
    passwordHashRounds: 12,
    proxyHops: 1,
    allowRegistration: true,
    demo: false,
    demoEmail: 'anna@example.com',
    demoPassword: 'demo-family',
    clientIpHeader: '',
    public: {
      appUrl: '',
      appVersion: pkg.version
    }
  },

  routeRules: {
    '/': { prerender: true },
    '/**': { headers: { ...securityHeaders, 'Content-Security-Policy': contentSecurityPolicy } }
  },
  future: {
    compatibilityVersion: 4
  },

  compatibilityDate: '2025-01-15',

  vite: {
    optimizeDeps: {
      include: ['@tanstack/vue-query', 'zod']
    }
  },
  hooks: {
    'build:done': () => {
      built = true
    },
    'close': (nuxt) => {
      if (built && !nuxt.options.dev && !nuxt.options.test) process.exit(process.exitCode ?? 0)
    }
  },

  eslint: {
    config: {
      standalone: false,
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  i18n: {
    locales: [
      { code: 'en', language: 'en-US', file: 'en.json', name: 'English' },
      { code: 'ru', language: 'ru-RU', file: 'ru.json', name: 'Русский' }
    ],
    defaultLocale: 'en',
    strategy: 'no_prefix',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_locale',
      redirectOn: 'root'
    }
  },
  icon: {
    provider: 'server',
    fallbackToApi: false,
    serverBundle: { collections: ['lucide'] },
    clientBundle: {
      scan: { globInclude: ['app/**/*.{vue,ts}', 'shared/**/*.ts', 'prisma/seeds/**/*.ts'] },
      icons: habitIcons.map(icon => `lucide:${icon}`),
      sizeLimitKb: 512
    }
  },

  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      id: '/today',
      name: 'MyDay — tasks & finances',
      short_name: 'MyDay',
      description: 'Tasks & finances, one place',
      lang: 'en',
      start_url: '/today',
      scope: '/',
      display: 'standalone',
      orientation: 'portrait',
      theme_color: '#0F0F14',
      background_color: '#0F0F14',
      icons: [
        { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
        { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
        { src: '/maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
      ]
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,json}'],
      navigateFallback: '/',
      navigateFallbackDenylist: [/^\/api\//],
      cleanupOutdatedCaches: true,
      importScripts: ['/sw-outbox.js'],
      runtimeCaching: [
        {
          urlPattern: ({ url, sameOrigin }) => sameOrigin && url.pathname.startsWith('/api/') && !url.pathname.startsWith('/api/auth/'),
          handler: 'NetworkFirst',
          method: 'GET',
          options: {
            cacheName: apiCacheName,
            networkTimeoutSeconds: 5,
            expiration: { maxEntries: 64, maxAgeSeconds: 60 * 60 * 24 },
            cacheableResponse: { statuses: [200] }
          }
        },
        {
          urlPattern: ({ request, sameOrigin }) => sameOrigin && (request.destination === 'image' || request.destination === 'font'),
          handler: 'CacheFirst',
          options: {
            cacheName: 'myday-static',
            expiration: { maxEntries: 96, maxAgeSeconds: 60 * 60 * 24 * 365 },
            cacheableResponse: { statuses: [0, 200] }
          }
        }
      ]
    },

    devOptions: {
      enabled: false
    }
  }

})
