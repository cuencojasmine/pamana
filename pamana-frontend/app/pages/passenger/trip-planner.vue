<script setup lang="ts">
// @ts-nocheck

definePageMeta({
  middleware: ['auth', 'passenger']
})

useHead({
  title: 'Trip Planner | PAMANA'
})

const { apiFetch } = useApi()
const toast = useToast()
const pageRoute = useRoute()
const router = useRouter()

const form = reactive({
  origin: 'San Luis, Pampanga',
  destination: 'City of San Fernando, Pampanga',
  departure: 'Depart now',
  vehicle: 'All vehicle types'
})

const departureOptions = [
  'Depart now',
  'Schedule for later'
]

const vehicleOptions = [
  'All vehicle types',
  'Jeepney only',
  'Van (UV Express)'
]

interface TripSearchStop {
  id: number
  name: string
  sequence: number
  latitude?: number | null
  longitude?: number | null
}

interface TripSearchRoute {
  id: number
  documentId: string
  route_name: string
  route_code: string
  vehicle_type?: string
  origin: string
  destination: string
  base_fare: number | null
  estimated_travel_time: number | null
  is_cheapest: boolean
  is_fastest: boolean
  is_recommended: boolean
  stops: TripSearchStop[]
}

const routes = ref<TripSearchRoute[]>([])
const selectedRouteId = ref<string | null>(null)
const loading = ref(false)
const searched = ref(false)

const selectedRoute = computed(() => {
  return (
    routes.value.find(
      route => route.documentId === selectedRouteId.value
    ) ?? routes.value[0]
  )
})

const fareRange = computed(() => {
  const fares = routes.value
    .map(route => route.base_fare)
    .filter(
      (fare): fare is number =>
        typeof fare === 'number' &&
        Number.isFinite(fare)
    )

  if (!fares.length) {
    return null
  }

  return {
    min: Math.min(...fares),
    max: Math.max(...fares)
  }
})

const selectedRouteStops = computed(() => {
  if (!Array.isArray(selectedRoute.value?.stops)) {
    return []
  }

  return [...selectedRoute.value.stops].sort(
    (first, second) =>
      (first.sequence ?? 0) - (second.sequence ?? 0)
  )
})

function getQueryValue(value: unknown) {
  if (Array.isArray(value)) {
    return typeof value[0] === 'string'
      ? value[0]
      : ''
  }

  return typeof value === 'string'
    ? value
    : ''
}

function loadLocationsFromQuery() {
  const origin =
    getQueryValue(pageRoute.query.from) ||
    getQueryValue(pageRoute.query.origin)

  const destination =
    getQueryValue(pageRoute.query.to) ||
    getQueryValue(pageRoute.query.destination)

  if (origin.trim()) {
    form.origin = origin.trim()
  }

  if (destination.trim()) {
    form.destination = destination.trim()
  }
}

function formatMoney(value: number | null | undefined) {
  if (
    typeof value !== 'number' ||
    !Number.isFinite(value)
  ) {
    return 'Fare unavailable'
  }

  return `₱${value.toFixed(2)}`
}

function routeMatchesVehicle(
  route: TripSearchRoute
) {
  if (form.vehicle === 'All vehicle types') {
    return true
  }

  const vehicleType =
    route.vehicle_type?.toLowerCase() || ''

  if (form.vehicle === 'Jeepney only') {
    return vehicleType.includes('jeep')
  }

  if (form.vehicle === 'Van (UV Express)') {
    return (
      vehicleType.includes('van') ||
      vehicleType.includes('uv')
    )
  }

  return true
}

function validateSearch() {
  const origin = form.origin.trim()
  const destination = form.destination.trim()

  if (!origin || !destination) {
    toast.add({
      title: 'Location required',
      description:
        'Enter both your starting point and destination.',
      color: 'error'
    })

    return false
  }

  if (
    origin.toLowerCase() ===
    destination.toLowerCase()
  ) {
    toast.add({
      title: 'Choose another destination',
      description:
        'Your starting point and destination cannot be the same.',
      color: 'warning'
    })

    return false
  }

  return true
}

function swapLocations() {
  const currentOrigin = form.origin

  form.origin = form.destination
  form.destination = currentOrigin
}

async function updateSearchQuery() {
  await router.replace({
    query: {
      ...pageRoute.query,
      from: form.origin.trim(),
      to: form.destination.trim()
    }
  })
}

async function searchRoutes(
  updateQuery = true
) {
  if (!validateSearch()) {
    return
  }

  loading.value = true

  try {
    if (updateQuery) {
      await updateSearchQuery()
    }

    const response = await apiFetch<{
      data: TripSearchRoute[]
    }>('/api/trip-search', {
      query: {
        origin: form.origin.trim(),
        destination: form.destination.trim()
      }
    })

    const receivedRoutes = Array.isArray(response?.data)
      ? response.data
      : []

    routes.value = receivedRoutes.filter(
      routeMatchesVehicle
    )

    selectedRouteId.value =
      routes.value[0]?.documentId ?? null
  } catch (error: any) {
    routes.value = []
    selectedRouteId.value = null

    toast.add({
      title: 'Unable to search routes',
      description:
        error?.data?.error?.message ||
        error?.statusMessage ||
        'Please try again.',
      color: 'error'
    })
  } finally {
    searched.value = true
    loading.value = false
  }
}

onMounted(() => {
  loadLocationsFromQuery()
  searchRoutes(false)
})
</script>

<template>
  <div>
    <PamanaPageHeader
      title="Trip Planner"
      role="passenger"
    />

    <div class="grid gap-5 lg:grid-cols-5">
      <!-- Search controls -->
      <div class="space-y-4 lg:col-span-2">
        <UCard
          class="glass rounded-30"
          :ui="{
            root: 'ring-0 rounded-30'
          }"
        >
          <div class="flex items-center justify-between">
            <h2
              class="font-display text-sm font-semibold text-neutral-900"
            >
              Where to?
            </h2>

            <UIcon
              name="i-lucide-navigation"
              class="size-4 text-lime-600"
            />
          </div>

          <form
            class="mt-4 space-y-3"
            @submit.prevent="searchRoutes(true)"
          >
            <!-- Origin -->
            <div
              class="flex items-center gap-2 rounded-2xl border border-neutral-900/10 bg-white/70 px-3 py-1.5 transition focus-within:border-lime-500 focus-within:ring-4 focus-within:ring-lime-300/15"
            >
              <UIcon
                name="i-lucide-circle"
                class="size-3 shrink-0 text-neutral-500"
              />

              <UInput
                v-model="form.origin"
                aria-label="Trip origin"
                placeholder="Enter your starting point"
                autocomplete="off"
                variant="none"
                class="planner-input w-full"
              />
            </div>

            <!-- Swap button -->
            <div class="flex items-center justify-center">
              <button
                type="button"
                class="flex size-9 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-500 shadow-sm transition hover:border-lime-400 hover:bg-lime-50 hover:text-lime-700"
                aria-label="Swap origin and destination"
                @click="swapLocations"
              >
                <UIcon
                  name="i-lucide-arrow-down-up"
                  class="size-4"
                />
              </button>
            </div>

            <!-- Destination -->
            <div
              class="flex items-center gap-2 rounded-2xl border border-lime-400/40 bg-white/70 px-3 py-1.5 transition focus-within:border-lime-500 focus-within:ring-4 focus-within:ring-lime-300/15"
            >
              <UIcon
                name="i-lucide-map-pin"
                class="size-4 shrink-0 text-lime-600"
              />

              <UInput
                v-model="form.destination"
                aria-label="Trip destination"
                placeholder="Enter your destination"
                autocomplete="off"
                variant="none"
                class="planner-input w-full"
              />
            </div>

            <!-- Preferences -->
            <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <USelect
                v-model="form.departure"
                :items="departureOptions"
                aria-label="Departure preference"
                class="w-full"
              />

              <USelect
                v-model="form.vehicle"
                :items="vehicleOptions"
                aria-label="Vehicle preference"
                class="w-full"
              />
            </div>

            <UButton
              type="submit"
              block
              size="lg"
              icon="i-lucide-search"
              class="search-button rounded-full font-semibold"
              :loading="loading"
              :disabled="
                loading ||
                !form.origin.trim() ||
                !form.destination.trim()
              "
            >
              Search Routes
            </UButton>
          </form>
        </UCard>

        <!-- Fare estimate -->
        <UCard
          class="glass glow-lime rounded-30"
          :ui="{
            root: 'ring-0 rounded-30',
            body: 'relative z-10'
          }"
        >
          <div class="flex items-center justify-between gap-3">
            <div>
              <p
                class="font-display text-sm font-semibold text-neutral-900"
              >
                Fare estimate
              </p>

              <p
                v-if="fareRange"
                class="stat-num mt-2 text-3xl text-neutral-900"
              >
                ₱{{ fareRange.min.toFixed(0) }}

                <span
                  v-if="fareRange.max !== fareRange.min"
                >
                  –{{ fareRange.max.toFixed(0) }}
                </span>
              </p>

              <p
                v-else
                class="mt-2 text-sm font-medium text-neutral-500"
              >
                Search to calculate
              </p>
            </div>

            <span
              v-if="routes.length"
              class="pill bg-lime-300/15 text-lime-700"
            >
              {{ routes.length }}
              {{ routes.length === 1 ? 'option' : 'options' }}
            </span>
          </div>

          <p class="mt-2 text-xs text-neutral-500">
            Based on each route's configured base fare and
            estimated travel time.
          </p>
        </UCard>
      </div>

      <!-- Route results -->
      <div class="space-y-3 lg:col-span-3">
        <button
          v-for="route in routes"
          :key="route.documentId || route.id"
          type="button"
          class="glass card-lift w-full rounded-30 p-4 text-left"
          :class="
            selectedRouteId === route.documentId
              ? 'border-lime-400/70 ring-2 ring-lime-300/20'
              : ''
          "
          @click="selectedRouteId = route.documentId"
        >
          <div
            class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div class="flex min-w-0 items-center gap-3">
              <span
                class="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-lime-300/15"
              >
                <UIcon
                  name="i-lucide-bus-front"
                  class="size-5 text-lime-600"
                />
              </span>

              <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-1.5">
                  <p
                    class="truncate text-sm font-semibold text-neutral-900"
                  >
                    {{ route.route_code }} ·
                    {{ route.route_name }}
                  </p>

                  <span
                    v-if="route.is_recommended"
                    class="pill bg-lime-100 text-lime-700"
                  >
                    Recommended
                  </span>

                  <span
                    v-if="route.is_cheapest"
                    class="pill bg-emerald-100 text-emerald-700"
                  >
                    Cheapest
                  </span>

                  <span
                    v-if="route.is_fastest"
                    class="pill bg-teal-100 text-teal-700"
                  >
                    Fastest
                  </span>
                </div>

                <p class="mt-1 text-xs text-neutral-500">
                  {{ route.origin }} →
                  {{ route.destination }} ·
                  {{ route.stops?.length ?? 0 }} stops ·
                  {{ route.vehicle_type || 'Vehicle not specified' }}
                </p>
              </div>
            </div>

            <div class="shrink-0 text-left sm:text-right">
              <p class="stat-num text-lg text-neutral-900">
                {{ route.estimated_travel_time ?? '—' }}

                <span
                  v-if="route.estimated_travel_time"
                >
                  min
                </span>
              </p>

              <p class="text-xs font-semibold text-lime-700">
                {{ formatMoney(route.base_fare) }}
              </p>
            </div>
          </div>
        </button>

        <!-- No results -->
        <UCard
          v-if="!loading && !routes.length"
          class="glass rounded-30"
          :ui="{ root: 'ring-0 rounded-30' }"
        >
          <div
            class="flex flex-col items-center py-7 text-center"
          >
            <span
              class="flex size-12 items-center justify-center rounded-2xl bg-lime-300/15"
            >
              <UIcon
                :name="
                  searched
                    ? 'i-lucide-route-off'
                    : 'i-lucide-route'
                "
                class="size-6 text-lime-600"
              />
            </span>

            <h2
              class="mt-3 font-display font-semibold text-neutral-900"
            >
              {{
                searched
                  ? 'No matching active routes'
                  : 'Ready to plan your trip'
              }}
            </h2>

            <p
              class="mt-1 max-w-sm text-sm text-neutral-500"
            >
              Try a different origin, destination, or vehicle
              preference.
            </p>
          </div>
        </UCard>

        <!-- Stops -->
        <UAlert
          v-if="selectedRouteStops.length"
          color="warning"
          variant="soft"
          icon="i-lucide-info"
          title="Route stop details"
          :description="
            selectedRouteStops
              .map(stop => stop.name)
              .join(' → ')
          "
          class="rounded-2xl"
        />

        <!-- Map -->
        <PamanaMapPanel
          icon="i-lucide-map"
          :label="
            selectedRoute
              ? `${selectedRoute.route_code} route preview`
              : 'Route preview map'
          "
          height="224px"
          tone="lime"
          :route-points="selectedRouteStops"
        />

        <p class="text-xs text-neutral-500">
          Route options are live. The map displays route-stop
          coordinates supplied by the API.
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.planner-input :deep(input) {
  color: #171717 !important;
  caret-color: #65a30d !important;
}

.planner-input :deep(input::placeholder) {
  color: #737373 !important;
  opacity: 1 !important;
}

.search-button {
  background-color: #84cc16 !important;
  color: #171717 !important;
}

.search-button:hover {
  background-color: #65a30d !important;
  color: #ffffff !important;
}

.search-button:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}
</style>