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
      Live Map
    </h1>

    <p class="mt-2 text-white/50">
      Map and vehicle visualization will be developed
      in Hackathon Priorities 5 and 7.
    </p>
  </div>
</template>