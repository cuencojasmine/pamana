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
    <h1 class="font-display text-2xl font-bold text-neutral-900">
      Demand Map
    </h1>

    <p class="mt-2 text-neutral-500">
      Driver-side passenger demand visualization
      will be added during later PAMANA intelligence phases.
    </p>
  </div>
</template>