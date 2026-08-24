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
      Disruptions
    </h1>

    <p class="mt-2 text-gray-500">
      Flood, road closure, and route disruption
      management will appear here.
    </p>
  </div>
</template>