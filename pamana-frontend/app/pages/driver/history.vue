<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'driver']
})

useHead({
  title: 'Trip History | PAMANA'
})

const trips = [
  { time: '8:30 AM', route: 'San Luis Terminal → SM City San Fernando', passengers: 12, fare: 420 },
  { time: '10:30 AM', route: 'SM City San Fernando → San Luis Terminal', passengers: 8, fare: 280 },
  { time: '12:45 PM', route: 'San Luis Public Market → Robinsons San Fernando', passengers: 10, fare: 450 },
  { time: '3:15 PM', route: 'Robinsons San Fernando → San Luis Public Market', passengers: 4, fare: 180 }
]
</script>

<template>
  <div>
    <PamanaPageHeader title="Trip History" role="driver" />

    <div class="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
      <PamanaStatCard label="Today's earnings" value="₱1,330" tone="lime" icon="i-lucide-wallet" />
      <PamanaStatCard label="Completed trips" value="8" icon="i-lucide-route" />
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
              <td>₱{{ trip.fare.toFixed(2) }}</td>
              <td><span class="pill bg-lime-300/15 text-lime-700">Completed</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </UCard>

    <p class="mt-4 text-xs text-neutral-400">Trip history is simulated prototype data.</p>
  </div>
</template>
