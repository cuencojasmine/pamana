<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'driver']
})

useHead({
  title: 'Current Trip | PAMANA'
})

const { apiFetch } = useApi()
const toast = useToast()
const occupancy = ref(0)
const capacity = ref(16)

const stops = [
  { name: 'San Luis Central Terminal', detail: 'Departed 7:02 AM', state: 'done' },
  { name: 'Santo Tomas Stop', detail: 'Next · ETA 4 min', state: 'next' },
  { name: 'OGC Stop', detail: '', state: 'pending' },
  { name: 'SM City San Fernando', detail: '', state: 'pending' }
]

const activeTripDocumentId = ref<string | null>(null)
const activeVehicleDocumentId = ref<string | null>(null)

const OCCUPANCY_LEVEL_RATIO: Record<string, number> = {
  empty: 0,
  low: 0.25,
  moderate: 0.5,
  near_full: 0.75,
  full: 1
}

function occupancyLevelFor(current: number, max: number) {
  if (current <= 0) return 'empty'

  const ratio = current / max

  if (ratio <= 0.4) return 'low'
  if (ratio <= 0.65) return 'moderate'
  if (ratio <= 0.9) return 'near_full'

  return 'full'
}

async function loadActiveTrip() {
  try {
    const response = await apiFetch<{
      data: Array<{
        documentId: string
        vehicle?: { documentId: string; capacity: number | null; occupancy_level: string | null }
      }>
    }>('/api/trips', {
      query: {
        'filters[trip_status][$eq]': 'active',
        populate: 'vehicle'
      }
    })

    const trip = response.data[0]
    activeTripDocumentId.value = trip?.documentId ?? null
    activeVehicleDocumentId.value = trip?.vehicle?.documentId ?? null

    if (trip?.vehicle?.capacity) {
      capacity.value = trip.vehicle.capacity
    }

    const level = trip?.vehicle?.occupancy_level
    if (level) {
      occupancy.value = Math.round(capacity.value * (OCCUPANCY_LEVEL_RATIO[level] ?? 0))
    }
  } catch {
    activeTripDocumentId.value = null
    activeVehicleDocumentId.value = null
  }
}

async function changeOccupancy(amount: number) {
  const next = Math.min(capacity.value, Math.max(0, occupancy.value + amount))
  occupancy.value = next

  if (!activeVehicleDocumentId.value) return

  try {
    await apiFetch(`/api/vehicles/${activeVehicleDocumentId.value}`, {
      method: 'PUT',
      body: { data: { occupancy_level: occupancyLevelFor(next, capacity.value) } }
    })
  } catch (error: any) {
    toast.add({
      title: 'Unable to update occupancy',
      description: error?.data?.error?.message || 'Please try again.',
      color: 'error'
    })
  }
}

async function endTrip() {
  if (!activeTripDocumentId.value) {
    toast.add({
      title: 'No active trip found',
      description: 'Start a trip before trying to end one.',
      color: 'warning'
    })
    return
  }

  try {
    await apiFetch(`/api/trips/${activeTripDocumentId.value}`, {
      method: 'PUT',
      body: { data: { trip_status: 'completed' } }
    })

    toast.add({
      title: 'Trip ended',
      description: 'The trip has been marked completed.',
      color: 'success'
    })

    await navigateTo('/driver')
  } catch (error: any) {
    toast.add({
      title: 'Unable to end trip',
      description: error?.data?.error?.message || 'Please try again.',
      color: 'error'
    })
  }
}

onMounted(() => {
  loadActiveTrip()
})
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
        :route-points="stops"
      >
        <div class="pointer-events-none absolute right-4 bottom-4 z-20 glass-solid pill normal-case text-neutral-700">
          <UIcon name="i-lucide-navigation" class="size-3.5 text-emerald-600" />
          Live navigation
        </div>
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
