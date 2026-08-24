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
            text-white
          "
        >
          PAMANA
        </h1>

        <p
          class="
            mt-2
            text-sm
            text-white/50
          "
        >
          Pampanga AI-powered Mobility Access
          and Navigation Assistant
        </p>
      </div>

      <UCard class="glass glow-lime rounded-3xl" :ui="{ root: 'ring-0 rounded-3xl', header: 'border-white/10', footer: 'border-white/10' }">
        <template #header>
          <div class="relative z-10">
            <h2
              class="
                font-display
                text-xl
                font-semibold
                text-white
              "
            >
              Sign in
            </h2>

            <p
              class="
                mt-1
                text-sm
                text-white/50
              "
            >
              Enter your PAMANA account credentials.
            </p>
          </div>
        </template>

        <UForm
          :schema="schema"
          :state="state"
          class="relative z-10 space-y-5"
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
            class="font-semibold text-neutral-950"
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
          text-white/35
        "
      >
        Pilot Corridor:
        San Luis ↔ City of San Fernando, Pampanga
      </p>
    </div>
  </div>
</template>