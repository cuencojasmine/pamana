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
  <div class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <div
        class="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-neutral-900/10 border-t-lime-300"
      />

      <p class="mt-4 font-display text-sm text-neutral-500">Loading PAMANA...</p>
    </div>
  </div>
</template>
