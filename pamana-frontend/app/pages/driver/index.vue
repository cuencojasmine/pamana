<script setup lang="ts">
//@ts-nocheck
definePageMeta({
  middleware: ["auth", "driver"],
});

const { user, role, logout } = useAuth();
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="font-display text-2xl font-bold text-white">
        Driver Dashboard
      </h1>

      <p class="mt-2 text-white/50">
        PAMANA Driver Workspace
      </p>
    </div>

    <UCard class="glass glow-lime rounded-3xl" :ui="{ root: 'ring-0 rounded-3xl', body: 'relative z-10' }">
      <div class="space-y-3 text-white/80">
        <p>
          <strong class="text-white">User:</strong>
          {{ user?.username }}
        </p>

        <p>
          <strong class="text-white">Email:</strong>
          {{ user?.email }}
        </p>

        <p>
          <strong class="text-white">Role:</strong>
          {{ role }}
        </p>

        <UButton color="error" variant="soft" class="rounded-full" @click="logout"> Logout </UButton>
      </div>
    </UCard>
  </div>
</template>