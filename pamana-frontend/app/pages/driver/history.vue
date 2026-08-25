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
    <h1 class="font-display text-2xl font-bold text-neutral-900">
      Trip History
    </h1>

    <p class="mt-2 text-neutral-500">
      Completed driver trips will appear here.
    </p>
  </div>
</template>