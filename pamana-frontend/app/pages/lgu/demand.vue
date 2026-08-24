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
    <h1 class="text-2xl font-bold">
      Demand Analysis
    </h1>

    <p class="mt-2 text-gray-500">
      Passenger demand prediction and analysis
      will appear here.
    </p>
  </div>
</template>