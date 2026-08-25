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
      My Reports
    </h1>

    <p class="mt-2 text-neutral-500">
      Passenger crowdsourcing will be developed
      in Hackathon Priority 8.
    </p>
  </div>
</template>