<script lang="ts" setup>
import { registerSchema } from '~~/shared/schemas'
import { homePath } from '~/utils/family'

definePageMeta({ layout: 'auth' })

const { t, locale } = useI18n()
const authStore = useAuthStore()
const { canRegister, invite } = useRegistration()

const name = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)
const nameError = ref('')
const emailError = ref('')
const passwordError = ref('')
const formError = ref('')

async function handleSubmit() {
  nameError.value = ''
  emailError.value = ''
  passwordError.value = ''
  formError.value = ''

  const result = registerSchema.safeParse({ name: name.value, email: email.value, password: password.value, inviteToken: invite.value, lang: locale.value })
  if (!result.success) {
    for (const issue of result.error.issues) {
      if (issue.path[0] === 'name') nameError.value = t('auth.errorShortName')
      if (issue.path[0] === 'email') emailError.value = t('auth.errorInvalidEmail')
      if (issue.path[0] === 'password') passwordError.value = t('auth.errorShortPassword')
    }
    return
  }

  loading.value = true
  try {
    await authStore.register(result.data)
    await navigateTo(homePath())
  } catch (e: any) {
    const status = e?.statusCode ?? e?.data?.statusCode

    if (status === 409) emailError.value = t('auth.errorEmailTaken')
    else if (status === 403) formError.value = t('auth.registrationClosed.formError')
    else if (status === 429) formError.value = t('auth.errorTooManyAttempts')
    else formError.value = t('auth.errorGeneric')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex flex-col flex-1 p-6">
    <NuxtLink to="/auth/welcome" class="text-text">
      <UIcon name="i-lucide-chevron-left" class="w-6 h-6" />
    </NuxtLink>

    <div class="flex flex-col gap-2 mt-8">
      <p class="text-text text-4xl font-bold">
        {{ t('auth.createAccount') }}
      </p>
      <p class="text-text-dim text-xl">
        {{ t('auth.registerDescription') }}
      </p>
    </div>

    <div v-if="!canRegister" class="flex flex-col gap-2 mt-8 rounded-xl border border-hairline bg-elev2 p-4" data-testid="registration-closed">
      <p class="text-[15px] font-semibold text-text">
        {{ t('auth.registrationClosed.title') }}
      </p>
      <p class="text-sm text-text-dim">
        {{ t('auth.registrationClosed.body') }}
      </p>
    </div>

    <form v-else class="flex flex-col gap-5 mt-8" @submit.prevent="handleSubmit">
      <UiInput v-model="name" :placeholder="t('auth.name')" type="text" :error="nameError">
        <template #icon>
          <UIcon name="i-lucide-circle-user" />
        </template>
      </UiInput>
      <UiInput v-model="email" :placeholder="t('auth.email')" type="email" :error="emailError">
        <template #icon>
          <UIcon name="i-lucide-mail" />
        </template>
      </UiInput>
      <UiInput v-model="password" :placeholder="t('auth.password')" type="password" :error="passwordError">
        <template #icon>
          <UIcon name="i-lucide-lock" />
        </template>
      </UiInput>
      <p v-if="formError" class="text-error text-sm">
        {{ formError }}
      </p>
      <UiButton size="lg" :loading="loading" type="submit">
        <span>{{ t('auth.createAccount') }}</span>
      </UiButton>
    </form>

    <div class="flex-1" />

    <span class="text-text-dim w-full text-center">
      {{ t('auth.alreadyHaveAccount') }}
      <NuxtLink class="text-accent cursor-pointer" to="/auth/login">{{ t('auth.signIn') }}</NuxtLink>
    </span>
  </div>
</template>
