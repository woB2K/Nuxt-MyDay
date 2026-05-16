<script lang="ts" setup>
definePageMeta({
  layout: 'auth'
})
</script>

<template>
  <div class="flex-1 flex flex-col items-center w-full">
    <div class="flex-1 flex flex-col items-center justify-center gap-6 text-center px-6 relative">
      <div
        class="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] rounded-full
            bg-[radial-gradient(circle,rgba(167,139,250,0.22)_0%,rgba(167,139,250,0)_60%)]
            pointer-events-none"
      />
      <div
        class="absolute bottom-0 right-0 w-[200px] h-[200px] rounded-full
            bg-[radial-gradient(circle,rgba(94,234,212,0.10)_0%,rgba(94,234,212,0)_60%)]
            pointer-events-none"
      />
      <UiLogoMark :size="100" />
      <p class="text-text text-4xl font-display font-bold">
        MyDay
      </p>
      <p class="text-text-dim">
        Tasks & finances, one place
      </p>
    </div>

    <div class="flex flex-col rounded-md bg-elev1 items-center text-center gap-6 w-full p-6">
      <p class="text-text text-xl">
        Get started
      </p>
      <UiButton variant="secondary" class="w-full">
        <UIcon name="i-simple-icons-google" />
        <span>Continue with Google</span>
      </UiButton>
      <UiButton variant="secondary" class="w-full" to="/auth/register">
        <UIcon name="i-heroicons-envelope" class="text-accent" />
        <span>Continue with email</span>
      </UiButton>
      <span class="text-text">Already have an account?
        <NuxtLink class="text-accent cursor-pointer" to="/auth/login">Sign in</NuxtLink>
      </span>
    </div>
  </div>
</template>
