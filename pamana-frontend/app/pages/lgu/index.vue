<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'lgu']
})

useHead({
  title: 'Command Center | PAMANA'
})

const { apiFetch } = useApi()
const toast = useToast()

interface DashboardStop {
  stop_name: string
  expected_passengers: number | null
  demand_class: string | null
  status: 'ADEQUATE' | 'MONITOR' | 'SHORTAGE' | 'UNKNOWN'
}

interface DashboardSummary {
  wait_time: { predicted_wait_minutes: { low: number; high: number } | null }
  stops: DashboardStop[]
  shortage_count: number
  recommendations: { stop_name: string; message: string }[]
}

const dashboard = ref<DashboardSummary | null>(null)

const STATUS_LABEL: Record<string, string> = {
  ADEQUATE: 'Adequate',
  MONITOR: 'Monitor',
  SHORTAGE: 'Shortage',
  UNKNOWN: 'No data'
}

const stops = computed(() =>
  (dashboard.value?.stops ?? []).map((stop, index) => ({
    name: stop.stop_name,
    sequence: index + 1,
    expected: stop.expected_passengers,
    wait: dashboard.value?.wait_time.predicted_wait_minutes
      ? `${dashboard.value.wait_time.predicted_wait_minutes.low}-${dashboard.value.wait_time.predicted_wait_minutes.high} min`
      : '—',
    status: STATUS_LABEL[stop.status] ?? 'No data',
    rawStatus: stop.status
  }))
)

const totalExpectedPassengers = computed(() => {
  const values = (dashboard.value?.stops ?? [])
    .map(s => s.expected_passengers)
    .filter((v): v is number => typeof v === 'number')
  return values.length ? values.reduce((sum, v) => sum + v, 0) : null
})

const corridorStatus = computed(() => {
  const stopList = dashboard.value?.stops ?? []
  if (stopList.some(s => s.status === 'SHORTAGE')) return { label: 'Critical', tone: 'red' as const }
  if (stopList.some(s => s.status === 'MONITOR')) return { label: 'Moderate', tone: 'amber' as const }
  if (stopList.length === 0) return { label: 'No data', tone: 'neutral' as const }
  return { label: 'Adequate', tone: 'lime' as const }
})

const aiInsight = computed(() => {
  const first = dashboard.value?.recommendations?.[0]
  if (first) return first.message
  if (dashboard.value) return 'No shortages predicted right now — corridor supply looks adequate at every stop.'
  return 'Loading prediction data…'
})

const previewHour = ref(String(new Date().getHours()))
const HOUR_OPTIONS = Array.from({ length: 24 }, (_, h) => ({
  label: `${String(h).padStart(2, '0')}:00`,
  value: String(h)
}))

async function loadDashboard() {
  try {
    const response = await apiFetch<{ data: DashboardSummary }>('/api/pamana-ai/dashboard-summary', {
      query: { hour: previewHour.value }
    })
    dashboard.value = response.data
  } catch {
    dashboard.value = null
  }
}

watch(previewHour, loadDashboard)

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
  loadDashboard()
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
      <PamanaStatCard label="Passengers waiting" :value="totalExpectedPassengers ?? '—'" icon="i-lucide-users" />
      <PamanaStatCard label="Corridor status" :value="corridorStatus.label" :tone="corridorStatus.tone" icon="i-lucide-activity" />
      <PamanaStatCard label="Active disruptions" value="1" tone="red" icon="i-lucide-triangle-alert" />
    </div>

    <div class="mb-5 grid gap-5 lg:grid-cols-3">
      <UCard class="glass rounded-30 lg:col-span-2" :ui="{ root: 'ring-0 rounded-30' }">
        <div class="flex items-center justify-between gap-3">
          <h2 class="font-display text-sm font-semibold text-neutral-900">Stop-by-Stop Supply Table</h2>
          <div class="flex items-center gap-2">
            <USelect v-model="previewHour" :items="HOUR_OPTIONS" class="w-28" />
            <span class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-teal-100 text-teal-700">
              <UIcon name="i-lucide-map" class="size-4" />
            </span>
          </div>
        </div>
        <p class="mt-1 text-xs text-neutral-400">Predicted demand for the selected hour — defaults to now.</p>

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
                    :class="{
                      'bg-lime-300/15 text-lime-700': stop.rawStatus === 'ADEQUATE',
                      'bg-amber-100 text-amber-700': stop.rawStatus === 'MONITOR',
                      'bg-red-100 text-red-600': stop.rawStatus === 'SHORTAGE',
                      'bg-neutral-100 text-neutral-500': stop.rawStatus === 'UNKNOWN'
                    }"
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
            {{ aiInsight }}
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

    <p class="mt-4 text-xs text-neutral-400">Active vehicle count, Fleet & Driver Management, the Supply Table, and AI Insight are live from PAMANA's prediction models (built on seeded demo data for the pilot corridor). System parameters and passenger reports remain simulated.</p>
  </div>
</template>
