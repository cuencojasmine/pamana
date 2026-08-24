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
    <h1 class="font-display text-2xl font-bold text-white">
      Live Mobility
    </h1>

    <p class="mt-2 text-white/50">
      Live transportation monitoring will be
      developed in later hackathon priorities.
    </p>
  </div>
</template>