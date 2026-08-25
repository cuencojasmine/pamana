<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'driver']
})

useHead({
  title: 'Trip History | PAMANA'
})

const { apiFetch } = useApi()

interface CompletedTrip {
  documentId: string
  started_at: string
  route?: { origin: string; destination: string }
}

const rawTrips = ref<CompletedTrip[]>([])

const trips = computed(() =>
  rawTrips.value.map(trip => ({
    time: new Date(trip.started_at).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }),
    route: trip.route ? `${trip.route.origin} → ${trip.route.destination}` : '—',
    // Not tracked by the trip data model yet - shown as simulated in the disclaimer below.
    passengers: '—',
    fare: '—'
  }))
)

const completedTripsCount = computed(() => rawTrips.value.length)

async function loadTrips() {
  try {
    const response = await apiFetch<{ data: CompletedTrip[] }>('/api/trips', {
      query: {
        'filters[trip_status][$eq]': 'completed',
        populate: 'route',
        sort: 'started_at:desc'
      }
    })
    rawTrips.value = response.data
  } catch {
    rawTrips.value = []
  }
}

onMounted(() => {
  loadTrips()
})
</script>

<template>
  <div>
    <PamanaPageHeader title="Trip History" role="driver" />

    <div class="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
      <PamanaStatCard label="Today's earnings" value="₱1,330" tone="lime" icon="i-lucide-wallet" />
      <PamanaStatCard label="Completed trips" :value="completedTripsCount" icon="i-lucide-route" />
      <PamanaStatCard label="Online time" value="6h 25m" icon="i-lucide-clock" />
      <PamanaStatCard label="Passengers" value="36" icon="i-lucide-users" />
    </div>

    <UCard class="glass rounded-30 overflow-hidden" :ui="{ root: 'ring-0 rounded-30', body: 'p-0 sm:p-0' }">
      <div class="overflow-x-auto p-4 sm:p-5">
        <table class="data-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Route</th>
              <th>Passengers</th>
              <th>Fare</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="trip in trips" :key="`${trip.time}-${trip.route}`">
              <td>{{ trip.time }}</td>
              <td class="font-medium">{{ trip.route }}</td>
              <td>{{ trip.passengers }}</td>
              <td>{{ trip.fare }}</td>
              <td><span class="pill bg-lime-300/15 text-lime-700">Completed</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </UCard>

    <p class="mt-4 text-xs text-neutral-400">Time, route, and completed-trip count are live. Earnings, online time, and passenger counts are simulated prototype data (not yet tracked).</p>
  </div>
</template>
