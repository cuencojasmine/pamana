<script setup lang="ts">
//@ts-nocheck
definePageMeta({
  middleware: [
    'auth',
    'passenger'
  ]
})
</script>

<template>
  <div>
    <h1 class="font-display text-2xl font-bold text-neutral-900">
      Trip Planner
    </h1>

    <p class="mt-2 text-neutral-500">
      Passenger trip planning will be developed
      in Hackathon Priority 4.
    </p>
  </div>
</template>