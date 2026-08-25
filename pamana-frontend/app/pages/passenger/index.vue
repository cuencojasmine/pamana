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
    <PamanaPageHeader
      role="passenger"
      :title="`Welcome, ${user?.username || 'Passenger'}`"
      subtitle="Plan trips and check availability across the pilot corridor."
    />

    <!-- TOP: hero trip search card -->
    <UCard
      class="glass glow-sunset rounded-30"
      :ui="{ root: 'ring-0 rounded-[1.75rem]', body: 'relative z-10' }"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-navigation" class="size-4 text-lime-600" />

          <p class="font-display text-sm font-semibold text-neutral-900">
            Plan Your Trip
          </p>
        </div>

        <UBadge variant="soft" color="neutral" class="!bg-neutral-900/[0.06] !text-neutral-500" size="sm">
          {{ PILOT_CORRIDOR }}
        </UBadge>
      </div>

      <div class="mt-5 space-y-2">
        <div
          class="flex items-center gap-3 rounded-2xl border border-neutral-900/10 bg-neutral-900/[0.04] px-4 py-3"
        >
          <span class="flex size-8 items-center justify-center rounded-full bg-neutral-900/[0.06]">
            <UIcon name="i-lucide-circle" class="size-3 text-neutral-500" />
          </span>

          <div>
            <p class="text-[11px] uppercase tracking-wide text-neutral-400">From</p>

            <p class="text-sm font-medium text-neutral-900">San Luis, Pampanga</p>
          </div>
        </div>

        <div class="flex items-center gap-3 pl-[1.15rem]">
          <div class="h-4 w-px border-l border-dashed border-neutral-900/12" />

          <UIcon name="i-lucide-arrow-down-up" class="size-3.5 text-neutral-400" />
        </div>

        <div
          class="flex items-center gap-3 rounded-2xl border border-lime-300/20 bg-lime-300/[0.06] px-4 py-3"
        >
          <span class="flex size-8 items-center justify-center rounded-full bg-lime-300/15">
            <UIcon name="i-lucide-map-pin" class="size-3.5 text-lime-600" />
          </span>

          <div>
            <p class="text-[11px] uppercase tracking-wide text-neutral-400">To</p>

            <p class="text-sm font-medium text-neutral-900">
              City of San Fernando, Pampanga
            </p>
          </div>
        </div>
      </div>

      <div class="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center gap-2 text-sm text-neutral-500">
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
    <UCard class="glass rounded-30" :ui="{ root: 'ring-0 rounded-[1.75rem]' }">
      <div class="flex items-center justify-between">
        <p class="font-display text-sm font-semibold text-neutral-900">Quick Places</p>

        <NuxtLink
          to="/passenger/map"
          class="flex items-center gap-1 text-xs font-medium text-lime-600 hover:text-lime-700"
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
          class="card-lift flex flex-col items-center gap-2 rounded-2xl border border-neutral-900/10 bg-neutral-900/[0.03] px-2 py-4 text-center"
        >
          <span class="flex size-9 items-center justify-center rounded-full bg-lime-300/15">
            <UIcon :name="place.icon" class="size-4 text-lime-600" />
          </span>

          <div>
            <p class="text-xs font-semibold text-neutral-900">{{ place.name }}</p>

            <p class="text-[10px] text-neutral-400">{{ place.subtitle }}</p>
          </div>
        </NuxtLink>
      </div>
    </UCard>

    <div class="grid gap-4 md:grid-cols-3">
      <UCard
        class="glass glow-lime card-lift rounded-30"
        :ui="{ root: 'ring-0 rounded-[1.75rem]', body: 'relative z-10', footer: 'relative z-10 border-neutral-900/10' }"
      >
        <div>
          <UIcon name="i-lucide-route" class="mb-3 size-8 text-lime-600" />

          <h2 class="font-display font-semibold text-neutral-900">Plan a Trip</h2>

          <p class="mt-1 text-sm text-neutral-500">
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
        class="glass glow-lime card-lift rounded-30"
        :ui="{ root: 'ring-0 rounded-[1.75rem]', body: 'relative z-10', footer: 'relative z-10 border-neutral-900/10' }"
      >
        <div>
          <UIcon name="i-lucide-map" class="mb-3 size-8 text-lime-600" />

          <h2 class="font-display font-semibold text-neutral-900">Live Map</h2>

          <p class="mt-1 text-sm text-neutral-500">
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
        class="glass glow-lime card-lift rounded-30"
        :ui="{ root: 'ring-0 rounded-[1.75rem]', body: 'relative z-10', footer: 'relative z-10 border-neutral-900/10' }"
      >
        <div>
          <UIcon
            name="i-lucide-message-square-warning"
            class="mb-3 size-8 text-lime-600"
          />

          <h2 class="font-display font-semibold text-neutral-900">Report Conditions</h2>

          <p class="mt-1 text-sm text-neutral-500">
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
