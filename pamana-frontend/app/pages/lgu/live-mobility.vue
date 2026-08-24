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
      Live Mobility
    </h1>

    <p class="mt-2 text-gray-500">
      Live transportation monitoring will be
      developed in later hackathon priorities.
    </p>
  </div>
</template>