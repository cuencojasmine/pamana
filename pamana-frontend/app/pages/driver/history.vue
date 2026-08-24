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
    <h1 class="text-2xl font-bold">
      Trip History
    </h1>

    <p class="mt-2 text-gray-500">
      Completed driver trips will appear here.
    </p>
  </div>
</template>