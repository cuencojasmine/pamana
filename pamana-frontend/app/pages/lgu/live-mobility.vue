<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'lgu']
})

useHead({
  title: 'Live Mobility | PAMANA'
})

const cooperative = ref('All cooperatives')
const route = ref('All routes')

const vehicles = [
  { plate: 'NAA-1234', speed: '42 km/h', status: 'moving' },
  { plate: 'NAA-1235', speed: '18 km/h', status: 'moving' },
  { plate: 'NAA-1236', speed: 'Stopped', status: 'stopped' },
  { plate: 'NAA-1240', speed: '35 km/h', status: 'moving' },
  { plate: 'NAA-1242', speed: '28 km/h', status: 'moving' }
]
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
      >
        <template #overlay>
          <div class="absolute left-4 top-4 z-20 flex flex-wrap gap-2">
            <USelect v-model="cooperative" :items="['All cooperatives', 'San Luis Transport Coop', 'San Fernando Coop']" class="w-48" />
            <USelect v-model="route" :items="['All routes', 'SL–SF 01', 'SL–SF 04']" class="w-36" />
          </div>
        </template>

        <span class="absolute left-[25%] top-[40%] flex size-8 items-center justify-center rounded-full border-2 border-white bg-teal-500 shadow-lg">
          <UIcon name="i-lucide-bus-front" class="size-4 text-white" />
        </span>
        <span class="absolute right-[25%] top-[58%] flex size-8 items-center justify-center rounded-full border-2 border-white bg-teal-500 shadow-lg">
          <UIcon name="i-lucide-bus-front" class="size-4 text-white" />
        </span>
      </PamanaMapPanel>

      <UCard class="glass rounded-30" :ui="{ root: 'ring-0 rounded-30' }">
        <div class="flex items-center justify-between">
          <h2 class="font-display text-sm font-semibold text-neutral-900">Vehicles on corridor</h2>
          <span class="pill bg-teal-100 text-teal-700">24 live</span>
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

    <p class="mt-4 text-xs text-neutral-400">Vehicle positions and speeds are simulated until live GPS telemetry is connected.</p>
  </div>
</template>
