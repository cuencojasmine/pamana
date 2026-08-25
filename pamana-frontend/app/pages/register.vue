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
  <div
    class="
      min-h-screen
      flex
      items-center
      justify-center
      px-4
      py-10
    "
  >
    <div class="w-full max-w-md">
      <div class="mb-8 text-center">
        <div
          class="
            mx-auto
            mb-4
            flex
            h-16
            w-16
            items-center
            justify-center
            rounded-2xl
            bg-gradient-to-br
            from-lime-300
            to-emerald-500
            font-display
            text-2xl
            font-bold
            text-neutral-950
            shadow-[0_0_40px_-10px_rgba(163,230,53,0.6)]
          "
        >
          P
        </div>

        <h1
          class="
            font-display
            text-3xl
            font-bold
            tracking-tight
            text-neutral-900
          "
        >
          PAMANA
        </h1>

        <p
          class="
            mt-2
            text-sm
            text-neutral-500
          "
        >
          Pampanga AI-powered Mobility Access
          and Navigation Assistant
        </p>
      </div>

      <UCard class="glass glow-lime rounded-3xl" :ui="{ root: 'ring-0 rounded-3xl', header: 'border-neutral-900/10', footer: 'border-neutral-900/10' }">
        <template #header>
          <div class="relative z-10">
            <h2
              class="
                font-display
                text-xl
                font-semibold
                text-neutral-900
              "
            >
              Create a passenger account
            </h2>

            <p
              class="
                mt-1
                text-sm
                text-neutral-500
              "
            >
              Register to plan trips and report conditions on PAMANA.
            </p>
          </div>
        </template>

        <UForm
          :schema="schema"
          :state="state"
          class="relative z-10 space-y-5"
          @submit="onSubmit"
        >
          <div class="grid grid-cols-2 gap-4">
            <UFormField
              label="First Name"
              name="firstName"
              required
            >
              <UInput
                v-model="state.firstName"
                placeholder="Juan"
                size="lg"
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
                size="lg"
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
              size="lg"
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
              size="lg"
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
              size="lg"
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
              size="lg"
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
            size="lg"
            class="font-semibold text-neutral-950"
            :loading="loading"
            :disabled="loading"
          >
            Create Account
          </UButton>
        </UForm>
      </UCard>

      <p
        class="
          mt-6
          text-center
          text-sm
          text-neutral-500
        "
      >
        Already have an account?
        <NuxtLink
          to="/login"
          class="font-medium text-lime-600 hover:underline"
        >
          Sign in
        </NuxtLink>
      </p>

      <p
        class="
          mt-2
          text-center
          text-xs
          text-neutral-400
        "
      >
        Pilot Corridor:
        San Luis ↔ City of San Fernando, Pampanga
      </p>
    </div>
  </div>
</template>
