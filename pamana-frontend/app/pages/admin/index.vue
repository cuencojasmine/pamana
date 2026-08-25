<script setup lang="ts">
//@ts-nocheck
definePageMeta({
  middleware: ["auth", "admin"],
});

const { user, role, logout } = useAuth();
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="font-display text-2xl font-bold text-neutral-900">Administrator Dashboard</h1>

      <p class="mt-2 text-neutral-500">PAMANA System Administration</p>
    </div>

    <UCard class="glass glow-lime rounded-3xl" :ui="{ root: 'ring-0 rounded-3xl', body: 'relative z-10' }">
      <div class="space-y-3 text-neutral-700">
        <p>
          <strong class="text-neutral-900">User:</strong>
          {{ user?.username }}
        </p>

        <p>
          <strong class="text-neutral-900">Email:</strong>
          {{ user?.email }}
        </p>

        <p>
          <strong class="text-neutral-900">Role:</strong>
          {{ role }}
        </p>

        <UButton color="error" variant="soft" class="rounded-full" @click="logout"> Logout </UButton>
      </div>
    </UCard>
  </div>
</template>

<script lang="ts" setup></script>

<style></style>
