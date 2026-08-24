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
      <p class="text-sm font-medium text-primary">
        System Administration
      </p>

      <h1 class="mt-1 text-3xl font-bold tracking-tight">
        Settings
      </h1>

      <p class="mt-2 text-gray-500 dark:text-gray-400">
        Configure system-wide PAMANA behavior and operational settings.
      </p>
    </div>

    <UCard>
      <div class="flex flex-col items-center justify-center py-12 text-center">
        <UIcon
          name="i-lucide-settings"
          class="mb-4 size-12 text-primary"
        />

        <h2 class="text-lg font-semibold">
          System Settings
        </h2>

        <p class="mt-2 max-w-md text-sm text-gray-500">
          Prediction thresholds, simulation settings, system preferences,
          and administrative configuration will be developed in later phases.
        </p>

        <UBadge
          class="mt-4"
          color="neutral"
          variant="soft"
        >
          Coming Soon
        </UBadge>
      </div>
    </UCard>
  </div>
</template>