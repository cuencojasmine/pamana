<script setup lang="ts">
//@ts-nocheck
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
  <main class="flex min-h-screen items-center px-4 py-6 sm:px-6 lg:px-8">
    <section class="glass mx-auto grid w-full max-w-6xl overflow-hidden rounded-30 lg:grid-cols-[0.9fr_1.1fr]">
      <aside class="glow-teal relative flex flex-col justify-between bg-gradient-to-br from-lime-50/90 via-emerald-50/80 to-teal-50/90 p-7 sm:p-10 lg:p-12">
        <div class="relative z-10">
          <NuxtLink to="/login" class="inline-flex items-center gap-3">
            <span class="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-lime-300 to-emerald-500 font-display text-lg font-bold text-neutral-950 shadow-[0_14px_35px_-16px_rgba(77,124,15,0.8)]">P</span>
            <span>
              <span class="block font-display text-xl font-bold tracking-tight text-neutral-900">PAMANA</span>
              <span class="block text-[11px] text-neutral-500">Rural Mobility Coordinator</span>
            </span>
          </NuxtLink>

          <span class="pill mt-12 bg-teal-100 text-teal-700">
            <UIcon name="i-lucide-user-round-plus" class="size-3.5" />
            Passenger registration
          </span>

          <h1 class="mt-4 font-display text-4xl font-bold leading-[1.08] tracking-tight text-neutral-900">
            Your everyday trips,
            <span class="text-gradient-lime">made clearer.</span>
          </h1>

          <p class="mt-5 max-w-sm text-sm leading-6 text-neutral-500">
            Create one account to plan routes, check mobility conditions, and send helpful corridor reports.
          </p>
        </div>

        <div class="relative z-10 mt-10 space-y-3">
          <div v-for="item in [
            ['i-lucide-route', 'Compare available trip options'],
            ['i-lucide-map', 'Explore the pilot corridor'],
            ['i-lucide-message-square-warning', 'Share passenger conditions']
          ]" :key="item[1]" class="glass-solid flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-neutral-700">
            <span class="flex size-8 items-center justify-center rounded-xl bg-lime-100 text-lime-700">
              <UIcon :name="item[0]" class="size-4" />
            </span>
            {{ item[1] }}
          </div>
        </div>
      </aside>

      <div class="bg-white/55 p-7 sm:p-10 lg:p-12">
        <div class="mx-auto max-w-xl">
          <div class="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p class="text-sm font-semibold text-lime-600">Get started</p>
              <h2 class="mt-1 font-display text-3xl font-bold tracking-tight text-neutral-900">Create your account</h2>
              <p class="mt-2 text-sm text-neutral-500">Passenger accounts can be created here. Staff accounts are managed by PAMANA administrators.</p>
            </div>
          </div>

          <UForm :schema="schema" :state="state" class="mt-8 space-y-5" @submit="onSubmit">
          <div class="grid grid-cols-2 gap-4">
            <UFormField
              label="First Name"
              name="firstName"
              required
            >
              <UInput
                v-model="state.firstName"
                placeholder="Juan"
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
              placeholder="09XX XXX XXXX"
              icon="i-lucide-phone"
              autocomplete="tel"
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
              size="xl"
              class="w-full"
            >
              <template #trailing>
                <UButton
                  type="button"
                  color="neutral"
                  variant="ghost"
                  size="xs"
                  :icon="
                    showPassword
                      ? 'i-lucide-eye-off'
                      : 'i-lucide-eye'
                  "
                  :aria-label="
                    showPassword
                      ? 'Hide password'
                      : 'Show password'
                  "
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
            Create Account
          </UButton>
          </UForm>

          <p class="mt-7 text-center text-sm text-neutral-500">
            Already have an account?
            <NuxtLink to="/login" class="font-semibold text-lime-600 hover:text-lime-700 hover:underline">Sign in</NuxtLink>
          </p>

          <p class="mt-3 flex items-center justify-center gap-2 text-center text-xs text-neutral-400">
            <UIcon name="i-lucide-map-pin" class="size-3.5 text-lime-600" />
            San Luis ↔ City of San Fernando pilot corridor
          </p>
        </div>
      </div>
    </section>
  </main>
</template>
