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
  <div
    class="
      min-h-screen
      bg-gray-50
      dark:bg-gray-950
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
            bg-primary
            text-2xl
            font-bold
            text-white
            shadow-sm
          "
        >
          P
        </div>

        <h1
          class="
            text-3xl
            font-bold
            tracking-tight
            text-gray-900
            dark:text-white
          "
        >
          PAMANA
        </h1>

        <p
          class="
            mt-2
            text-sm
            text-gray-500
            dark:text-gray-400
          "
        >
          Pampanga AI-powered Mobility Access
          and Navigation Assistant
        </p>
      </div>

      <UCard>
        <template #header>
          <div>
            <h2
              class="
                text-xl
                font-semibold
                text-gray-900
                dark:text-white
              "
            >
              Sign in
            </h2>

            <p
              class="
                mt-1
                text-sm
                text-gray-500
                dark:text-gray-400
              "
            >
              Enter your PAMANA account credentials.
            </p>
          </div>
        </template>

        <UForm
          :schema="schema"
          :state="state"
          class="space-y-5"
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
              icon="i-lucide-user"
              autocomplete="username"
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
              placeholder="Enter your password"
              icon="i-lucide-lock"
              autocomplete="current-password"
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
            :loading="loading"
            :disabled="loading"
          >
            Sign In
          </UButton>
        </UForm>
      </UCard>

      <p
        class="
          mt-6
          text-center
          text-xs
          text-gray-400
        "
      >
        Pilot Corridor:
        San Luis ↔ City of San Fernando, Pampanga
      </p>
    </div>
  </div>
</template>