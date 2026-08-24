<script setup lang="ts">
//@ts-nocheck
definePageMeta({
  middleware: [
    'auth',
    'admin'
  ]
})

useHead({
  title: 'Cooperatives | PAMANA'
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <p class="text-sm font-medium text-primary">
        Transportation Management
      </p>

      <h1 class="mt-1 text-3xl font-bold tracking-tight">
        Cooperatives
      </h1>

      <p class="mt-2 text-gray-500 dark:text-gray-400">
        Manage transport cooperatives participating in the PAMANA network.
      </p>
    </div>

    <UCard>
      <div class="flex flex-col items-center justify-center py-12 text-center">
        <UIcon
          name="i-lucide-building-2"
          class="mb-4 size-12 text-primary"
        />

        <h2 class="text-lg font-semibold">
          Cooperative Management
        </h2>

        <p class="mt-2 max-w-md text-sm text-gray-500">
          Cooperative profiles, contact information, status,
          assigned drivers, and vehicle relationships will be added
          during the transportation management stages.
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