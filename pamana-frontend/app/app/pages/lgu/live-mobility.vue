<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'lgu']
})

useHead({
  title: 'Live Mobility | PAMANA'
})

const { apiFetch } = useApi()
const { location: userLocation } = useGeolocation()

const cooperative = ref('All cooperatives')
const route = ref('All routes')

interface LiveVehicle {
  vehicle_id: number
  documentId: string
  plate_number: string
  speed: number | null
}

const rawVehicles = ref<LiveVehicle[]>([])

const vehicles = computed(() =>
  rawVehicles.value.map(vehicle => ({
    plate: vehicle.plate_number,
    speed: typeof vehicle.speed === 'number' && vehicle.speed > 0 ? `${vehicle.speed} km/h` : 'Stopped',
    status: typeof vehicle.speed === 'number' && vehicle.speed > 0 ? 'moving' : 'stopped'
  }))
)

let pollTimer: ReturnType<typeof setInterval> | undefined

async function loadLiveVehicles() {
  try {
    const response = await apiFetch<{ data: LiveVehicle[] }>('/api/live-vehicles')
    rawVehicles.value = response.data
  } catch {
    // Keep showing the last known list on a transient polling failure.
  }
}

onMounted(() => {
  loadLiveVehicles()
  pollTimer = setInterval(loadLiveVehicles, 5000)
})

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer)
})
</script>

<template>
  <div>
    <PamanaPageHeader title="Live Mobility" role="lgu" />

    <div class="grid gap-5 lg:grid-cols-3">
      <PamanaMapPanel
        class="lg:col-span-2"
        icon="i-lucide-map"
        label="Live fleet positions"
        height="460px"
        tone="teal"
        :markers="rawVehicles"
        :user-location="userLocation"
      >
        <template #overlay>
          <div class="absolute left-4 top-4 z-20 flex flex-wrap gap-2">
            <USelect v-model="cooperative" :items="['All cooperatives', 'San Luis Transport Coop', 'San Fernando Coop']" class="w-48" />
            <USelect v-model="route" :items="['All routes', 'SL–SF 01', 'SL–SF 04']" class="w-36" />
          </div>
        </template>

        <div class="pointer-events-none absolute right-4 bottom-4 z-20 glass-solid pill normal-case text-neutral-700">
          <UIcon name="i-lucide-map-pin" class="size-3.5 text-teal-600" />
          Live API positions
        </div>
      </PamanaMapPanel>

      <UCard class="glass rounded-30" :ui="{ root: 'ring-0 rounded-30' }">
        <div class="flex items-center justify-between">
          <h2 class="font-display text-sm font-semibold text-neutral-900">Vehicles on corridor</h2>
          <span class="pill bg-teal-100 text-teal-700">{{ vehicles.length }} live</span>
        </div>

        <div class="mt-4 max-h-[390px] divide-y divide-neutral-900/5 overflow-y-auto pr-1">
          <div v-for="vehicle in vehicles" :key="vehicle.plate" class="flex items-center justify-between gap-3 py-3 first:pt-0">
            <span class="flex items-center gap-2 text-sm font-medium text-neutral-700">
              <span class="flex size-8 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
                <UIcon name="i-lucide-bus-front" class="size-4" />
              </span>
              {{ vehicle.plate }}
            </span>
            <span class="text-xs" :class="vehicle.status === 'stopped' ? 'text-amber-600' : 'text-neutral-400'">{{ vehicle.speed }}</span>
          </div>
        </div>
      </UCard>
    </div>

    <p class="mt-4 text-xs text-neutral-400">Vehicle list, speeds, and map positions use live API data when coordinates are available.</p>
  </div>
</template>
