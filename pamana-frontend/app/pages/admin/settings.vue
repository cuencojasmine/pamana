<script setup lang="ts">
//@ts-nocheck
definePageMeta({
  middleware: [
    'auth',
    'admin'
  ]
})

useHead({
  title: 'Settings | PAMANA'
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <p class="text-sm font-medium text-lime-600">
        System Administration
      </p>

      <h1 class="mt-1 font-display text-3xl font-bold tracking-tight text-neutral-900">
        Settings
      </h1>

      <p class="mt-2 text-neutral-500">
        Configure system-wide PAMANA behavior and operational settings.
      </p>
    </div>

    <UCard
      class="glass glow-lime rounded-3xl"
      :ui="{ root: 'ring-0 rounded-3xl', body: 'relative z-10' }"
    >
      <div class="flex flex-col items-center justify-center py-12 text-center">
        <UIcon
          name="i-lucide-settings"
          class="mb-4 size-12 text-lime-600"
        />

        <h2 class="font-display text-lg font-semibold text-neutral-900">
          System Settings
        </h2>

        <p class="mt-2 max-w-md text-sm text-neutral-500">
          Prediction thresholds, simulation settings, system preferences,
          and administrative configuration will be developed in later phases.
        </p>

        <UBadge
          class="!mt-4 !bg-neutral-900/[0.06] !text-neutral-600"
          variant="soft"
        >
          Coming Soon
        </UBadge>
      </div>
    </UCard>
  </div>
</template>