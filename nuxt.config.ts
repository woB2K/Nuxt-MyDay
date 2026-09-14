// https://nuxt.com/docs/api/configuration/nuxt-config
import process from 'node:process'
import { apiCacheName } from './app/utils/swCache'

export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@pinia/nuxt',
    '@vite-pwa/nuxt',
    '@nuxtjs/i18n'
  ],
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
      ]
    }
  },
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    jwtAccessSecret: '',
    jwtRefreshSecret: '',
    googleClientId: '',
    googleClientSecret: '',
    public: {
      appUrl: ''
    }
  },

  routeRules: {
    '/': { prerender: true }
  },
  future: {
    compatibilityVersion: 4
  },

  compatibilityDate: '2025-01-15',
  hooks: {
    close: (nuxt) => {
      if (!nuxt.options.dev && !nuxt.options.test) process.exit(process.exitCode ?? 0)
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
