<script setup lang="ts">
// @ts-nocheck
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
  <main class="login-page flex min-h-screen items-center px-4 py-6 sm:px-6 lg:px-8">
    <section
      class="relative mx-auto grid w-full max-w-6xl overflow-hidden rounded-30 border border-white/70 bg-transparent shadow-2xl lg:grid-cols-[1.08fr_0.92fr]"
    >
      <!-- Left picture panel -->
      <div
        class="relative flex min-h-[500px] flex-col justify-between overflow-hidden p-7 sm:p-10 lg:min-h-[680px] lg:p-12"
      >
        <!-- Light overlay for readability -->
        <div
          class="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/75 via-white/25 to-transparent"
        />

        <div class="relative z-10">
          <!-- PAMANA logo positioned at the top-left -->
          <NuxtLink
            to="/"
            class="inline-flex flex-col items-center"
          >
            <div
              class="flex h-14 w-44 items-center justify-center rounded-xl border border-white/80 bg-white/90 px-3 py-1.5 shadow-md backdrop-blur-sm"
            >
              <img
                src="/pamana-logo.png"
                alt="PAMANA"
                width="176"
                height="56"
                class="h-full w-full object-contain object-center"
              >
            </div>

            <p
              class="mt-1 w-full text-center text-[10px] font-medium text-neutral-700"
            >
              Pampanga AI-powered Mobility Access and Navigation Assistant
            </p>
          </NuxtLink>

          <!-- Main information -->
          <div class="mt-12 max-w-lg lg:mt-16">
            <span class="pill bg-lime-100/90 text-lime-700">
              <UIcon
                name="i-lucide-sparkles"
                class="size-3.5"
              />

              Smarter rural mobility
            </span>

            <h2
              class="mt-4 font-display text-4xl font-bold leading-[1.08] tracking-tight text-neutral-900 drop-shadow-sm sm:text-5xl"
            >
              Better journeys across

              <span class="text-gradient-lime">
                Pampanga.
              </span>
            </h2>

            <p
              class="mt-5 max-w-md text-sm font-medium leading-6 text-neutral-700 sm:text-base"
            >
              Plan trips, coordinate transport, and understand corridor demand
              through one connected mobility platform.
            </p>
          </div>
        </div>

        <!-- Feature cards -->
        <div class="relative z-10 mt-10 grid grid-cols-3 gap-3">
          <div
            class="rounded-2xl border border-white/80 bg-white/75 p-3 shadow-lg backdrop-blur-sm sm:p-4"
          >
            <UIcon
              name="i-lucide-route"
              class="size-5 text-lime-600"
            />

            <p class="mt-3 font-display text-sm font-semibold text-neutral-900">
              Plan
            </p>

            <p class="mt-0.5 hidden text-xs text-neutral-600 sm:block">
              Compare routes
            </p>
          </div>

          <div
            class="rounded-2xl border border-white/80 bg-white/75 p-3 shadow-lg backdrop-blur-sm sm:p-4"
          >
            <UIcon
              name="i-lucide-map-pinned"
              class="size-5 text-emerald-600"
            />

            <p class="mt-3 font-display text-sm font-semibold text-neutral-900">
              Navigate
            </p>

            <p class="mt-0.5 hidden text-xs text-neutral-600 sm:block">
              Follow mobility
            </p>
          </div>

          <div
            class="rounded-2xl border border-white/80 bg-white/75 p-3 shadow-lg backdrop-blur-sm sm:p-4"
          >
            <UIcon
              name="i-lucide-chart-no-axes-combined"
              class="size-5 text-teal-600"
            />

            <p class="mt-3 font-display text-sm font-semibold text-neutral-900">
              Coordinate
            </p>

            <p class="mt-0.5 hidden text-xs text-neutral-600 sm:block">
              Improve service
            </p>
          </div>
        </div>
      </div>

      <!-- Login form panel -->
      <div
        class="flex flex-col justify-center border-l border-white/80 bg-white/95 p-7 backdrop-blur-md sm:p-10 lg:p-12"
      >
        <div class="mx-auto w-full max-w-md">
          <span class="pill bg-lime-100 text-lime-700">
            <UIcon
              name="i-lucide-log-in"
              class="size-3.5"
            />

            Secure access
          </span>

          <h2
            class="mt-4 font-display text-3xl font-bold tracking-tight text-neutral-900"
          >
            Welcome back
          </h2>

          <p class="mt-2 text-sm leading-6 text-neutral-600">
            Sign in with your PAMANA account. Your workspace will open
            automatically based on your role.
          </p>

          <UForm
            :schema="schema"
            :state="state"
            class="login-form mt-8 space-y-5"
            @submit="onSubmit"
          >
            <UFormField
              label="Email or Username"
              name="identifier"
              required
            >
              <UInput
                v-model="state.identifier"
                placeholder="Enter your email or username"
                icon="i-lucide-user-round"
                autocomplete="username"
                color="neutral"
                variant="outline"
                size="xl"
                class="w-full"
              />
            </UFormField>

            <UFormField
              label="Password"
              name="password"
              required
            >
              <UInput
                v-model="state.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Enter your password"
                icon="i-lucide-lock-keyhole"
                autocomplete="current-password"
                color="neutral"
                variant="outline"
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
                    class="password-toggle"
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
              class="sign-in-button rounded-full font-semibold shadow-[0_14px_28px_-18px_rgba(77,124,15,0.85)]"
              :loading="loading"
              :disabled="loading"
            >
              Sign In
            </UButton>
          </UForm>

          <div class="my-7 flex items-center gap-3 text-xs text-neutral-500">
            <span class="h-px flex-1 bg-neutral-300" />
            Passenger access
            <span class="h-px flex-1 bg-neutral-300" />
          </div>

          <NuxtLink
            to="/register"
            class="btn-soft w-full"
          >
            <UIcon
              name="i-lucide-user-plus"
              class="size-4"
            />

            Create a passenger account
          </NuxtLink>

          <div
            class="mt-7 flex items-center justify-center gap-2 text-center text-xs text-neutral-500"
          >
            <UIcon
              name="i-lucide-map-pin"
              class="size-3.5 text-lime-600"
            />

            San Luis ↔ City of San Fernando pilot corridor
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.login-page {
  background-color: #d9f99d;
  background-image: url('/pamana-login-bg.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

/* Form labels */
.login-form :deep(label) {
  color: #262626 !important;
  font-weight: 600 !important;
}

/* Username and password fields */
.login-form :deep(input) {
  background-color: #ffffff !important;
  color: #171717 !important;
  caret-color: #65a30d !important;
  border-radius: 0.75rem !important;
  box-shadow: inset 0 0 0 1px #d4d4d4 !important;
}

/* Input placeholder text */
.login-form :deep(input::placeholder) {
  color: #737373 !important;
  opacity: 1 !important;
}

/* Focused input */
.login-form :deep(input:focus) {
  box-shadow:
    inset 0 0 0 2px #84cc16,
    0 0 0 3px rgba(132, 204, 22, 0.15) !important;
  outline: none !important;
}

/* Browser autofill */
.login-form :deep(input:-webkit-autofill),
.login-form :deep(input:-webkit-autofill:hover),
.login-form :deep(input:-webkit-autofill:focus) {
  -webkit-text-fill-color: #171717 !important;
  box-shadow: inset 0 0 0 1000px #ffffff !important;
}

/* Password eye button */
.password-toggle {
  color: #525252 !important;
}

/* Sign In button */
.sign-in-button {
  background-color: #84cc16 !important;
  color: #171717 !important;
}

.sign-in-button:hover {
  background-color: #65a30d !important;
  color: #ffffff !important;
}

.sign-in-button:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}
</style>