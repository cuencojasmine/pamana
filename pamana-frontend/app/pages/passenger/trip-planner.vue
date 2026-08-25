<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'passenger']
})

useHead({
  title: 'Trip Planner | PAMANA'
})

const { apiFetch } = useApi()
const toast = useToast()

const form = reactive({
  origin: 'San Luis',
  destination: 'San Fernando',
  departure: 'Depart now',
  vehicle: 'All vehicle types'
})

const departureOptions = ['Depart now', 'Schedule for later']
const vehicleOptions = ['All vehicle types', 'Jeepney only', 'Van (UV Express)']

interface TripSearchStop {
  id: number
  name: string
  sequence: number
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

const selectedRoute = computed(() =>
  routes.value.find(route => route.documentId === selectedRouteId.value) ?? routes.value[0]
)

const fareRange = computed(() => {
  const fares = routes.value
    .map(route => route.base_fare)
    .filter((fare): fare is number => typeof fare === 'number')

  if (!fares.length) return null

  return {
    min: Math.min(...fares),
    max: Math.max(...fares)
  }
})

function formatMoney(value: number) {
  return `₱${value.toFixed(2)}`
}

async function searchRoutes() {
  loading.value = true

  try {
    const response = await apiFetch<{ data: TripSearchRoute[] }>('/api/trip-search', {
      query: {
        origin: form.origin,
        destination: form.destination
      }
    })

    routes.value = response.data
    selectedRouteId.value = response.data[0]?.documentId ?? null
  } catch (error: any) {
    routes.value = []
    selectedRouteId.value = null

    toast.add({
      title: 'Unable to search routes',
      description: error?.data?.error?.message || 'Please try again.',
      color: 'error'
    })
  } finally {
    searched.value = true
    loading.value = false
  }
}

onMounted(() => {
  searchRoutes()
})
</script>

<template>
  <div>
    <PamanaPageHeader title="Trip Planner" role="passenger" />

    <div class="grid gap-5 lg:grid-cols-5">
      <div class="space-y-4 lg:col-span-2">
        <UCard class="glass rounded-30" :ui="{ root: 'ring-0 rounded-30' }">
          <h2 class="font-display text-sm font-semibold text-neutral-900">Where to?</h2>

          <form class="mt-4 space-y-3" @submit.prevent="searchRoutes">
            <div class="flex items-center gap-2 rounded-2xl border border-neutral-900/10 bg-neutral-900/[0.025] px-3 py-1.5">
              <UIcon name="i-lucide-circle" class="size-3 text-neutral-400" />
              <UInput
                v-model="form.origin"
                aria-label="Trip origin"
                placeholder="Origin"
                variant="none"
                class="w-full"
              />
            </div>

            <div class="flex items-center gap-2 rounded-2xl border border-lime-300/40 bg-lime-300/[0.07] px-3 py-1.5">
              <UIcon name="i-lucide-map-pin" class="size-3.5 text-lime-600" />
              <UInput
                v-model="form.destination"
                aria-label="Trip destination"
                placeholder="Destination"
                variant="none"
                class="w-full"
              />
            </div>

            <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <USelect v-model="form.departure" :items="departureOptions" class="w-full" />
              <USelect v-model="form.vehicle" :items="vehicleOptions" class="w-full" />
            </div>

            <UButton
              type="submit"
              block
              size="lg"
              icon="i-lucide-search"
              class="rounded-full font-semibold text-neutral-950"
              :loading="loading"
              :disabled="loading || !form.origin.trim() || !form.destination.trim()"
            >
              Search Routes
            </UButton>
          </form>
        </UCard>

        <UCard class="glass glow-lime rounded-30" :ui="{ root: 'ring-0 rounded-30', body: 'relative z-10' }">
          <div class="flex items-center justify-between gap-3">
            <div>
              <p class="font-display text-sm font-semibold text-neutral-900">Fare estimate</p>
              <p v-if="fareRange" class="stat-num mt-2 text-3xl text-neutral-900">
                ₱{{ fareRange.min.toFixed(0) }}<span v-if="fareRange.max !== fareRange.min">–{{ fareRange.max.toFixed(0) }}</span>
              </p>
              <p v-else class="mt-2 text-sm font-medium text-neutral-400">Search to calculate</p>
            </div>

            <span v-if="routes.length" class="pill bg-lime-300/15 text-lime-700">
              {{ routes.length }} {{ routes.length === 1 ? 'option' : 'options' }}
            </span>
          </div>

          <p class="mt-2 text-xs text-neutral-400">
            Based on each route's configured base fare and estimated travel time.
          </p>
        </UCard>
      </div>

      <div class="space-y-3 lg:col-span-3">
        <button
          v-for="route in routes"
          :key="route.documentId"
          type="button"
          class="glass card-lift w-full rounded-30 p-4 text-left"
          :class="selectedRouteId === route.documentId ? 'border-lime-400/70 ring-2 ring-lime-300/20' : ''"
          @click="selectedRouteId = route.documentId"
        >
          <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div class="flex min-w-0 items-center gap-3">
              <span class="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-lime-300/15">
                <UIcon name="i-lucide-bus-front" class="size-5 text-lime-600" />
              </span>

              <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-1.5">
                  <p class="truncate text-sm font-semibold text-neutral-900">
                    {{ route.route_code }} · {{ route.route_name }}
                  </p>
                  <span v-if="route.is_recommended" class="pill bg-lime-100 text-lime-700">Recommended</span>
                  <span v-if="route.is_cheapest" class="pill bg-emerald-100 text-emerald-700">Cheapest</span>
                  <span v-if="route.is_fastest" class="pill bg-teal-100 text-teal-700">Fastest</span>
                </div>
                <p class="mt-1 text-xs text-neutral-400">
                  {{ route.origin }} → {{ route.destination }} · {{ route.stops.length }} stops · {{ route.vehicle_type }}
                </p>
              </div>
            </div>

            <div class="shrink-0 text-left sm:text-right">
              <p class="stat-num text-lg text-neutral-900">
                {{ route.estimated_travel_time ?? '—' }}<span v-if="route.estimated_travel_time"> min</span>
              </p>
              <p class="text-xs font-semibold text-lime-700">{{ formatMoney(route.base_fare) }}</p>
            </div>
          </div>
        </button>

        <UCard
          v-if="!loading && !routes.length"
          class="glass rounded-30"
          :ui="{ root: 'ring-0 rounded-30' }"
        >
          <div class="flex flex-col items-center py-7 text-center">
            <span class="flex size-12 items-center justify-center rounded-2xl bg-lime-300/15">
              <UIcon :name="searched ? 'i-lucide-route-off' : 'i-lucide-route'" class="size-6 text-lime-600" />
            </span>
            <h2 class="mt-3 font-display font-semibold text-neutral-900">
              {{ searched ? 'No matching active routes' : 'Ready to plan your trip' }}
            </h2>
            <p class="mt-1 max-w-sm text-sm text-neutral-500">Try another vehicle preference to preview available route cards.</p>
          </div>
        </UCard>

        <UAlert
          v-if="selectedRoute && selectedRoute.stops.length"
          color="warning"
          variant="soft"
          icon="i-lucide-info"
          title="Route stop details"
          :description="selectedRoute.stops.map(stop => stop.name).join(' → ')"
          class="rounded-2xl"
        />

        <PamanaMapPanel
          icon="i-lucide-map"
          :label="selectedRoute ? `${selectedRoute.route_code} route preview` : 'Route preview map'"
          height="224px"
          tone="lime"
        />

        <p class="text-xs text-neutral-400">
          Route options are live. Map markers are simulated UI preview data only.
        </p>
      </div>
    </div>
  </div>
</template>
