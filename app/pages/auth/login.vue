<script lang="ts" setup>
import { loginSchema } from '~~/shared/schemas'

definePageMeta({ layout: 'auth' })

const { t } = useI18n()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const loading = ref(false)
const emailError = ref('')
const passwordError = ref('')
const formError = ref('')

async function handleSubmit() {
  emailError.value = ''
  passwordError.value = ''
  formError.value = ''

  const result = loginSchema.safeParse({ email: email.value, password: password.value })
  if (!result.success) {
    for (const issue of result.error.issues) {
      if (issue.path[0] === 'email') emailError.value = t('auth.errorInvalidEmail')
      if (issue.path[0] === 'password') passwordError.value = t('auth.errorShortPassword')
    }
    return
  }

  loading.value = true
  try {
    await authStore.login(result.data)
    await navigateTo('/today')
  } catch (e: any) {
    const status = e?.statusCode ?? e?.data?.statusCode
    formError.value = status === 401
      ? t('auth.errorInvalidCredentials')
      : t('auth.errorGeneric')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex flex-col flex-1 p-6">
    <NuxtLink to="/auth/welcome" class="text-text">
      <UIcon name="i-heroicons-chevron-left" class="w-6 h-6" />
    </NuxtLink>

    <div class="flex flex-col gap-2 mt-8">
      <p class="text-text text-4xl font-bold">
        {{ t('auth.welcomeBack') }}
      </p>
      <p class="text-text-dim text-xl">
        {{ t('auth.loginDescription') }}
      </p>
    </div>

    <form class="flex flex-col gap-5 mt-8" @submit.prevent="handleSubmit">
      <UiInput v-model="email" :placeholder="t('auth.email')" type="email" :error="emailError">
        <template #icon>
          <UIcon name="i-heroicons-envelope" />
        </template>
      </UiInput>
      <UiInput v-model="password" :placeholder="t('auth.password')" type="password" :error="passwordError">
        <template #icon>
          <UIcon name="i-heroicons-lock-closed" />
        </template>
      </UiInput>
      <p v-if="formError" class="text-error text-sm">
        {{ formError }}
      </p>
      <p class="text-accent ml-auto cursor-pointer">
        {{ t('auth.forgotPass') }}
      </p>
      <UiButton size="lg" :loading="loading" type="submit">
        <span>{{ t('auth.signIn') }}</span>
      </UiButton>
    </form>

    <div class="flex-1" />

    <span class="text-text-dim w-full text-center">
      {{ t('auth.dontHaveAccount') }}
      <NuxtLink class="text-accent cursor-pointer" to="/auth/register">{{ t('auth.createAccount') }}</NuxtLink>
    </span>
  </div>
</template>
