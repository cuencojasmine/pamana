<script setup lang="ts">
//@ts-nocheck
const { user, role, logout, isPassenger, isDriver, isLGU, isAdministrator } =
  useAuth();

const route = useRoute();

const isSidebarOpen = ref(false);

const navigationItems = computed(() => {
  if (isPassenger.value) {
    return [
      {
        label: "Dashboard",
        icon: "i-lucide-layout-dashboard",
        to: "/passenger",
      },
      {
        label: "Trip Planner",
        icon: "i-lucide-route",
        to: "/passenger/trip-planner",
      },
      {
        label: "Live Map",
        icon: "i-lucide-map",
        to: "/passenger/map",
      },
      {
        label: "My Reports",
        icon: "i-lucide-message-square-warning",
        to: "/passenger/reports",
      },
    ];
  }

  if (isDriver.value) {
    return [
      {
        label: "Dashboard",
        icon: "i-lucide-layout-dashboard",
        to: "/driver",
      },
      {
        label: "Current Trip",
        icon: "i-lucide-navigation",
        to: "/driver/current-trip",
      },
      {
        label: "Demand Map",
        icon: "i-lucide-map-pinned",
        to: "/driver/demand-map",
      },
      {
        label: "Trip History",
        icon: "i-lucide-history",
        to: "/driver/history",
      },
    ];
  }

  if (isLGU.value) {
    return [
      {
        label: "Command Center",
        icon: "i-lucide-layout-dashboard",
        to: "/lgu",
      },
      {
        label: "Live Mobility",
        icon: "i-lucide-map",
        to: "/lgu/live-mobility",
      },
      {
        label: "Demand Analysis",
        icon: "i-lucide-chart-no-axes-combined",
        to: "/lgu/demand",
      },
      {
        label: "Disruptions",
        icon: "i-lucide-triangle-alert",
        to: "/lgu/disruptions",
      },
      {
        label: "Recommendations",
        icon: "i-lucide-brain-circuit",
        to: "/lgu/recommendations",
      },
    ];
  }

  if (isAdministrator.value) {
    return [
      {
        label: "Dashboard",
        icon: "i-lucide-layout-dashboard",
        to: "/admin",
      },
      {
        label: "Routes",
        icon: "i-lucide-route",
        to: "/admin/routes",
      },
      {
        label: "Stops",
        icon: "i-lucide-map-pin",
        to: "/admin/stops",
      },
      {
        label: "Vehicles",
        icon: "i-lucide-bus-front",
        to: "/admin/vehicles",
      },
      {
        label: "Drivers",
        icon: "i-lucide-id-card",
        to: "/admin/drivers",
      },
      {
        label: "Cooperatives",
        icon: "i-lucide-building-2",
        to: "/admin/cooperatives",
      },
      {
        label: "Users",
        icon: "i-lucide-users",
        to: "/admin/users",
      },
      {
        label: "Settings",
        icon: "i-lucide-settings",
        to: "/admin/settings",
      },
    ];
  }

  return [];
});

const isActive = (to: string) => {
  if (route.path === to) {
    return true;
  }

  const rootRoutes = ["/passenger", "/driver", "/lgu", "/admin"];

  if (rootRoutes.includes(to)) {
    return false;
  }

  return route.path.startsWith(`${to}/`);
};

const roleLabel = computed(() => {
  return role.value ?? "User";
});
</script>

<template>
  <div class="min-h-screen">
    <!-- Desktop Sidebar -->
    <aside
      class="glass-solid fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-neutral-900/10 lg:flex lg:flex-col"
    >
      <div class="flex h-20 items-center border-b border-neutral-900/10 px-6">
        <div class="flex items-center gap-3">
          <div
            class="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-lime-300 to-emerald-500 font-display text-base font-bold text-neutral-950"
          >
            P
          </div>

          <div>
            <h1 class="font-display text-lg font-bold tracking-tight text-neutral-900">
              PAMANA
            </h1>

            <p class="text-[11px] text-neutral-400">Rural Mobility Coordinator</p>
          </div>
        </div>
      </div>

      <nav class="flex-1 space-y-1 overflow-y-auto p-4">
        <NuxtLink
          v-for="item in navigationItems"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition"
          :class="
            isActive(item.to)
              ? `
                border border-lime-300/30
                bg-lime-300/15
                text-lime-600
              `
              : `
                border border-transparent
                text-neutral-500
                hover:border-neutral-900/10
                hover:bg-neutral-900/[0.04]
                hover:text-neutral-900
              `
          "
        >
          <UIcon :name="item.icon" class="size-5" />

          <span>
            {{ item.label }}
          </span>
        </NuxtLink>
      </nav>

      <div class="border-t border-neutral-900/10 p-4">
        <div class="mb-3">
          <p class="truncate text-sm font-semibold text-neutral-900">
            {{ user?.username }}
          </p>

          <p class="truncate text-xs text-neutral-400">
            {{ roleLabel }}
          </p>
        </div>

        <UButton
          color="neutral"
          variant="soft"
          block
          icon="i-lucide-log-out"
          class="bg-neutral-900/[0.04] text-neutral-700 hover:bg-neutral-900/[0.06]"
          @click="logout"
        >
          Logout
        </UButton>
      </div>
    </aside>

    <!-- Mobile Header -->
    <header
      class="glass-solid sticky top-0 z-30 flex h-16 items-center justify-between border-b border-neutral-900/10 px-4 lg:hidden"
    >
      <div class="flex items-center gap-2.5">
        <div
          class="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-lime-300 to-emerald-500 font-display text-xs font-bold text-neutral-950"
        >
          P
        </div>

        <div>
          <h1 class="font-display font-bold text-neutral-900">PAMANA</h1>

          <p class="text-[10px] text-neutral-400">
            {{ roleLabel }}
          </p>
        </div>
      </div>

      <UButton
        color="neutral"
        variant="ghost"
        icon="i-lucide-menu"
        class="text-neutral-600 hover:bg-neutral-900/[0.06] hover:text-neutral-900"
        @click="isSidebarOpen = true"
      />
    </header>

    <!-- Mobile Navigation Drawer -->
    <USlideover v-model:open="isSidebarOpen" side="left">
      <template #content>
        <div class="glass-solid flex h-full flex-col">
          <div
            class="flex h-20 items-center justify-between border-b border-neutral-900/10 px-5"
          >
            <div class="flex items-center gap-2.5">
              <div
                class="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-lime-300 to-emerald-500 font-display text-sm font-bold text-neutral-950"
              >
                P
              </div>

              <div>
                <h2 class="font-display font-bold text-neutral-900">PAMANA</h2>

                <p class="text-[10px] text-neutral-400">
                  {{ roleLabel }}
                </p>
              </div>
            </div>

            <UButton
              color="neutral"
              variant="ghost"
              icon="i-lucide-x"
              class="text-neutral-600 hover:bg-neutral-900/[0.06] hover:text-neutral-900"
              @click="isSidebarOpen = false"
            />
          </div>

          <nav class="flex-1 space-y-1 overflow-y-auto p-4">
            <NuxtLink
              v-for="item in navigationItems"
              :key="item.to"
              :to="item.to"
              class="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition"
              :class="
                isActive(item.to)
                  ? 'border border-lime-300/30 bg-lime-300/15 text-lime-600'
                  : 'border border-transparent text-neutral-500 hover:bg-neutral-900/[0.04]'
              "
              @click="isSidebarOpen = false"
            >
              <UIcon :name="item.icon" class="size-5" />

              {{ item.label }}
            </NuxtLink>
          </nav>

          <div class="border-t border-neutral-900/10 p-4">
            <p class="text-sm font-semibold text-neutral-900">
              {{ user?.username }}
            </p>

            <p class="mb-3 text-xs text-neutral-400">
              {{ user?.email }}
            </p>

            <UButton
              block
              color="neutral"
              variant="soft"
              icon="i-lucide-log-out"
              class="bg-neutral-900/[0.04] text-neutral-700 hover:bg-neutral-900/[0.06]"
              @click="logout"
            >
              Logout
            </UButton>
          </div>
        </div>
      </template>
    </USlideover>

    <!-- Main Content -->
    <div class="lg:pl-64">
      <header
        class="glass-solid hidden h-20 items-center justify-between border-b border-neutral-900/10 px-8 lg:flex"
      >
        <div>
          <p class="text-sm text-neutral-400">PAMANA</p>

          <p class="font-display text-lg font-semibold text-neutral-900">
            {{ roleLabel }} Workspace
          </p>
        </div>

        <div class="flex items-center gap-3">
          <UBadge class="!bg-lime-300/15 !text-lime-600 ring-1 ring-lime-300/30" variant="soft">
            {{ roleLabel }}
          </UBadge>

          <div class="text-right">
            <p class="text-sm font-medium text-neutral-900">
              {{ user?.username }}
            </p>

            <p class="text-xs text-neutral-400">
              {{ user?.email }}
            </p>
          </div>
        </div>
      </header>

      <main
        class="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:min-h-[calc(100vh-5rem)] lg:p-8"
      >
        <slot />
      </main>
    </div>
  </div>
</template>
