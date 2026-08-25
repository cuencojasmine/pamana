<script setup lang="ts">
// Start the shared GPS watcher as soon as the client app opens. All Leaflet
// maps consume this same location through PamanaMapPanel.
useGeolocation()
</script>

<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
