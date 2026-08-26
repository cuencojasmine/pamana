<script setup lang="ts">
// @ts-nocheck

definePageMeta({
  middleware: ['auth', 'passenger']
})

useHead({
  title: 'Live Map | PAMANA'
})

const { apiFetch } = useApi()
const { location: userLocation, error: locationError, loading: locationLoading } = useGeolocation()

const locationStatusLabel = computed(() => {
  if (userLocation.value) return 'Centered on your location'
  if (locationError.value) return 'Location unavailable'
  if (locationLoading.value) return 'Locating…'
  return 'Pilot corridor'
})

interface LiveVehicle {
  vehicle_id: number
  documentId: string
  vehicle_number: string
  occupancy_level: string | null
  direction: string
  latitude?: number | string | null
  longitude?: number | string | null
  last_latitude?: number | string | null
  last_longitude?: number | string | null
  updated_at?: string | null
}

const nearbyStops = [
  {
    name: 'San Luis Central Terminal',
    wait: '3 min wait',
    tone: 'lime'
  },
  {
    name: 'Santo Tomas Stop',
    wait: '9 min wait',
    tone: 'amber'
  },
  {
    name: 'OGC Stop',
    wait: '5 min wait',
    tone: 'lime'
  }
]

const OCCUPANCY_LABELS: Record<string, string> = {
  empty: 'Empty',
  low: 'Low occupancy',
  moderate: 'Moderate occupancy',
  near_full: 'Near full',
  full: 'Full'
}

const rawVehicles = ref<LiveVehicle[]>([])
const loadingVehicles = ref(false)
const loadError = ref('')
const lastUpdatedAt = ref<Date | null>(null)

let pollTimer:
  | ReturnType<typeof setInterval>
  | undefined

const vehicles = computed(() => {
  return rawVehicles.value.map(vehicle => {
    const occupancyKey =
      vehicle.occupancy_level || 'unknown'

    const occupancy =
      OCCUPANCY_LABELS[occupancyKey] ||
      'Unknown occupancy'

    return {
      id:
        vehicle.documentId ||
        `${vehicle.vehicle_id}-${vehicle.vehicle_number}`,
      vehicleNumber:
        vehicle.vehicle_number ||
        `Vehicle ${vehicle.vehicle_id}`,
      occupancy,
      occupancyKey,
      direction:
        vehicle.direction === 'inbound'
          ? 'Inbound'
          : vehicle.direction === 'outbound'
            ? 'Outbound'
            : vehicle.direction || 'Direction unavailable'
    }
  })
})

const lastUpdatedText = computed(() => {
  if (!lastUpdatedAt.value) {
    return 'Waiting for live data'
  }

  return `Updated ${lastUpdatedAt.value.toLocaleTimeString(
    undefined,
    {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit'
    }
  )}`
})

function getOccupancyClasses(level: string) {
  if (level === 'full') {
    return 'bg-red-100 text-red-700'
  }

  if (level === 'near_full') {
    return 'bg-amber-100 text-amber-700'
  }

  if (level === 'moderate') {
    return 'bg-yellow-100 text-yellow-700'
  }

  return 'bg-lime-100 text-lime-700'
}

async function loadNearbyVehicles() {
  // Prevent requests from overlapping.
  if (loadingVehicles.value) {
    return
  }

  loadingVehicles.value = true

  try {
    const response = await apiFetch<{
      data: LiveVehicle[]
    }>('/api/live-vehicles')

    if (Array.isArray(response?.data)) {
      rawVehicles.value = response.data
    }

    loadError.value = ''
    lastUpdatedAt.value = new Date()
  } catch (error: any) {
    // Keep the last successful list during a temporary failure.
    loadError.value =
      error?.data?.error?.message ||
      error?.statusMessage ||
      'Live vehicle data is temporarily unavailable.'
  } finally {
    loadingVehicles.value = false
  }
}

function startPolling() {
  stopPolling()

  // Poll every 15 seconds instead of every 5 seconds.
  pollTimer = setInterval(() => {
    if (document.visibilityState === 'visible') {
      loadNearbyVehicles()
    }
  }, 15000)
}

function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = undefined
  }
}

function handleVisibilityChange() {
  if (document.visibilityState === 'visible') {
    loadNearbyVehicles()
  }
}

onMounted(() => {
  loadNearbyVehicles()
  startPolling()

  document.addEventListener(
    'visibilitychange',
    handleVisibilityChange
  )
})

onBeforeUnmount(() => {
  stopPolling()

  document.removeEventListener(
    'visibilitychange',
    handleVisibilityChange
  )
})
</script>

<template>
  <div>
    <PamanaPageHeader
      title="Live Map"
      role="passenger"
    />

    <!-- Map status bar -->
    <div
      class="mb-4 flex flex-col gap-3 rounded-2xl border border-neutral-900/10 bg-white/70 p-3 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between"
    >
      <div class="flex flex-wrap items-center gap-2">
        <span
          class="pill normal-case bg-lime-100 text-lime-700"
        >
          <span class="badge-dot bg-lime-500" />
          Available
        </span>

        <span
          class="pill normal-case bg-amber-100 text-amber-700"
        >
          <span class="badge-dot bg-amber-500" />
          Near full
        </span>

        <span
          class="pill normal-case bg-red-100 text-red-700"
        >
          <span class="badge-dot bg-red-500" />
          Full
        </span>

        <span
          v-if="userLocation"
          class="pill normal-case bg-sky-100 text-sky-700"
        >
          <UIcon
            name="i-lucide-map-pin"
            class="size-3.5"
          />

          Your location
        </span>
      </div>

      <div
        class="flex items-center justify-between gap-3 sm:justify-end"
      >
        <p class="text-xs text-neutral-500">
          {{ lastUpdatedText }}
        </p>

        <UButton
          type="button"
          color="neutral"
          variant="soft"
          size="sm"
          icon="i-lucide-refresh-cw"
          class="rounded-full"
          :loading="loadingVehicles"
          :disabled="loadingVehicles"
          @click="loadNearbyVehicles"
        >
          Refresh
        </UButton>
      </div>
    </div>

    <div class="grid gap-5 lg:grid-cols-3">
      <!-- Live map -->
      <div class="space-y-3 lg:col-span-2">
        <PamanaMapPanel
          icon="i-lucide-map"
          label="San Luis ↔ San Fernando corridor"
          height="460px"
          tone="lime"
          :markers="rawVehicles"
          :user-location="userLocation"
        />

        <!-- Status is outside the map -->
        <div
          class="flex flex-col gap-2 px-1 text-xs text-neutral-500 sm:flex-row sm:items-center sm:justify-between"
        >
          <span class="flex items-center gap-1.5">
            <UIcon
              name="i-lucide-crosshair"
              class="size-3.5 text-lime-600"
            />

            {{ locationStatusLabel }}
          </span>

          <span>
            {{ rawVehicles.length }}
            {{
              rawVehicles.length === 1
                ? 'active vehicle'
                : 'active vehicles'
            }}
          </span>
        </div>

        <UAlert
          v-if="loadError"
          color="warning"
          variant="soft"
          icon="i-lucide-wifi-off"
          title="Live updates interrupted"
          :description="loadError"
          class="rounded-2xl"
        />
      </div>

      <!-- Side information -->
      <div class="space-y-3">
        <!-- Nearby stops -->
        <UCard
          class="glass rounded-30"
          :ui="{ root: 'ring-0 rounded-30' }"
        >
          <div class="flex items-center gap-2">
            <UIcon
              name="i-lucide-map-pinned"
              class="size-4 text-lime-600"
            />

            <h2
              class="font-display text-sm font-semibold text-neutral-900"
            >
              Nearby stops
            </h2>
          </div>

          <div
            class="mt-3 divide-y divide-neutral-900/5"
          >
            <div
              v-for="stop in nearbyStops"
              :key="stop.name"
              class="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
            >
              <span class="text-sm text-neutral-700">
                {{ stop.name }}
              </span>

              <span
                class="pill shrink-0 normal-case"
                :class="
                  stop.tone === 'amber'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-lime-300/15 text-lime-700'
                "
              >
                {{ stop.wait }}
              </span>
            </div>
          </div>
        </UCard>

        <!-- Active vehicles -->
        <UCard
          class="glass glow-lime rounded-30"
          :ui="{
            root: 'ring-0 rounded-30',
            body: 'relative z-10'
          }"
        >
          <div class="flex items-center justify-between gap-3">
            <h2
              class="font-display text-sm font-semibold text-neutral-900"
            >
              Active vehicles nearby
            </h2>

            <span
              v-if="vehicles.length"
              class="pill bg-lime-100 text-lime-700"
            >
              {{ vehicles.length }}
            </span>
          </div>

          <div
            v-if="loadingVehicles && !vehicles.length"
            class="flex items-center justify-center py-8"
          >
            <div class="text-center">
              <div
                class="mx-auto size-8 animate-spin rounded-full border-4 border-neutral-900/10 border-t-lime-500"
              />

              <p class="mt-3 text-xs text-neutral-500">
                Loading vehicles...
              </p>
            </div>
          </div>

          <div
            v-else-if="vehicles.length"
            class="mt-3 space-y-3"
          >
            <div
              v-for="vehicle in vehicles"
              :key="vehicle.id"
              class="flex items-center gap-3 rounded-2xl border border-neutral-900/5 bg-white/50 p-3"
            >
              <span
                class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-lime-300/15"
              >
                <UIcon
                  name="i-lucide-bus-front"
                  class="size-4 text-lime-600"
                />
              </span>

              <div class="min-w-0 flex-1">
                <p
                  class="truncate text-sm font-semibold text-neutral-800"
                >
                  {{ vehicle.vehicleNumber }}
                </p>

                <p class="text-xs text-neutral-500">
                  {{ vehicle.direction }}
                </p>
              </div>

              <span
                class="pill shrink-0 normal-case"
                :class="
                  getOccupancyClasses(
                    vehicle.occupancyKey
                  )
                "
              >
                {{ vehicle.occupancy }}
              </span>
            </div>
          </div>

          <div
            v-else
            class="flex flex-col items-center py-7 text-center"
          >
            <span
              class="flex size-11 items-center justify-center rounded-2xl bg-neutral-100"
            >
              <UIcon
                name="i-lucide-bus-front"
                class="size-5 text-neutral-400"
              />
            </span>

            <p
              class="mt-3 text-sm font-semibold text-neutral-700"
            >
              No active vehicles
            </p>

            <p class="mt-1 text-xs text-neutral-500">
              Live vehicles will appear here.
            </p>
          </div>
        </UCard>

        <p
          class="px-2 text-xs leading-relaxed text-neutral-500"
        >
          Vehicle positions come from the live API. Updates pause
          when this browser tab is not visible.
        </p>
      </div>
    </div>
  </div>
</template>