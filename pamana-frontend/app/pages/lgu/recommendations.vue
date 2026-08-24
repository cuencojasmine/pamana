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
      PAMANA Recommendations
    </h1>

    <p class="mt-2 text-white/50">
      AI-enabled transportation recommendations
      will appear here.
    </p>
  </div>
</template>