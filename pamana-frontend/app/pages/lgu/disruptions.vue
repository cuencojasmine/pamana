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
      Disruptions
    </h1>

    <p class="mt-2 text-white/50">
      Flood, road closure, and route disruption
      management will appear here.
    </p>
  </div>
</template>