<script setup lang="ts">
//@ts-nocheck
definePageMeta({
  middleware: [
    'auth',
    'lgu'
  ]
})
</script>

<template>
  <div>
    <h1 class="font-display text-2xl font-bold text-neutral-900">
      Demand Analysis
    </h1>

    <p class="mt-2 text-neutral-500">
      Passenger demand prediction and analysis
      will appear here.
    </p>
  </div>
</template>