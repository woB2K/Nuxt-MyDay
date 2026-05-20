import { useAppToast } from '~/composables/useAppToast'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:error', (err) => {
    useAppToast().error(err.message ?? 'Something went wrong')
  })
})
