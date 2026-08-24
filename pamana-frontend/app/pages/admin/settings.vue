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
      <p class="text-sm font-medium text-lime-300">
        System Administration
      </p>

      <h1 class="mt-1 font-display text-3xl font-bold tracking-tight text-white">
        Settings
      </h1>

      <p class="mt-2 text-white/50">
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
          class="mb-4 size-12 text-lime-300"
        />

        <h2 class="font-display text-lg font-semibold text-white">
          System Settings
        </h2>

        <p class="mt-2 max-w-md text-sm text-white/50">
          Prediction thresholds, simulation settings, system preferences,
          and administrative configuration will be developed in later phases.
        </p>

        <UBadge
          class="mt-4 bg-white/10 text-white/70"
          variant="soft"
        >
          Coming Soon
        </UBadge>
      </div>
    </UCard>
  </div>
</template>