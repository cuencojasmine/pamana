<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'lgu']
})

useHead({
  title: 'Demand Analysis | PAMANA'
})

const chart = [
  { time: '6AM', predicted: 60, observed: 45 },
  { time: '7AM', predicted: 95, observed: 88 },
  { time: '8AM', predicted: 80, observed: 70 },
  { time: '9AM', predicted: 40, observed: 38 },
  { time: '12PM', predicted: 55, observed: 60 },
  { time: '5PM', predicted: 70, observed: 75 }
]

const observations = [
  { stop: 'San Luis Central Terminal', slot: '7:00–8:00 AM', observed: 310, predicted: 320, source: 'Sensor' },
  { stop: 'Santo Tomas Stop', slot: '7:00–8:00 AM', observed: 295, predicted: 305, source: 'Passenger report' },
  { stop: 'OGC Stop', slot: '7:00–8:00 AM', observed: 410, predicted: 400, source: 'Sensor' }
]
</script>

<template>
  <div>
    <PamanaPageHeader title="Demand Analysis" role="lgu" />

    <div class="mb-5 grid gap-5 lg:grid-cols-3">
      <UCard class="glass rounded-30 lg:col-span-2" :ui="{ root: 'ring-0 rounded-30' }">
        <h2 class="font-display text-sm font-semibold text-neutral-900">
          Predicted vs. observed waiting passengers — today
        </h2>

        <div class="mt-5 flex h-56 items-end gap-2 sm:gap-3">
          <div v-for="point in chart" :key="point.time" class="flex h-full flex-1 flex-col justify-end gap-1">
            <div class="relative flex flex-1 items-end gap-1">
              <div class="w-1/2 rounded-t-lg bg-teal-500/25" :style="{ height: `${point.predicted}%` }" />
              <div class="w-1/2 rounded-t-lg bg-teal-500" :style="{ height: `${point.observed}%` }" />
            </div>
            <span class="text-center text-[10px] text-neutral-400">{{ point.time }}</span>
          </div>
        </div>

        <div class="mt-3 flex items-center gap-4 text-[11px] text-neutral-400">
          <span class="flex items-center gap-1"><span class="badge-dot bg-teal-500/35" />Predicted</span>
          <span class="flex items-center gap-1"><span class="badge-dot bg-teal-500" />Observed</span>
        </div>
      </UCard>

      <UCard class="glass glow-teal rounded-30" :ui="{ root: 'ring-0 rounded-30', body: 'relative z-10' }">
        <h2 class="font-display text-sm font-semibold text-neutral-900">Model confidence</h2>
        <p class="stat-num mt-3 text-3xl text-teal-700">87%</p>
        <p class="mt-1 text-xs leading-relaxed text-neutral-400">Prediction model v1.3 · updated 6 min ago</p>
        <div class="mt-4 h-2 w-full rounded-full bg-neutral-900/[0.06]"><div class="h-full w-[87%] rounded-full bg-teal-500" /></div>
        <span class="pill mt-4 bg-neutral-900/[0.05] text-neutral-500">Simulation source</span>
      </UCard>
    </div>

    <UCard class="glass rounded-30" :ui="{ root: 'ring-0 rounded-30' }">
      <div class="overflow-x-auto">
        <table class="data-table">
          <thead><tr><th>Stop</th><th>Time slot</th><th>Waiting (observed)</th><th>Predicted</th><th>Source</th></tr></thead>
          <tbody>
            <tr v-for="item in observations" :key="item.stop">
              <td class="font-medium">{{ item.stop }}</td>
              <td>{{ item.slot }}</td>
              <td>{{ item.observed }}</td>
              <td>{{ item.predicted }}</td>
              <td><span class="pill bg-teal-100 text-teal-700 normal-case">{{ item.source }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </UCard>
  </div>
</template>
