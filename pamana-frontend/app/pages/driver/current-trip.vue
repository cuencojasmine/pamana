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
    <h1 class="font-display text-2xl font-bold text-white">
      Current Trip
    </h1>

    <p class="mt-2 text-white/50">
      Driver trip and GPS controls will be developed
      in Hackathon Priority 6.
    </p>
  </div>
</template>