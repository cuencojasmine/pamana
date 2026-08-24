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
      Trip History
    </h1>

    <p class="mt-2 text-white/50">
      Completed driver trips will appear here.
    </p>
  </div>
</template>