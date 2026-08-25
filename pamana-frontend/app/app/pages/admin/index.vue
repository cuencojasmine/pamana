<script setup lang="ts">
import type { StrapiListResponse } from '~/types'

definePageMeta({
  middleware: ['auth', 'admin']
})

useHead({
  title: 'Administrator Dashboard | PAMANA'
})

const { apiFetch } = useApi()
const { user, role } = useAuth()

const quickLinks = [
  { label: 'Manage routes', icon: 'i-lucide-route', to: '/admin/routes' },
  { label: 'Manage vehicles', icon: 'i-lucide-bus-front', to: '/admin/vehicles' },
  { label: 'Manage users', icon: 'i-lucide-users', to: '/admin/users' }
]

const counts = reactive({
  routes: 0,
  vehicles: 0,
  drivers: 0,
  cooperatives: 0
})

const stats = computed(() => [
  { label: 'Active routes', value: counts.routes, icon: 'i-lucide-route' },
  { label: 'Registered vehicles', value: counts.vehicles, icon: 'i-lucide-bus-front' },
  { label: 'Drivers', value: counts.drivers, icon: 'i-lucide-id-card' },
  { label: 'Cooperatives', value: counts.cooperatives, icon: 'i-lucide-building-2' }
])

async function loadCounts() {
  const countOf = async (endpoint: string) => {
    try {
      const response = await apiFetch<StrapiListResponse<unknown>>(endpoint, {
        query: { 'pagination[pageSize]': 1 }
      })
      return response.meta.pagination.total
    } catch {
      return 0
    }
  }

  const [routes, vehicles, drivers, cooperatives] = await Promise.all([
    countOf('/api/routes'),
    countOf('/api/vehicles'),
    countOf('/api/drivers'),
    countOf('/api/cooperatives')
  ])

  counts.routes = routes
  counts.vehicles = vehicles
  counts.drivers = drivers
  counts.cooperatives = cooperatives
}

onMounted(() => {
  loadCounts()
})
</script>

<template>
  <div>
    <PamanaPageHeader title="Administrator Dashboard" role="admin" />

    <div class="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
      <UCard
        v-for="stat in stats"
        :key="stat.label"
        class="glass glow-lime card-lift rounded-30"
        :ui="{ root: 'ring-0 rounded-30', body: 'relative z-10' }"
      >
        <UIcon :name="stat.icon" class="mb-2 size-5 text-green-800" />
        <p class="stat-num text-2xl text-neutral-900">{{ stat.value }}</p>
        <p class="text-xs text-neutral-400">{{ stat.label }}</p>
      </UCard>
    </div>

    <div class="grid gap-5 lg:grid-cols-3">
      <UCard class="glass rounded-30 lg:col-span-2" :ui="{ root: 'ring-0 rounded-30' }">
        <div class="flex items-center justify-between gap-3">
          <h2 class="font-display text-sm font-semibold text-neutral-900">System account</h2>
          <span class="pill bg-green-100 text-green-800">Administrator</span>
        </div>

        <div class="mt-4 grid gap-3 text-sm text-neutral-700 sm:grid-cols-3">
          <div class="rounded-2xl bg-neutral-900/[0.035] p-3">
            <p class="text-[11px] text-neutral-400">User</p>
            <p class="mt-1 truncate font-semibold text-neutral-900">{{ user?.username }}</p>
          </div>
          <div class="rounded-2xl bg-neutral-900/[0.035] p-3">
            <p class="text-[11px] text-neutral-400">Email</p>
            <p class="mt-1 truncate font-semibold text-neutral-900">{{ user?.email }}</p>
          </div>
          <div class="rounded-2xl bg-neutral-900/[0.035] p-3">
            <p class="text-[11px] text-neutral-400">Role</p>
            <p class="mt-1 truncate font-semibold text-neutral-900">{{ role }}</p>
          </div>
        </div>
      </UCard>

      <UCard class="glass rounded-30" :ui="{ root: 'ring-0 rounded-30' }">
        <h2 class="font-display text-sm font-semibold text-neutral-900">Quick links</h2>
        <div class="mt-3 space-y-2">
          <NuxtLink
            v-for="link in quickLinks"
            :key="link.to"
            :to="link.to"
            class="flex items-center gap-2 rounded-xl px-2 py-2 text-sm text-neutral-600 hover:bg-neutral-900/[0.04] hover:text-neutral-900"
          >
            <UIcon :name="link.icon" class="size-4 text-green-800" />
            {{ link.label }}
            <UIcon name="i-lucide-chevron-right" class="ml-auto size-3.5 text-neutral-300" />
          </NuxtLink>
        </div>
      </UCard>
    </div>

    <p class="mt-4 text-xs text-neutral-400">Summary counts are live from the transportation master data.</p>
  </div>
</template>
