<script setup lang="ts">
//@ts-nocheck
definePageMeta({
  middleware: ["auth", "passenger"],
});

const { user } = useAuth();
</script>

<template>
  <div class="space-y-6">
    <div>
      <p class="text-sm font-medium text-primary">Passenger</p>

      <h1 class="mt-1 text-3xl font-bold tracking-tight">
        Welcome, {{ user?.username }}
      </h1>

      <p class="mt-2 text-gray-500 dark:text-gray-400">
        Plan your trip and check transportation availability across the PAMANA
        pilot corridor.
      </p>
    </div>

    <div class="grid gap-4 md:grid-cols-3">
      <UCard>
        <div>
          <UIcon name="i-lucide-route" class="mb-3 size-8 text-primary" />

          <h2 class="font-semibold">Plan a Trip</h2>

          <p class="mt-1 text-sm text-gray-500">
            Compare transportation options.
          </p>
        </div>

        <template #footer>
          <UButton to="/passenger/trip-planner" variant="soft" block>
            Open Trip Planner
          </UButton>
        </template>
      </UCard>

      <UCard>
        <div>
          <UIcon name="i-lucide-map" class="mb-3 size-8 text-primary" />

          <h2 class="font-semibold">Live Map</h2>

          <p class="mt-1 text-sm text-gray-500">
            View routes and active vehicles.
          </p>
        </div>

        <template #footer>
          <UButton to="/passenger/map" variant="soft" block> Open Map </UButton>
        </template>
      </UCard>

      <UCard>
        <div>
          <UIcon
            name="i-lucide-message-square-warning"
            class="mb-3 size-8 text-primary"
          />

          <h2 class="font-semibold">Report Conditions</h2>

          <p class="mt-1 text-sm text-gray-500">
            Help improve PAMANA's transport data.
          </p>
        </div>

        <template #footer>
          <UButton to="/passenger/reports" variant="soft" block>
            My Reports
          </UButton>
        </template>
      </UCard>
    </div>
  </div>
</template>
