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
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950">
    <!-- Desktop Sidebar -->
    <aside
      class="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 lg:flex lg:flex-col"
    >
      <div
        class="flex h-20 items-center border-b border-gray-200 px-6 dark:border-gray-800"
      >
        <div>
          <h1 class="text-xl font-bold tracking-tight text-primary">PAMANA</h1>

          <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Rural Mobility Coordinator
          </p>
        </div>
      </div>

      <nav class="flex-1 space-y-1 overflow-y-auto p-4">
        <NuxtLink
          v-for="item in navigationItems"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition"
          :class="
            isActive(item.to)
              ? `
                bg-primary/10
                text-primary
              `
              : `
                text-gray-600
                hover:bg-gray-100
                dark:text-gray-300
                dark:hover:bg-gray-800
              `
          "
        >
          <UIcon :name="item.icon" class="size-5" />

          <span>
            {{ item.label }}
          </span>
        </NuxtLink>
      </nav>

      <div class="border-t border-gray-200 p-4 dark:border-gray-800">
        <div class="mb-3">
          <p
            class="truncate text-sm font-semibold text-gray-900 dark:text-white"
          >
            {{ user?.username }}
          </p>

          <p class="truncate text-xs text-gray-500 dark:text-gray-400">
            {{ roleLabel }}
          </p>
        </div>

        <UButton
          color="neutral"
          variant="soft"
          block
          icon="i-lucide-log-out"
          @click="logout"
        >
          Logout
        </UButton>
      </div>
    </aside>

    <!-- Mobile Header -->
    <header
      class="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-gray-900 lg:hidden"
    >
      <div>
        <h1 class="font-bold text-primary">PAMANA</h1>

        <p class="text-xs text-gray-500">
          {{ roleLabel }}
        </p>
      </div>

      <UButton
        color="neutral"
        variant="ghost"
        icon="i-lucide-menu"
        @click="isSidebarOpen = true"
      />
    </header>

    <!-- Mobile Navigation Drawer -->
    <USlideover v-model:open="isSidebarOpen" side="left">
      <template #content>
        <div class="flex h-full flex-col bg-white dark:bg-gray-900">
          <div
            class="flex h-20 items-center justify-between border-b border-gray-200 px-5 dark:border-gray-800"
          >
            <div>
              <h2 class="font-bold text-primary">PAMANA</h2>

              <p class="text-xs text-gray-500">
                {{ roleLabel }}
              </p>
            </div>

            <UButton
              color="neutral"
              variant="ghost"
              icon="i-lucide-x"
              @click="isSidebarOpen = false"
            />
          </div>

          <nav class="flex-1 space-y-1 overflow-y-auto p-4">
            <NuxtLink
              v-for="item in navigationItems"
              :key="item.to"
              :to="item.to"
              class="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium"
              :class="
                isActive(item.to)
                  ? 'bg-primary/10 text-primary'
                  : `
                    text-gray-600
                    dark:text-gray-300
                  `
              "
              @click="isSidebarOpen = false"
            >
              <UIcon :name="item.icon" class="size-5" />

              {{ item.label }}
            </NuxtLink>
          </nav>

          <div class="border-t border-gray-200 p-4 dark:border-gray-800">
            <p class="text-sm font-semibold">
              {{ user?.username }}
            </p>

            <p class="mb-3 text-xs text-gray-500">
              {{ user?.email }}
            </p>

            <UButton
              block
              color="neutral"
              variant="soft"
              icon="i-lucide-log-out"
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
        class="hidden h-20 items-center justify-between border-b border-gray-200 bg-white px-8 dark:border-gray-800 dark:bg-gray-900 lg:flex"
      >
        <div>
          <p class="text-sm text-gray-500 dark:text-gray-400">PAMANA</p>

          <p class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ roleLabel }} Workspace
          </p>
        </div>

        <div class="flex items-center gap-3">
          <UBadge color="primary" variant="soft">
            {{ roleLabel }}
          </UBadge>

          <div class="text-right">
            <p class="text-sm font-medium text-gray-900 dark:text-white">
              {{ user?.username }}
            </p>

            <p class="text-xs text-gray-500">
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
