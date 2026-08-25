<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'driver']
})

useHead({
  title: 'Current Trip | PAMANA'
})

const toast = useToast()
const occupancy = ref(12)
const capacity = 16

const stops = [
  { name: 'San Luis Central Terminal', detail: 'Departed 7:02 AM', state: 'done' },
  { name: 'Santo Tomas Stop', detail: 'Next · ETA 4 min', state: 'next' },
  { name: 'OGC Stop', detail: '', state: 'pending' },
  { name: 'SM City San Fernando', detail: '', state: 'pending' }
]

function changeOccupancy(amount: number) {
  occupancy.value = Math.min(capacity, Math.max(0, occupancy.value + amount))
}

function endTrip() {
  toast.add({
    title: 'End-trip control ready',
    description: 'This prototype keeps the trip active until the driver trip endpoint is connected.',
    color: 'warning'
  })
}
</script>

<template>
  <div>
    <PamanaPageHeader title="Current Trip" role="driver" />

    <div class="grid gap-5 lg:grid-cols-3">
      <PamanaMapPanel
        class="lg:col-span-2"
        icon="i-lucide-navigation"
        label="Live driver navigation"
        height="380px"
        tone="emerald"
      >
        <div class="absolute left-[28%] top-[34%] size-4 rounded-full border-2 border-white bg-emerald-500 shadow-lg" />
        <div class="absolute right-[30%] top-[58%] size-4 rounded-full border-2 border-white bg-amber-500 shadow-lg" />
      </PamanaMapPanel>

      <div class="space-y-4">
        <UCard class="glass rounded-30" :ui="{ root: 'ring-0 rounded-30' }">
          <div class="flex items-center justify-between gap-2">
            <h2 class="font-display text-sm font-semibold text-neutral-900">Trip DX-1087-0512</h2>
            <span class="pill bg-teal-100 text-teal-700">In progress</span>
          </div>
          <p class="mt-1 text-xs text-neutral-400">Route SL–SF 01 · Southbound</p>

          <div class="mt-4 space-y-3">
            <div v-for="stop in stops" :key="stop.name" class="flex items-start gap-2 text-sm">
              <span
                class="badge-dot mt-1.5 shrink-0"
                :class="{
                  'bg-lime-500': stop.state === 'done',
                  'bg-amber-500': stop.state === 'next',
                  'bg-neutral-300': stop.state === 'pending'
                }"
              />
              <span class="text-neutral-700">{{ stop.name }}</span>
              <span v-if="stop.detail" class="ml-auto text-right text-xs text-neutral-400">{{ stop.detail }}</span>
            </div>
          </div>
        </UCard>

        <UCard class="glass glow-lime rounded-30" :ui="{ root: 'ring-0 rounded-30', body: 'relative z-10' }">
          <h2 class="font-display text-sm font-semibold text-neutral-900">Update occupancy</h2>
          <div class="mt-4 flex items-center justify-between gap-4">
            <button type="button" class="btn-soft" aria-label="Remove one passenger" @click="changeOccupancy(-1)">− 1</button>
            <p class="stat-num text-2xl text-neutral-900">{{ occupancy }} / {{ capacity }}</p>
            <button type="button" class="btn-soft" aria-label="Add one passenger" @click="changeOccupancy(1)">+ 1</button>
          </div>
        </UCard>

        <UButton
          block
          size="lg"
          color="error"
          icon="i-lucide-square"
          class="rounded-full font-semibold"
          @click="endTrip"
        >
          End Trip
        </UButton>
      </div>
    </div>
  </div>
</template>
