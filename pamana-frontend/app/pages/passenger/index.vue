<script setup lang="ts">
//@ts-nocheck
import { PILOT_CORRIDOR } from "~/utils/constants";

definePageMeta({
  middleware: ["auth", "passenger"],
});

const { user } = useAuth();

const quickPlaces = [
  {
    name: "San Fernando",
    subtitle: "City Proper",
    icon: "i-lucide-map-pin",
  },
  {
    name: "SM City",
    subtitle: "San Fernando",
    icon: "i-lucide-users",
  },
  {
    name: "Holy Angel",
    subtitle: "University",
    icon: "i-lucide-landmark",
  },
];
</script>

<template>
  <div class="space-y-6">
    <div>
      <p class="text-sm font-medium text-lime-300">Passenger</p>

      <h1 class="mt-1 font-display text-3xl font-bold tracking-tight text-white">
        Welcome, {{ user?.username }}
      </h1>

      <p class="mt-2 text-white/50">
        Plan your trip and check transportation availability across the PAMANA
        pilot corridor.
      </p>
    </div>

    <!-- TOP: hero trip search card -->
    <UCard
      class="glass glow-sunset rounded-3xl"
      :ui="{ root: 'ring-0 rounded-3xl', body: 'relative z-10' }"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-navigation" class="size-4 text-lime-300" />

          <p class="font-display text-sm font-semibold text-white">
            Plan Your Trip
          </p>
        </div>

        <UBadge variant="soft" class="bg-white/10 text-white/60" size="sm">
          {{ PILOT_CORRIDOR }}
        </UBadge>
      </div>

      <div class="mt-5 space-y-2">
        <div
          class="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
        >
          <span class="flex size-8 items-center justify-center rounded-full bg-white/10">
            <UIcon name="i-lucide-circle" class="size-3 text-white/60" />
          </span>

          <div>
            <p class="text-[11px] uppercase tracking-wide text-white/40">From</p>

            <p class="text-sm font-medium text-white">San Luis, Pampanga</p>
          </div>
        </div>

        <div class="flex items-center gap-3 pl-[1.15rem]">
          <div class="h-4 w-px border-l border-dashed border-white/15" />

          <UIcon name="i-lucide-arrow-down-up" class="size-3.5 text-white/30" />
        </div>

        <div
          class="flex items-center gap-3 rounded-2xl border border-lime-300/20 bg-lime-300/[0.06] px-4 py-3"
        >
          <span class="flex size-8 items-center justify-center rounded-full bg-lime-300/15">
            <UIcon name="i-lucide-map-pin" class="size-3.5 text-lime-300" />
          </span>

          <div>
            <p class="text-[11px] uppercase tracking-wide text-white/40">To</p>

            <p class="text-sm font-medium text-white">
              City of San Fernando, Pampanga
            </p>
          </div>
        </div>
      </div>

      <div class="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center gap-2 text-sm text-white/50">
          <UIcon name="i-lucide-clock" class="size-4" />

          Today · next available departure
        </div>

        <UButton
          to="/passenger/trip-planner"
          size="lg"
          trailing-icon="i-lucide-arrow-right"
          class="rounded-full font-semibold text-neutral-950"
        >
          Find Best Route
        </UButton>
      </div>
    </UCard>

    <!-- MIDDLE: quick places -->
    <UCard class="glass rounded-3xl" :ui="{ root: 'ring-0 rounded-3xl' }">
      <div class="flex items-center justify-between">
        <p class="font-display text-sm font-semibold text-white">Quick Places</p>

        <NuxtLink
          to="/passenger/map"
          class="flex items-center gap-1 text-xs font-medium text-lime-300 hover:text-lime-200"
        >
          See all
          <UIcon name="i-lucide-chevron-right" class="size-3.5" />
        </NuxtLink>
      </div>

      <div class="mt-4 grid grid-cols-3 gap-3">
        <NuxtLink
          v-for="place in quickPlaces"
          :key="place.name"
          to="/passenger/map"
          class="card-lift flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-2 py-4 text-center"
        >
          <span class="flex size-9 items-center justify-center rounded-full bg-lime-300/15">
            <UIcon :name="place.icon" class="size-4 text-lime-300" />
          </span>

          <div>
            <p class="text-xs font-semibold text-white">{{ place.name }}</p>

            <p class="text-[10px] text-white/40">{{ place.subtitle }}</p>
          </div>
        </NuxtLink>
      </div>
    </UCard>

    <div class="grid gap-4 md:grid-cols-3">
      <UCard
        class="glass glow-lime card-lift rounded-3xl"
        :ui="{ root: 'ring-0 rounded-3xl', body: 'relative z-10', footer: 'relative z-10 border-white/10' }"
      >
        <div>
          <UIcon name="i-lucide-route" class="mb-3 size-8 text-lime-300" />

          <h2 class="font-display font-semibold text-white">Plan a Trip</h2>

          <p class="mt-1 text-sm text-white/50">
            Compare transportation options.
          </p>
        </div>

        <template #footer>
          <UButton to="/passenger/trip-planner" variant="soft" block class="rounded-full">
            Open Trip Planner
          </UButton>
        </template>
      </UCard>

      <UCard
        class="glass glow-lime card-lift rounded-3xl"
        :ui="{ root: 'ring-0 rounded-3xl', body: 'relative z-10', footer: 'relative z-10 border-white/10' }"
      >
        <div>
          <UIcon name="i-lucide-map" class="mb-3 size-8 text-lime-300" />

          <h2 class="font-display font-semibold text-white">Live Map</h2>

          <p class="mt-1 text-sm text-white/50">
            View routes and active vehicles.
          </p>
        </div>

        <template #footer>
          <UButton to="/passenger/map" variant="soft" block class="rounded-full">
            Open Map
          </UButton>
        </template>
      </UCard>

      <UCard
        class="glass glow-lime card-lift rounded-3xl"
        :ui="{ root: 'ring-0 rounded-3xl', body: 'relative z-10', footer: 'relative z-10 border-white/10' }"
      >
        <div>
          <UIcon
            name="i-lucide-message-square-warning"
            class="mb-3 size-8 text-lime-300"
          />

          <h2 class="font-display font-semibold text-white">Report Conditions</h2>

          <p class="mt-1 text-sm text-white/50">
            Help improve PAMANA's transport data.
          </p>
        </div>

        <template #footer>
          <UButton to="/passenger/reports" variant="soft" block class="rounded-full">
            My Reports
          </UButton>
        </template>
      </UCard>
    </div>
  </div>
</template>
