<script setup lang="ts">
//@ts-nocheck
definePageMeta({
  middleware: [
    'auth',
    'admin'
  ]
})

useHead({
  title: 'Drivers | PAMANA'
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <p class="text-sm font-medium text-primary">
        Transportation Management
      </p>

      <h1 class="mt-1 text-3xl font-bold tracking-tight">
        Drivers
      </h1>

      <p class="mt-2 text-gray-500 dark:text-gray-400">
        Manage PAMANA driver accounts and transportation assignments.
      </p>
    </div>

    <UCard>
      <div class="flex flex-col items-center justify-center py-12 text-center">
        <UIcon
          name="i-lucide-id-card"
          class="mb-4 size-12 text-primary"
        />

        <h2 class="text-lg font-semibold">
          Driver Management
        </h2>

        <p class="mt-2 max-w-md text-sm text-gray-500">
          Driver profiles, account status, cooperative assignment,
          route assignment, and vehicle assignment will be developed
          in Hackathon Priority 3.
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