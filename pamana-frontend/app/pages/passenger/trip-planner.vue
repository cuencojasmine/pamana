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
    <h1 class="font-display text-2xl font-bold text-white">
      Trip Planner
    </h1>

    <p class="mt-2 text-white/50">
      Passenger trip planning will be developed
      in Hackathon Priority 4.
    </p>
  </div>
</template>