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
    <h1 class="text-2xl font-bold">
      My Reports
    </h1>

    <p class="mt-2 text-gray-500">
      Passenger crowdsourcing will be developed
      in Hackathon Priority 8.
    </p>
  </div>
</template>