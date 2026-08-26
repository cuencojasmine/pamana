<script setup lang="ts">
// @ts-nocheck
import { PILOT_CORRIDOR } from '~/utils/constants'

definePageMeta({
  middleware: ['auth', 'passenger']
})

useHead({
  title: 'Passenger Dashboard | PAMANA'
})

const { user } = useAuth()
const toast = useToast()

const fromLocation = ref('San Luis, Pampanga')
const toLocation = ref('City of San Fernando, Pampanga')
const showAllPlaces = ref(false)

type Place = {
  name: string
  subtitle: string
  destination: string
  icon: string
}

const allPlaces: Place[] = [
  {
    name: 'San Fernando',
    subtitle: 'City Proper',
    destination: 'City of San Fernando, Pampanga',
    icon: 'i-lucide-building-2'
  },
  {
    name: 'SM City Pampanga',
    subtitle: 'Shopping Center',
    destination: 'SM City Pampanga, San Fernando',
    icon: 'i-lucide-shopping-bag'
  },
  {
    name: 'Holy Angel',
    subtitle: 'University',
    destination: 'Holy Angel University, Angeles City',
    icon: 'i-lucide-graduation-cap'
  },
  {
    name: 'San Luis',
    subtitle: 'Town Proper',
    destination: 'San Luis, Pampanga',
    icon: 'i-lucide-map-pin'
  },
  {
    name: 'Robinsons Starmills',
    subtitle: 'Shopping Center',
    destination: 'Robinsons Starmills, San Fernando',
    icon: 'i-lucide-store'
  },
  {
    name: 'Provincial Capitol',
    subtitle: 'Government Center',
    destination: 'Pampanga Provincial Capitol, San Fernando',
    icon: 'i-lucide-landmark'
  },
  {
    name: 'Angeles City',
    subtitle: 'City Proper',
    destination: 'Angeles City, Pampanga',
    icon: 'i-lucide-building'
  },
  {
    name: 'SM City Clark',
    subtitle: 'Shopping Center',
    destination: 'SM City Clark, Angeles City',
    icon: 'i-lucide-shopping-cart'
  },
  {
    name: 'Clark Freeport',
    subtitle: 'Business District',
    destination: 'Clark Freeport Zone, Pampanga',
    icon: 'i-lucide-briefcase-business'
  },
  {
    name: 'Mexico',
    subtitle: 'Town Proper',
    destination: 'Mexico, Pampanga',
    icon: 'i-lucide-map'
  },
  {
    name: 'Arayat',
    subtitle: 'Town Proper',
    destination: 'Arayat, Pampanga',
    icon: 'i-lucide-mountain'
  },
  {
    name: 'Candaba',
    subtitle: 'Town Proper',
    destination: 'Candaba, Pampanga',
    icon: 'i-lucide-map-pinned'
  },
  {
    name: 'Apalit',
    subtitle: 'Town Proper',
    destination: 'Apalit, Pampanga',
    icon: 'i-lucide-navigation'
  },
  {
    name: 'Guagua',
    subtitle: 'Town Proper',
    destination: 'Guagua, Pampanga',
    icon: 'i-lucide-map-pin-house'
  },
  {
    name: 'Bacolor',
    subtitle: 'Town Proper',
    destination: 'Bacolor, Pampanga',
    icon: 'i-lucide-church'
  }
]

const quickPlaces = computed(() => allPlaces.slice(0, 3))

const validateLocations = () => {
  const from = fromLocation.value.trim()
  const to = toLocation.value.trim()

  if (!from || !to) {
    toast.add({
      title: 'Location required',
      description: 'Enter both your starting point and destination.',
      color: 'error'
    })

    return false
  }

  if (from.toLowerCase() === to.toLowerCase()) {
    toast.add({
      title: 'Choose another destination',
      description: 'Your starting point and destination cannot be the same.',
      color: 'warning'
    })

    return false
  }

  return true
}

const findBestRoute = async () => {
  if (!validateLocations()) {
    return
  }

  await navigateTo({
    path: '/passenger/trip-planner',
    query: {
      from: fromLocation.value.trim(),
      to: toLocation.value.trim()
    }
  })
}

const selectPlace = async (place: Place) => {
  toLocation.value = place.destination
  showAllPlaces.value = false

  await navigateTo({
    path: '/passenger/trip-planner',
    query: {
      from: fromLocation.value.trim() || 'San Luis, Pampanga',
      to: place.destination
    }
  })
}

const swapLocations = () => {
  const currentFrom = fromLocation.value

  fromLocation.value = toLocation.value
  toLocation.value = currentFrom
}

const closePlaces = () => {
  showAllPlaces.value = false
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    closePlaces()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div class="space-y-6">
    <PamanaPageHeader
      role="passenger"
      :title="`Welcome, ${user?.username || 'Passenger'}`"
      subtitle="Plan trips and check availability across the pilot corridor."
    />

    <!-- Trip search -->
    <UCard
      class="glass glow-sunset rounded-30"
      :ui="{
        root: 'ring-0 rounded-[1.75rem]',
        body: 'relative z-10'
      }"
    >
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-2">
          <UIcon
            name="i-lucide-navigation"
            class="size-4 text-lime-600"
          />

          <p class="font-display text-sm font-semibold text-neutral-900">
            Plan Your Trip
          </p>
        </div>

        <UBadge
          variant="soft"
          color="neutral"
          size="sm"
          class="!bg-neutral-900/[0.06] !text-neutral-500"
        >
          {{ PILOT_CORRIDOR }}
        </UBadge>
      </div>

      <form
        class="mt-5"
        @submit.prevent="findBestRoute"
      >
        <!-- From field -->
        <div
          class="trip-location-field flex items-center gap-3 rounded-2xl border border-neutral-900/10 bg-white/75 px-4 py-3 transition focus-within:border-lime-500 focus-within:ring-4 focus-within:ring-lime-300/15"
        >
          <span
            class="flex size-9 shrink-0 items-center justify-center rounded-full bg-neutral-900/[0.06]"
          >
            <UIcon
              name="i-lucide-circle"
              class="size-3 text-neutral-500"
            />
          </span>

          <label class="min-w-0 flex-1">
            <span
              class="block text-[11px] font-medium uppercase tracking-wide text-neutral-500"
            >
              From
            </span>

            <input
              v-model="fromLocation"
              type="text"
              name="from"
              autocomplete="off"
              placeholder="Enter your starting point"
              class="mt-0.5 w-full bg-transparent text-sm font-medium text-neutral-900 outline-none placeholder:text-neutral-400"
            >
          </label>
        </div>

        <!-- Swap locations -->
        <div class="flex items-center gap-3 pl-[1.15rem]">
          <div class="h-5 w-px border-l border-dashed border-neutral-900/15" />

          <button
            type="button"
            class="flex size-8 items-center justify-center rounded-full text-neutral-500 transition hover:bg-lime-100 hover:text-lime-700"
            aria-label="Swap starting point and destination"
            @click="swapLocations"
          >
            <UIcon
              name="i-lucide-arrow-down-up"
              class="size-4"
            />
          </button>
        </div>

        <!-- To field -->
        <div
          class="trip-location-field flex items-center gap-3 rounded-2xl border border-lime-500/20 bg-white/75 px-4 py-3 transition focus-within:border-lime-500 focus-within:ring-4 focus-within:ring-lime-300/15"
        >
          <span
            class="flex size-9 shrink-0 items-center justify-center rounded-full bg-lime-300/15"
          >
            <UIcon
              name="i-lucide-map-pin"
              class="size-4 text-lime-600"
            />
          </span>

          <label class="min-w-0 flex-1">
            <span
              class="block text-[11px] font-medium uppercase tracking-wide text-neutral-500"
            >
              To
            </span>

            <input
              v-model="toLocation"
              type="text"
              name="to"
              autocomplete="off"
              placeholder="Enter your destination"
              class="mt-0.5 w-full bg-transparent text-sm font-medium text-neutral-900 outline-none placeholder:text-neutral-400"
            >
          </label>
        </div>

        <div
          class="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div class="flex items-center gap-2 text-sm text-neutral-500">
            <UIcon
              name="i-lucide-clock"
              class="size-4"
            />

            Today · next available departure
          </div>

          <UButton
            type="submit"
            size="lg"
            trailing-icon="i-lucide-arrow-right"
            class="rounded-full font-semibold text-neutral-950"
          >
            Find Best Route
          </UButton>
        </div>
      </form>
    </UCard>

    <!-- Quick Places -->
    <UCard
      class="glass rounded-30"
      :ui="{ root: 'ring-0 rounded-[1.75rem]' }"
    >
      <div class="flex items-center justify-between">
        <p class="font-display text-sm font-semibold text-neutral-900">
          Quick Places
        </p>

        <button
          type="button"
          class="flex items-center gap-1 text-xs font-medium text-lime-600 transition hover:text-lime-700"
          @click="showAllPlaces = true"
        >
          See all

          <UIcon
            name="i-lucide-chevron-right"
            class="size-3.5"
          />
        </button>
      </div>

      <div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <button
          v-for="place in quickPlaces"
          :key="place.name"
          type="button"
          class="card-lift flex flex-col items-center gap-2 rounded-2xl border border-neutral-900/10 bg-neutral-900/[0.03] px-2 py-4 text-center transition hover:border-lime-400/40 hover:bg-lime-50"
          @click="selectPlace(place)"
        >
          <span
            class="flex size-9 items-center justify-center rounded-full bg-lime-300/15"
          >
            <UIcon
              :name="place.icon"
              class="size-4 text-lime-600"
            />
          </span>

          <div>
            <p class="text-xs font-semibold text-neutral-900">
              {{ place.name }}
            </p>

            <p class="text-[10px] text-neutral-500">
              {{ place.subtitle }}
            </p>
          </div>
        </button>
      </div>
    </UCard>

    <!-- Main dashboard shortcuts -->
    <div class="grid gap-4 md:grid-cols-3">
      <UCard
        class="glass glow-lime card-lift rounded-30"
        :ui="{
          root: 'ring-0 rounded-[1.75rem]',
          body: 'relative z-10',
          footer: 'relative z-10 border-neutral-900/10'
        }"
      >
        <div>
          <UIcon
            name="i-lucide-route"
            class="mb-3 size-8 text-lime-600"
          />

          <h2 class="font-display font-semibold text-neutral-900">
            Plan a Trip
          </h2>

          <p class="mt-1 text-sm text-neutral-500">
            Compare transportation options.
          </p>
        </div>

        <template #footer>
          <UButton
            to="/passenger/trip-planner"
            variant="soft"
            block
            class="rounded-full"
          >
            Open Trip Planner
          </UButton>
        </template>
      </UCard>

      <UCard
        class="glass glow-lime card-lift rounded-30"
        :ui="{
          root: 'ring-0 rounded-[1.75rem]',
          body: 'relative z-10',
          footer: 'relative z-10 border-neutral-900/10'
        }"
      >
        <div>
          <UIcon
            name="i-lucide-map"
            class="mb-3 size-8 text-lime-600"
          />

          <h2 class="font-display font-semibold text-neutral-900">
            Live Map
          </h2>

          <p class="mt-1 text-sm text-neutral-500">
            View routes and active vehicles.
          </p>
        </div>

        <template #footer>
          <UButton
            to="/passenger/map"
            variant="soft"
            block
            class="rounded-full"
          >
            Open Map
          </UButton>
        </template>
      </UCard>

      <UCard
        class="glass glow-lime card-lift rounded-30"
        :ui="{
          root: 'ring-0 rounded-[1.75rem]',
          body: 'relative z-10',
          footer: 'relative z-10 border-neutral-900/10'
        }"
      >
        <div>
          <UIcon
            name="i-lucide-message-square-warning"
            class="mb-3 size-8 text-lime-600"
          />

          <h2 class="font-display font-semibold text-neutral-900">
            Report Conditions
          </h2>

          <p class="mt-1 text-sm text-neutral-500">
            Help improve PAMANA's transport data.
          </p>
        </div>

        <template #footer>
          <UButton
            to="/passenger/reports"
            variant="soft"
            block
            class="rounded-full"
          >
            My Reports
          </UButton>
        </template>
      </UCard>
    </div>

    <!-- All Places floating window -->
    <Teleport to="body">
      <div
        v-if="showAllPlaces"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-neutral-950/50 p-4 backdrop-blur-sm"
        @click.self="closePlaces"
      >
        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby="places-title"
          class="w-full max-w-4xl overflow-hidden rounded-3xl border border-white/70 bg-white shadow-2xl"
        >
          <header
            class="flex items-start justify-between gap-4 border-b border-neutral-200 px-5 py-4 sm:px-6"
          >
            <div>
              <p class="text-xs font-semibold uppercase tracking-wide text-lime-600">
                PAMANA destinations
              </p>

              <h2
                id="places-title"
                class="mt-1 font-display text-xl font-bold text-neutral-900"
              >
                Popular Places
              </h2>

              <p class="mt-1 text-sm text-neutral-500">
                Select a destination to continue to the Trip Planner.
              </p>
            </div>

            <button
              type="button"
              class="flex size-10 shrink-0 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-900"
              aria-label="Close destinations"
              @click="closePlaces"
            >
              <UIcon
                name="i-lucide-x"
                class="size-5"
              />
            </button>
          </header>

          <div class="max-h-[70vh] overflow-y-auto p-5 sm:p-6">
            <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              <button
                v-for="place in allPlaces"
                :key="place.destination"
                type="button"
                class="group flex min-h-32 flex-col items-center justify-center rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-center transition hover:-translate-y-1 hover:border-lime-400 hover:bg-lime-50 hover:shadow-lg"
                @click="selectPlace(place)"
              >
                <span
                  class="flex size-11 items-center justify-center rounded-full bg-lime-100 text-lime-700 transition group-hover:bg-lime-200"
                >
                  <UIcon
                    :name="place.icon"
                    class="size-5"
                  />
                </span>

                <p class="mt-3 text-xs font-semibold text-neutral-900">
                  {{ place.name }}
                </p>

                <p class="mt-1 text-[10px] text-neutral-500">
                  {{ place.subtitle }}
                </p>
              </button>
            </div>
          </div>
        </section>
      </div>
    </Teleport>
  </div>
</template>