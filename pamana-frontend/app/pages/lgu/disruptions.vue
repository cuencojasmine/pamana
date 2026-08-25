<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'lgu']
})

useHead({
  title: 'Disruptions | PAMANA'
})

const toast = useToast()

const disruptions = ref([
  { id: 1, title: 'Flood — San Luis Segment', detail: 'Reported 7:04 AM · active · road partially passable', severity: 'High severity', tone: 'red', icon: 'i-lucide-cloud-rain', acknowledged: false },
  { id: 2, title: 'Vehicle breakdown — NAA-1236', detail: 'Reported 6:20 AM · dispatcher notified', severity: 'Medium', tone: 'amber', icon: 'i-lucide-wrench', acknowledged: false },
  { id: 3, title: 'Road clearance — OGC Stop', detail: 'Resolved yesterday, 8:12 AM', severity: 'Resolved', tone: 'lime', icon: 'i-lucide-check', acknowledged: true }
])

function acknowledge(id: number) {
  const disruption = disruptions.value.find(item => item.id === id)
  if (disruption) disruption.acknowledged = true

  toast.add({
    title: 'Disruption acknowledged',
    description: 'The prototype status was updated locally.',
    color: 'success'
  })
}
</script>

<template>
  <div>
    <PamanaPageHeader title="Disruptions" role="lgu" />

    <div class="grid gap-5 lg:grid-cols-3">
      <div class="space-y-3 lg:col-span-2">
        <UCard
          v-for="item in disruptions"
          :key="item.id"
          class="glass card-lift rounded-30"
          :class="item.tone === 'lime' ? 'opacity-65' : ''"
          :ui="{ root: 'ring-0 rounded-30' }"
        >
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
            <span
              class="flex size-10 shrink-0 items-center justify-center rounded-full"
              :class="{
                'bg-red-100 text-red-600': item.tone === 'red',
                'bg-amber-100 text-amber-700': item.tone === 'amber',
                'bg-lime-300/20 text-lime-700': item.tone === 'lime'
              }"
            >
              <UIcon :name="item.icon" class="size-4" />
            </span>

            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-2">
                <h2 class="text-sm font-semibold text-neutral-900">{{ item.title }}</h2>
                <span
                  class="pill"
                  :class="{
                    'bg-red-100 text-red-600': item.tone === 'red',
                    'bg-amber-100 text-amber-700': item.tone === 'amber',
                    'bg-lime-300/15 text-lime-700': item.tone === 'lime'
                  }"
                >
                  {{ item.severity }}
                </span>
              </div>
              <p class="mt-1 text-xs text-neutral-400">{{ item.detail }}</p>
            </div>

            <button
              v-if="item.tone !== 'lime'"
              type="button"
              class="btn-soft shrink-0 text-xs"
              :disabled="item.acknowledged"
              @click="acknowledge(item.id)"
            >
              {{ item.acknowledged ? 'Acknowledged' : 'Acknowledge' }}
            </button>
          </div>
        </UCard>
      </div>

      <PamanaMapPanel icon="i-lucide-map-pin" label="Disruption locations" height="340px" tone="red" />
    </div>
  </div>
</template>
