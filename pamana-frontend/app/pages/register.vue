<script setup lang="ts">
// @ts-nocheck
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({
  layout: false,
  middleware: ['guest']
})

useHead({
  title: 'Register | PAMANA'
})

const {
  register,
  redirectByRole,
  loading
} = useAuth()

const toast = useToast()
const showPassword = ref(false)

const schema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required'),

  lastName: z
    .string()
    .min(1, 'Last name is required'),

  username: z
    .string()
    .min(3, 'Username must be at least 3 characters'),

  email: z
    .string()
    .email('Enter a valid email address'),

  contactNumber: z
    .string()
    .optional(),

  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
})

type Schema = z.output<typeof schema>

const state = reactive<Schema>({
  firstName: '',
  lastName: '',
  username: '',
  email: '',
  contactNumber: '',
  password: ''
})

const getRegisterErrorMessage = (error: any) => {
  const message =
    error?.data?.error?.message ||
    error?.statusMessage ||
    error?.message

  if (message === 'Email or Username are already taken') {
    return 'That email or username is already registered.'
  }

  return message || 'Unable to create your account. Please try again.'
}

const onSubmit = async (
  event: FormSubmitEvent<Schema>
) => {
  try {
    await register(event.data)

    toast.add({
      title: 'Account created',
      description: 'Welcome to PAMANA.',
      color: 'success'
    })

    await redirectByRole()
  } catch (error) {
    console.error('Registration error:', error)

    toast.add({
      title: 'Registration failed',
      description: getRegisterErrorMessage(error),
      color: 'error'
    })
  }
}
</script>

<template>
  <main
    class="register-page flex min-h-screen items-center px-4 py-6 sm:px-6 lg:px-8"
  >
    <section
      class="relative mx-auto grid w-full max-w-6xl overflow-hidden rounded-30 border border-white/70 bg-transparent shadow-2xl lg:grid-cols-[0.9fr_1.1fr]"
    >
      <!-- Left picture panel -->
      <aside
        class="relative flex min-h-[500px] flex-col justify-between overflow-hidden p-7 sm:p-10 lg:min-h-[760px] lg:p-12"
      >
        <!-- Light overlay for readable text -->
        <div
          class="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/75 via-white/25 to-transparent"
        />

        <div class="relative z-10">
          <!-- PAMANA logo at the top-left -->
          <NuxtLink
            to="/login"
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

          <!-- Registration introduction -->
          <div class="mt-12 max-w-md lg:mt-16">
            <span class="pill bg-teal-100/90 text-teal-700">
              <UIcon
                name="i-lucide-user-round-plus"
                class="size-3.5"
              />

              Passenger registration
            </span>

            <h1
              class="mt-4 font-display text-4xl font-bold leading-[1.08] tracking-tight text-neutral-900 drop-shadow-sm"
            >
              Your everyday trips,

              <span class="text-gradient-lime">
                made clearer.
              </span>
            </h1>

            <p
              class="mt-5 max-w-sm text-sm font-medium leading-6 text-neutral-700"
            >
              Create one account to plan routes, check mobility conditions,
              and send helpful corridor reports.
            </p>
          </div>
        </div>

        <!-- Benefits -->
        <div class="relative z-10 mt-10 space-y-3">
          <div
            v-for="item in [
              ['i-lucide-route', 'Compare available trip options'],
              ['i-lucide-map', 'Explore the pilot corridor'],
              ['i-lucide-message-square-warning', 'Share passenger conditions']
            ]"
            :key="item[1]"
            class="flex items-center gap-3 rounded-2xl border border-white/80 bg-white/75 px-4 py-3 text-sm font-medium text-neutral-700 shadow-lg backdrop-blur-sm"
          >
            <span
              class="flex size-8 shrink-0 items-center justify-center rounded-xl bg-lime-100 text-lime-700"
            >
              <UIcon
                :name="item[0]"
                class="size-4"
              />
            </span>

            {{ item[1] }}
          </div>
        </div>
      </aside>

      <!-- Registration form panel -->
      <div
        class="border-l border-white/80 bg-white/95 p-7 backdrop-blur-md sm:p-10 lg:p-12"
      >
        <div class="mx-auto max-w-xl">
          <p class="text-sm font-semibold text-lime-600">
            Get started
          </p>

          <h2
            class="mt-1 font-display text-3xl font-bold tracking-tight text-neutral-900"
          >
            Create your account
          </h2>

          <p class="mt-2 text-sm leading-6 text-neutral-600">
            Passenger accounts can be created here. Staff accounts are managed
            by PAMANA administrators.
          </p>

          <UForm
            :schema="schema"
            :state="state"
            class="register-form mt-8 space-y-5"
            @submit="onSubmit"
          >
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <UFormField
                label="First Name"
                name="firstName"
                required
              >
                <UInput
                  v-model="state.firstName"
                  placeholder="Juan"
                  autocomplete="given-name"
                  color="neutral"
                  variant="outline"
                  size="xl"
                  class="w-full"
                />
              </UFormField>

              <UFormField
                label="Last Name"
                name="lastName"
                required
              >
                <UInput
                  v-model="state.lastName"
                  placeholder="Dela Cruz"
                  autocomplete="family-name"
                  color="neutral"
                  variant="outline"
                  size="xl"
                  class="w-full"
                />
              </UFormField>
            </div>

            <UFormField
              label="Username"
              name="username"
              required
            >
              <UInput
                v-model="state.username"
                placeholder="Choose a username"
                icon="i-lucide-user"
                autocomplete="username"
                color="neutral"
                variant="outline"
                size="xl"
                class="w-full"
              />
            </UFormField>

            <UFormField
              label="Email"
              name="email"
              required
            >
              <UInput
                v-model="state.email"
                type="email"
                placeholder="Enter your email"
                icon="i-lucide-mail"
                autocomplete="email"
                color="neutral"
                variant="outline"
                size="xl"
                class="w-full"
              />
            </UFormField>

            <UFormField
              label="Contact Number"
              name="contactNumber"
            >
              <UInput
                v-model="state.contactNumber"
                type="tel"
                placeholder="09XX XXX XXXX"
                icon="i-lucide-phone"
                autocomplete="tel"
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
                placeholder="Create a password"
                icon="i-lucide-lock"
                autocomplete="new-password"
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
              class="create-account-button rounded-full font-semibold shadow-[0_14px_28px_-18px_rgba(77,124,15,0.85)]"
              :loading="loading"
              :disabled="loading"
            >
              Create Account
            </UButton>
          </UForm>

          <p class="mt-7 text-center text-sm text-neutral-600">
            Already have an account?

            <NuxtLink
              to="/login"
              class="font-semibold text-lime-600 hover:text-lime-700 hover:underline"
            >
              Sign in
            </NuxtLink>
          </p>

          <p
            class="mt-3 flex items-center justify-center gap-2 text-center text-xs text-neutral-500"
          >
            <UIcon
              name="i-lucide-map-pin"
              class="size-3.5 text-lime-600"
            />

            San Luis ↔ City of San Fernando pilot corridor
          </p>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.register-page {
  background-color: #d9f99d;
  background-image: url('/pamana-login-bg.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

/* Form labels */
.register-form :deep(label) {
  color: #262626 !important;
  font-weight: 600 !important;
}

/* All registration inputs */
.register-form :deep(input) {
  background-color: #ffffff !important;
  color: #171717 !important;
  caret-color: #65a30d !important;
  border-radius: 0.75rem !important;
  box-shadow: inset 0 0 0 1px #d4d4d4 !important;
}

/* Placeholder text */
.register-form :deep(input::placeholder) {
  color: #737373 !important;
  opacity: 1 !important;
}

/* Focused input */
.register-form :deep(input:focus) {
  box-shadow:
    inset 0 0 0 2px #84cc16,
    0 0 0 3px rgba(132, 204, 22, 0.15) !important;
  outline: none !important;
}

/* Browser autofill */
.register-form :deep(input:-webkit-autofill),
.register-form :deep(input:-webkit-autofill:hover),
.register-form :deep(input:-webkit-autofill:focus) {
  -webkit-text-fill-color: #171717 !important;
  box-shadow: inset 0 0 0 1000px #ffffff !important;
}

/* Password visibility button */
.password-toggle {
  color: #525252 !important;
}

/* Create Account button */
.create-account-button {
  background-color: #84cc16 !important;
  color: #171717 !important;
}

.create-account-button:hover {
  background-color: #65a30d !important;
  color: #ffffff !important;
}

.create-account-button:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}
</style>