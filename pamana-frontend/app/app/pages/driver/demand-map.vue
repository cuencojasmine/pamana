<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'driver']
})

useHead({
  title: 'Demand Map | PAMANA'
})

const demandStops = [
  { name: 'San Luis Central Terminal', waiting: 320, tone: 'red' },
  { name: 'Santo Tomas Stop', waiting: 305, tone: 'red' },
  { name: 'OGC Stop', waiting: 400, tone: 'amber' },
  { name: 'Santos Cooperative', waiting: 220, tone: 'lime' }
]
</script>

<template>
  <div>
    <PamanaPageHeader title="Demand Map" role="driver" />

    <div class="grid gap-5 lg:grid-cols-3">
      <PamanaMapPanel
        class="lg:col-span-2"
        icon="i-lucide-map-pinned"
        label="Predicted passenger demand by stop"
        height="420px"
        tone="emerald"
      >
        <template #overlay>
          <span class="glass-solid pill absolute right-4 top-4 z-20 normal-case text-neutral-700">
            <UIcon name="i-lucide-brain-circuit" class="size-3.5 text-lime-600" />
            AI-predicted demand
          </span>
        </template>

        <span class="absolute left-[25%] top-[30%] size-16 rounded-full bg-red-400/25 ring-2 ring-red-400/30" />
        <span class="absolute right-[30%] top-[52%] size-20 rounded-full bg-amber-400/25 ring-2 ring-amber-400/30" />
      </PamanaMapPanel>

      <UCard class="glass rounded-30" :ui="{ root: 'ring-0 rounded-30' }">
        <h2 class="font-display text-sm font-semibold text-neutral-900">Predicted waiting passengers</h2>
        <div class="mt-4 space-y-4">
          <div v-for="stop in demandStops" :key="stop.name" class="flex items-center justify-between gap-3 text-sm">
            <span class="text-neutral-700">{{ stop.name }}</span>
            <span
              class="pill shrink-0 normal-case"
              :class="{
                'bg-red-100 text-red-600': stop.tone === 'red',
                'bg-amber-100 text-amber-700': stop.tone === 'amber',
                'bg-lime-300/15 text-lime-700': stop.tone === 'lime'
              }"
            >
              {{ stop.waiting }} waiting
            </span>
          </div>
        </div>

        <p class="mt-5 rounded-2xl bg-lime-300/10 p-3 text-xs leading-relaxed text-neutral-500">
          Consider dispatching toward OGC Stop next — it has the highest predicted demand this hour.
        </p>
      </UCard>
    </div>

    <p class="mt-4 text-xs text-neutral-400">Demand values are simulated until the PAMANA intelligence model is connected.</p>
  </div>
</template>
