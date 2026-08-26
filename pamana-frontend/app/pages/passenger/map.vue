<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'passenger']
})

useHead({
  title: 'Live Map | PAMANA'
})

const { apiFetch } = useApi()
const { location: userLocation, error: locationError, loading: locationLoading } = useGeolocation()

const locationStatusLabel = computed(() => {
  if (userLocation.value) return 'Centered on your location'
  if (locationError.value) return 'Location unavailable'
  if (locationLoading.value) return 'Locating…'
  return 'Pilot corridor'
})

const nearbyStops = [
  { name: 'San Luis Central Terminal', wait: '3 min wait', tone: 'lime' },
  { name: 'Santo Tomas Stop', wait: '9 min wait', tone: 'amber' },
  { name: 'OGC Stop', wait: '5 min wait', tone: 'lime' }
]

interface LiveVehicle {
  vehicle_id: number
  documentId: string
  vehicle_number: string
  occupancy_level: string | null
  direction: string
}

const OCCUPANCY_LABELS: Record<string, string> = {
  empty: 'Empty',
  low: 'Low occupancy',
  moderate: 'Moderate occupancy',
  near_full: 'Near full',
  full: 'Full'
}

const rawVehicles = ref<LiveVehicle[]>([])

const vehicles = computed(() =>
  rawVehicles.value.map(vehicle => ({
    id: vehicle.vehicle_number,
    occupancy: vehicle.occupancy_level ? OCCUPANCY_LABELS[vehicle.occupancy_level] ?? vehicle.occupancy_level : 'Unknown occupancy',
    distance: vehicle.direction === 'inbound' ? 'Inbound' : 'Outbound'
  }))
)

let pollTimer: ReturnType<typeof setInterval> | undefined

async function loadNearbyVehicles() {
  try {
    const response = await apiFetch<{ data: LiveVehicle[] }>('/api/live-vehicles')
    rawVehicles.value = response.data
  } catch {
    // Keep the last known list on a transient polling failure.
  }
}

onMounted(() => {
  loadNearbyVehicles()
  pollTimer = setInterval(loadNearbyVehicles, 5000)
})

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer)
})
</script>

<template>
  <div>
    <PamanaPageHeader title="Live Map" role="passenger" />

    <div class="grid gap-5 lg:grid-cols-3">
      <PamanaMapPanel
        class="lg:col-span-2"
        icon="i-lucide-map"
        label="San Luis ↔ San Fernando corridor"
        height="460px"
        tone="lime"
        :markers="rawVehicles"
        :user-location="userLocation"
      >
        <template #overlay>
          <div class="absolute left-4 right-4 top-4 z-20 flex flex-wrap gap-2">
            <span class="glass-solid pill normal-case text-neutral-700">
              <span class="badge-dot bg-lime-500" /> Available
            </span>
            <span class="glass-solid pill normal-case text-neutral-700">
              <span class="badge-dot bg-amber-500" /> Near full
            </span>
            <span class="glass-solid pill normal-case text-neutral-700">
              <span class="badge-dot bg-red-500" /> Full
            </span>
          </div>

          <div class="glass-solid absolute bottom-4 left-4 z-20 flex items-center gap-1.5 rounded-2xl px-3 py-2 text-xs font-semibold text-neutral-700">
            <UIcon name="i-lucide-crosshair" class="size-3.5 text-lime-600" />
            Centered on pilot corridor
          </div>
        </template>

        <span class="pointer-events-none absolute right-4 bottom-4 z-20 glass-solid pill normal-case text-neutral-700">
          <UIcon name="i-lucide-crosshair" class="size-3.5 text-lime-600" />
          {{ locationStatusLabel }}
        </span>
      </PamanaMapPanel>

      <div class="space-y-3">
        <UCard class="glass rounded-30" :ui="{ root: 'ring-0 rounded-30' }">
          <h2 class="font-display text-sm font-semibold text-neutral-900">Nearby stops</h2>
          <div class="mt-3 divide-y divide-neutral-900/5">
            <div v-for="stop in nearbyStops" :key="stop.name" class="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
              <span class="text-sm text-neutral-700">{{ stop.name }}</span>
              <span
                class="pill shrink-0 normal-case"
                :class="stop.tone === 'amber' ? 'bg-amber-100 text-amber-700' : 'bg-lime-300/15 text-lime-700'"
              >
                {{ stop.wait }}
              </span>
            </div>
          </div>
        </UCard>

        <UCard class="glass glow-lime rounded-30" :ui="{ root: 'ring-0 rounded-30', body: 'relative z-10' }">
          <h2 class="font-display text-sm font-semibold text-neutral-900">Active vehicles nearby</h2>
          <div class="mt-3 space-y-3">
            <div v-for="vehicle in vehicles" :key="vehicle.id" class="flex items-start gap-2 text-sm">
              <span class="flex size-8 shrink-0 items-center justify-center rounded-xl bg-lime-300/15">
                <UIcon name="i-lucide-bus-front" class="size-4 text-lime-600" />
              </span>
              <div>
                <p class="font-semibold text-neutral-800">{{ vehicle.id }} · {{ vehicle.occupancy }}</p>
                <p class="text-xs text-neutral-400">{{ vehicle.distance }}</p>
              </div>
            </div>
          </div>
        </UCard>

        <p class="px-2 text-xs leading-relaxed text-neutral-400">
          Active vehicle list and map positions use the live API data when coordinates are available.
        </p>
      </div>
    </div>
  </div>
</template>
