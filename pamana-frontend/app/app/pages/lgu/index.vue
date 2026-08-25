<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'lgu']
})

useHead({
  title: 'Command Center | PAMANA'
})

const { apiFetch } = useApi()
const toast = useToast()

const stops = [
  { name: 'Adquisian', sequence: 1, expected: 320, wait: '10 min', status: 'Adequate' },
  { name: 'San Luis Central Terminal', sequence: 2, expected: 305, wait: '10 min', status: 'Adequate' },
  { name: 'Santo Tomas Stop', sequence: 3, expected: 400, wait: '15 min', status: 'Shortage' },
  { name: 'OGC Stop', sequence: 4, expected: 220, wait: '12 min', status: 'Shortage' }
]

interface FleetVehicle {
  documentId: string
  plate_number: string
  vehicle_type: string
  vehicle_status: string
  cooperative?: { name: string }
  driver?: { first_name: string; last_name: string }
}

const rawFleet = ref<FleetVehicle[]>([])
const activeVehicleCount = ref(0)

const fleet = computed(() =>
  rawFleet.value.map(vehicle => ({
    plate: vehicle.plate_number,
    cooperative: vehicle.cooperative?.name ?? '—',
    type: vehicle.vehicle_type,
    driver: vehicle.driver ? `${vehicle.driver.first_name} ${vehicle.driver.last_name}` : 'Unassigned',
    status: vehicle.vehicle_status === 'offline' ? 'Idle' : 'Active'
  }))
)

async function loadFleet() {
  try {
    const response = await apiFetch<{ data: FleetVehicle[] }>('/api/vehicles', {
      query: { populate: 'cooperative,driver' }
    })
    rawFleet.value = response.data
  } catch {
    rawFleet.value = []
  }
}

async function loadActiveVehicleCount() {
  try {
    const response = await apiFetch<{ data: unknown[] }>('/api/live-vehicles')
    activeVehicleCount.value = response.data.length
  } catch {
    activeVehicleCount.value = 0
  }
}

function dispatchAlert() {
  toast.add({
    title: 'Dispatch alert prepared',
    description: 'Cooperative dispatch messaging will activate when the notification module is connected.',
    color: 'success'
  })
}

onMounted(() => {
  loadFleet()
  loadActiveVehicleCount()
})
</script>

<template>
  <div>
    <PamanaPageHeader
      title="Command Center"
      role="lgu"
      subtitle="San Luis → City of San Fernando Corridor · Pampanga LGU Transport Division"
    />

    <div class="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
      <PamanaStatCard label="Active vehicles" :value="activeVehicleCount" icon="i-lucide-bus-front" />
      <PamanaStatCard label="Passengers waiting" value="142" icon="i-lucide-users" />
      <PamanaStatCard label="Corridor status" value="Moderate" tone="amber" icon="i-lucide-activity" />
      <PamanaStatCard label="Active disruptions" value="1" tone="red" icon="i-lucide-triangle-alert" />
    </div>

    <div class="mb-5 grid gap-5 lg:grid-cols-3">
      <UCard class="glass rounded-30 lg:col-span-2" :ui="{ root: 'ring-0 rounded-30' }">
        <div class="flex items-center justify-between gap-3">
          <h2 class="font-display text-sm font-semibold text-neutral-900">Stop-by-Stop Supply Table</h2>
          <span class="flex size-8 items-center justify-center rounded-lg bg-teal-100 text-teal-700">
            <UIcon name="i-lucide-map" class="size-4" />
          </span>
        </div>

        <PamanaMapPanel class="mt-4" icon="i-lucide-map" label="Corridor supply overview" height="160px" tone="teal" />

        <div class="mt-4 overflow-x-auto">
          <table class="data-table">
            <thead>
              <tr>
                <th>Stop</th>
                <th>Seq.</th>
                <th>Expected</th>
                <th>Wait time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="stop in stops" :key="stop.name">
                <td class="font-medium">{{ stop.name }}</td>
                <td>{{ stop.sequence }}</td>
                <td>{{ stop.expected }}</td>
                <td>{{ stop.wait }}</td>
                <td>
                  <span
                    class="pill"
                    :class="stop.status === 'Adequate' ? 'bg-lime-300/15 text-lime-700' : 'bg-amber-100 text-amber-700'"
                  >
                    {{ stop.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </UCard>

      <div class="space-y-4">
        <UCard class="glass glow-teal rounded-30" :ui="{ root: 'ring-0 rounded-30', body: 'relative z-10' }">
          <h2 class="flex items-center gap-1.5 font-display text-sm font-semibold text-neutral-900">
            <UIcon name="i-lucide-brain-circuit" class="size-4 text-teal-600" />
            PAMANA AI Insight
          </h2>
          <p class="mt-3 text-xs leading-relaxed text-neutral-500">
            Predicted passenger surge at San Luis Terminal, 7:00–8:00 AM. Recommend dispatching 3 additional vehicles and alerting cooperatives.
          </p>
          <UButton block class="mt-4 rounded-full text-xs font-semibold text-neutral-950" @click="dispatchAlert">
            Dispatch Alert to Cooperative
          </UButton>
        </UCard>

        <UCard class="glass rounded-30" :ui="{ root: 'ring-0 rounded-30' }">
          <h2 class="font-display text-sm font-semibold text-neutral-900">Passenger reports</h2>
          <div class="mt-3 space-y-3 text-xs">
            <div class="flex items-center justify-between gap-3">
              <span class="text-neutral-600">Flood · Santo Tomas</span>
              <span class="pill bg-red-100 text-red-600">High</span>
            </div>
            <div class="flex items-center justify-between gap-3">
              <span class="text-neutral-600">Road clear · OGC</span>
              <span class="pill bg-lime-300/15 text-lime-700">Info</span>
            </div>
          </div>
        </UCard>
      </div>
    </div>

    <div class="grid gap-5 lg:grid-cols-3">
      <UCard class="glass rounded-30 lg:col-span-2" :ui="{ root: 'ring-0 rounded-30' }">
        <h2 class="font-display text-sm font-semibold text-neutral-900">Fleet & Driver Management</h2>
        <div class="mt-4 overflow-x-auto">
          <table class="data-table">
            <thead><tr><th>Plate</th><th>Cooperative</th><th>Type</th><th>Driver</th><th>Status</th></tr></thead>
            <tbody>
              <tr v-for="vehicle in fleet" :key="vehicle.plate">
                <td class="font-medium">{{ vehicle.plate }}</td>
                <td>{{ vehicle.cooperative }}</td>
                <td>{{ vehicle.type }}</td>
                <td>{{ vehicle.driver }}</td>
                <td>
                  <span class="pill" :class="vehicle.status === 'Active' ? 'bg-lime-300/15 text-lime-700' : 'bg-neutral-100 text-neutral-500'">
                    {{ vehicle.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </UCard>

      <UCard class="glass rounded-30" :ui="{ root: 'ring-0 rounded-30' }">
        <h2 class="font-display text-sm font-semibold text-neutral-900">System Parameters</h2>
        <div class="mt-4 space-y-5 text-xs">
          <div>
            <div class="mb-1.5 flex justify-between"><span>High-demand threshold</span><span class="font-semibold">10</span></div>
            <div class="h-1.5 rounded-full bg-neutral-900/[0.06]"><div class="h-full w-3/4 rounded-full bg-teal-500" /></div>
          </div>
          <div>
            <div class="mb-1.5 flex justify-between"><span>Wait-time sensitivity</span><span class="font-semibold">10</span></div>
            <div class="h-1.5 rounded-full bg-neutral-900/[0.06]"><div class="h-full w-1/2 rounded-full bg-teal-500" /></div>
          </div>
        </div>
      </UCard>
    </div>

    <p class="mt-4 text-xs text-neutral-400">Active vehicle count and Fleet & Driver Management are live. Supply table, AI insight, system parameters, and passenger reports remain simulated until the PAMANA intelligence models are connected.</p>
  </div>
</template>
