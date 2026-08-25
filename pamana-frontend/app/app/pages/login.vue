<script setup lang="ts">
//@ts-nocheck
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({
  layout: false,
  middleware: ['guest']
})

useHead({
  title: 'Login | PAMANA'
})

const {
  login,
  redirectByRole,
  loading
} = useAuth()

const toast = useToast()

const showPassword = ref(false)

const schema = z.object({
  identifier: z
    .string()
    .min(1, 'Email or username is required'),

  password: z
    .string()
    .min(1, 'Password is required')
})

type Schema = z.output<typeof schema>

const state = reactive<Schema>({
  identifier: '',
  password: ''
})

const getLoginErrorMessage = (error: any) => {
  const message =
    error?.data?.error?.message ||
    error?.statusMessage ||
    error?.message

  if (
    message === 'Invalid identifier or password' ||
    error?.status === 400
  ) {
    return 'Invalid email, username, or password.'
  }

  return 'Unable to sign in. Please try again.'
}

const onSubmit = async (
  event: FormSubmitEvent<Schema>
) => {
  try {
    await login(event.data)

    toast.add({
      title: 'Login successful',
      description: 'Welcome to PAMANA.',
      color: 'success'
    })

    await redirectByRole()
  } catch (error) {
    console.error('Login error:', error)

    toast.add({
      title: 'Login failed',
      description: getLoginErrorMessage(error),
      color: 'error'
    })
  }
}
</script>

<template>
  <main class="flex min-h-screen items-center px-4 py-6 sm:px-6 lg:px-8">
    <section class="glass mx-auto grid w-full max-w-6xl overflow-hidden rounded-30 lg:grid-cols-[1.08fr_0.92fr]">
      <div class="glow-sunset relative flex min-h-[380px] flex-col justify-between bg-gradient-to-br from-lime-50/90 via-emerald-50/80 to-teal-50/90 p-7 sm:p-10 lg:min-h-[680px] lg:p-12">
        <div class="relative z-10">
          <div class="flex items-center gap-3">
            <div class="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-lime-300 to-emerald-500 font-display text-lg font-bold text-neutral-950 shadow-[0_14px_35px_-16px_rgba(77,124,15,0.8)]">
              P
            </div>

            <div>
              <h1 class="font-display text-xl font-bold tracking-tight text-neutral-900">PAMANA</h1>
              <p class="text-[11px] text-neutral-500">Rural Mobility Coordinator</p>
            </div>
          </div>

          <div class="mt-12 max-w-lg lg:mt-20">
            <span class="pill bg-lime-100 text-lime-700">
              <UIcon name="i-lucide-sparkles" class="size-3.5" />
              Smarter rural mobility
            </span>

            <h2 class="mt-4 font-display text-4xl font-bold leading-[1.08] tracking-tight text-neutral-900 sm:text-5xl">
              Better journeys across
              <span class="text-gradient-lime">Pampanga.</span>
            </h2>

            <p class="mt-5 max-w-md text-sm leading-6 text-neutral-500 sm:text-base">
              Plan trips, coordinate transport, and understand corridor demand through one connected mobility platform.
            </p>
          </div>
        </div>

        <div class="relative z-10 mt-10 grid grid-cols-3 gap-3">
          <div class="glass-solid rounded-2xl p-3 sm:p-4">
            <UIcon name="i-lucide-route" class="size-5 text-lime-600" />
            <p class="mt-3 font-display text-sm font-semibold text-neutral-900">Plan</p>
            <p class="mt-0.5 hidden text-xs text-neutral-500 sm:block">Compare routes</p>
          </div>

          <div class="glass-solid rounded-2xl p-3 sm:p-4">
            <UIcon name="i-lucide-map-pinned" class="size-5 text-emerald-600" />
            <p class="mt-3 font-display text-sm font-semibold text-neutral-900">Navigate</p>
            <p class="mt-0.5 hidden text-xs text-neutral-500 sm:block">Follow mobility</p>
          </div>

          <div class="glass-solid rounded-2xl p-3 sm:p-4">
            <UIcon name="i-lucide-chart-no-axes-combined" class="size-5 text-teal-600" />
            <p class="mt-3 font-display text-sm font-semibold text-neutral-900">Coordinate</p>
            <p class="mt-0.5 hidden text-xs text-neutral-500 sm:block">Improve service</p>
          </div>
        </div>
      </div>

      <div class="flex flex-col justify-center bg-white/55 p-7 sm:p-10 lg:p-12">
        <div class="mx-auto w-full max-w-md">
          <span class="pill bg-lime-100 text-lime-700">
            <UIcon name="i-lucide-log-in" class="size-3.5" />
            Secure access
          </span>

          <h2 class="mt-4 font-display text-3xl font-bold tracking-tight text-neutral-900">Welcome back</h2>
          <p class="mt-2 text-sm leading-6 text-neutral-500">
            Sign in with your PAMANA account. Your workspace will open automatically based on your role.
          </p>

          <UForm :schema="schema" :state="state" class="mt-8 space-y-5" @submit="onSubmit">
            <UFormField label="Email or Username" name="identifier" required>
              <UInput
                v-model="state.identifier"
                placeholder="Enter your email or username"
                icon="i-lucide-user-round"
                autocomplete="username"
                size="xl"
                class="w-full"
              />
            </UFormField>

            <UFormField label="Password" name="password" required>
              <UInput
                v-model="state.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Enter your password"
                icon="i-lucide-lock-keyhole"
                autocomplete="current-password"
                size="xl"
                class="w-full"
              >
                <template #trailing>
                  <UButton
                    type="button"
                    color="neutral"
                    variant="ghost"
                    size="xs"
                    :icon="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                    :aria-label="showPassword ? 'Hide password' : 'Show password'"
                    @click="showPassword = !showPassword"
                  />
                </template>
              </UInput>
            </UFormField>

            <UButton
              type="submit"
              block
              size="xl"
              icon="i-lucide-arrow-right"
              trailing
              class="rounded-full font-semibold text-neutral-950 shadow-[0_14px_28px_-18px_rgba(77,124,15,0.85)]"
              :loading="loading"
              :disabled="loading"
            >
              Sign In
            </UButton>
          </UForm>

          <div class="my-7 flex items-center gap-3 text-xs text-neutral-400">
            <span class="h-px flex-1 bg-neutral-900/10" />
            Passenger access
            <span class="h-px flex-1 bg-neutral-900/10" />
          </div>

          <NuxtLink to="/register" class="btn-soft w-full">
            <UIcon name="i-lucide-user-plus" class="size-4" />
            Create a passenger account
          </NuxtLink>

          <div class="mt-7 flex items-center justify-center gap-2 text-center text-xs text-neutral-400">
            <UIcon name="i-lucide-map-pin" class="size-3.5 text-lime-600" />
            San Luis ↔ City of San Fernando pilot corridor
          </div>
        </div>
      </div>
    </section>
  </main>
</template>
