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
      Live Map
    </h1>

    <p class="mt-2 text-gray-500">
      Map and vehicle visualization will be developed
      in Hackathon Priorities 5 and 7.
    </p>
  </div>
</template>