// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@pinia/nuxt',
    '@vite-pwa/nuxt'
  ],
  ssr: false,

  devtools: {
    enabled: false
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

  eslint: {
    config: {
      standalone: false,
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }

})
