<script setup lang="ts">
//@ts-nocheck
definePageMeta({
  middleware: ["auth", "lgu"],
});

const { user, role, logout } = useAuth();
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold">LGU Dashboard</h1>

    <p class="mt-2 text-gray-500">PAMANA LGU Workspace</p>

    <UCard>
      <div class="space-y-3">
        <p>
          <strong>User:</strong>
          {{ user?.username }}
        </p>

        <p>
          <strong>Email:</strong>
          {{ user?.email }}
        </p>

        <p>
          <strong>Role:</strong>
          {{ role }}
        </p>

        <UButton color="error" variant="soft" @click="logout"> Logout </UButton>
      </div>
    </UCard>
  </div>
</template>
