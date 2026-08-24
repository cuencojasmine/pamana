<script setup lang="ts">
//@ts-nocheck
definePageMeta({
  layout: false,
});

const { initialized, isAuthenticated, restoreSession, getRoleHomeRoute } =
  useAuth();

onMounted(async () => {
  if (!initialized.value) {
    await restoreSession();
  }

  if (isAuthenticated.value) {
    await navigateTo(getRoleHomeRoute());

    return;
  }

  await navigateTo("/login");
});
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950"
  >
    <div class="text-center">
      <div
        class="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-primary"
      />

      <p class="mt-4 text-sm text-gray-500">Loading PAMANA...</p>
    </div>
  </div>
</template>
