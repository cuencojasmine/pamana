<script setup lang="ts">
//@ts-nocheck
definePageMeta({
  middleware: [
    'auth',
    'driver'
  ]
})
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold">
      Demand Map
    </h1>

    <p class="mt-2 text-gray-500">
      Driver-side passenger demand visualization
      will be added during later PAMANA intelligence phases.
    </p>
  </div>
</template>