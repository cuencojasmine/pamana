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
      PAMANA Recommendations
    </h1>

    <p class="mt-2 text-gray-500">
      AI-enabled transportation recommendations
      will appear here.
    </p>
  </div>
</template>