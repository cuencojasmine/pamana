<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'admin']
})

useHead({
  title: 'Users | PAMANA'
})

const toast = useToast()

const users = [
  { username: 'juan.delacruz', email: 'juan@mail.com', role: 'Passenger', joined: 'Mar 12, 2026', status: 'Active' },
  { username: 'mark.reyes', email: 'mark.reyes@email.com', role: 'Driver', joined: 'Mar 12, 2026', status: 'Active' },
  { username: 'lgu.pampanga', email: 'lgu@pampanga.gov.ph', role: 'LGU', joined: 'Jan 5, 2026', status: 'Active' },
  { username: 'admin.pampanga', email: 'admin@pamana.gov.ph', role: 'Administrator', joined: 'Jan 1, 2026', status: 'Active' }
]

function inviteUser() {
  toast.add({
    title: 'Invite flow ready',
    description: 'User invitations will activate when the administration endpoint is implemented.',
    color: 'neutral'
  })
}

function roleClasses(role: string) {
  if (role === 'Passenger') return 'bg-lime-100 text-lime-700'
  if (role === 'Driver') return 'bg-emerald-100 text-emerald-700'
  if (role === 'LGU') return 'bg-teal-100 text-teal-700'
  return 'bg-green-100 text-green-800'
}
</script>

<template>
  <div>
    <PamanaPageHeader title="Users" role="admin">
      <template #actions>
        <UButton icon="i-lucide-user-plus" class="rounded-full font-semibold text-neutral-950" @click="inviteUser">
          Invite User
        </UButton>
      </template>
    </PamanaPageHeader>

    <UCard class="glass rounded-30" :ui="{ root: 'ring-0 rounded-30' }">
      <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="font-display text-sm font-semibold text-neutral-900">Application users</h2>
          <p class="mt-1 text-xs text-neutral-400">Passenger, driver, LGU, and administrator accounts</p>
        </div>
        <span class="pill bg-neutral-900/[0.05] text-neutral-500">Prototype directory</span>
      </div>

      <div class="overflow-x-auto">
        <table class="data-table">
          <thead><tr><th>Username</th><th>Email</th><th>Role</th><th>Joined</th><th>Status</th></tr></thead>
          <tbody>
            <tr v-for="account in users" :key="account.username">
              <td class="font-medium">{{ account.username }}</td>
              <td>{{ account.email }}</td>
              <td><span class="pill" :class="roleClasses(account.role)">{{ account.role }}</span></td>
              <td>{{ account.joined }}</td>
              <td><span class="pill bg-lime-300/15 text-lime-700">{{ account.status }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </UCard>

    <p class="mt-4 text-xs text-neutral-400">The table is a labeled UI preview and is not yet connected to Strapi user administration.</p>
  </div>
</template>
