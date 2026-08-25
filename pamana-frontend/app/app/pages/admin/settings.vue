<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'admin']
})

useHead({
  title: 'Settings | PAMANA'
})

const toast = useToast()

const highDemandThreshold = ref(10)
const waitTimeSensitivity = ref(10)
const verificationReports = ref(3)

const permissions = reactive({
  passengerReports: true,
  driverOccupancy: true,
  lguAlerts: true
})

function saveSettings() {
  toast.add({
    title: 'Settings saved locally',
    description: 'Backend persistence will be added with the system configuration module.',
    color: 'success'
  })
}
</script>

<template>
  <div>
    <PamanaPageHeader title="Settings" role="admin">
      <template #actions>
        <UButton icon="i-lucide-save" class="rounded-full font-semibold text-neutral-950" @click="saveSettings">
          Save Settings
        </UButton>
      </template>
    </PamanaPageHeader>

    <div class="grid gap-4 md:grid-cols-2">
      <UCard class="glass rounded-30" :ui="{ root: 'ring-0 rounded-30' }">
        <h2 class="flex items-center gap-1.5 font-display text-sm font-semibold text-neutral-900">
          <UIcon name="i-lucide-sliders-horizontal" class="size-4 text-green-800" />
          AI prediction thresholds
        </h2>

        <div class="mt-5 space-y-5 text-xs">
          <label class="block">
            <span class="mb-2 flex justify-between gap-3"><span>High-demand threshold</span><strong>{{ highDemandThreshold }}</strong></span>
            <input v-model.number="highDemandThreshold" type="range" min="1" max="15" class="w-full accent-green-700" />
          </label>
          <label class="block">
            <span class="mb-2 flex justify-between gap-3"><span>Wait-time sensitivity</span><strong>{{ waitTimeSensitivity }}</strong></span>
            <input v-model.number="waitTimeSensitivity" type="range" min="1" max="20" class="w-full accent-green-700" />
          </label>
          <label class="block">
            <span class="mb-2 flex justify-between gap-3"><span>Crowdsource verification minimum</span><strong>{{ verificationReports }}</strong></span>
            <input v-model.number="verificationReports" type="range" min="1" max="10" class="w-full accent-green-700" />
          </label>
        </div>
      </UCard>

      <UCard class="glass rounded-30" :ui="{ root: 'ring-0 rounded-30' }">
        <h2 class="flex items-center gap-1.5 font-display text-sm font-semibold text-neutral-900">
          <UIcon name="i-lucide-shield-check" class="size-4 text-green-800" />
          Roles & permissions
        </h2>

        <div class="mt-5 space-y-4 text-sm">
          <label class="flex items-center justify-between gap-4">
            <span class="text-neutral-700">Passengers can submit reports</span>
            <USwitch v-model="permissions.passengerReports" color="success" />
          </label>
          <label class="flex items-center justify-between gap-4">
            <span class="text-neutral-700">Drivers can edit occupancy</span>
            <USwitch v-model="permissions.driverOccupancy" color="success" />
          </label>
          <label class="flex items-center justify-between gap-4">
            <span class="text-neutral-700">LGU can dispatch alerts</span>
            <USwitch v-model="permissions.lguAlerts" color="success" />
          </label>
        </div>
      </UCard>

      <UCard class="glass rounded-30 md:col-span-2" :ui="{ root: 'ring-0 rounded-30' }">
        <h2 class="flex items-center gap-1.5 font-display text-sm font-semibold text-neutral-900">
          <UIcon name="i-lucide-database" class="size-4 text-green-800" />
          System & audit
        </h2>

        <div class="mt-4 grid gap-3 text-xs sm:grid-cols-3">
          <div class="rounded-xl bg-neutral-900/[0.035] p-3"><p class="text-neutral-400">System version</p><p class="mt-1 font-semibold text-neutral-900">1.3</p></div>
          <div class="rounded-xl bg-neutral-900/[0.035] p-3"><p class="text-neutral-400">Data last updated</p><p class="mt-1 font-semibold text-neutral-900">1 min ago</p></div>
          <div class="rounded-xl bg-neutral-900/[0.035] p-3"><p class="text-neutral-400">Demo mode</p><p class="mt-1 font-semibold text-lime-700">On</p></div>
        </div>

        <button type="button" class="btn-soft mt-4 text-xs">
          <UIcon name="i-lucide-scroll-text" class="size-3.5" />
          View audit logs
        </button>
      </UCard>
    </div>

    <p class="mt-4 text-xs text-neutral-400">Settings update the interface only until a system configuration endpoint is available.</p>
  </div>
</template>
