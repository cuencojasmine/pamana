<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'lgu']
})

useHead({
  title: 'Disruptions | PAMANA'
})

const { apiFetch } = useApi()
const { location: userLocation } = useGeolocation()
const toast = useToast()

interface Disruption {
  documentId: string
  type: string
  title: string
  description: string | null
  severity: string
  starts_at: string
  disruption_status: string
}

const TYPE_ICONS: Record<string, string> = {
  flood: 'i-lucide-cloud-rain',
  breakdown: 'i-lucide-wrench',
  road_closure: 'i-lucide-triangle-alert',
  accident: 'i-lucide-triangle-alert',
  weather: 'i-lucide-cloud',
  route_suspension: 'i-lucide-ban'
}

function formatReportedAt(iso: string) {
  const date = new Date(iso)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  const time = date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })

  if (isToday) return `Reported ${time}`

  return `Reported ${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}, ${time}`
}

const rawDisruptions = ref<Disruption[]>([])
const acknowledging = ref<string | null>(null)

const disruptions = computed(() =>
  rawDisruptions.value.map(item => {
    const isResolved = item.disruption_status !== 'active'
    const tone = isResolved ? 'lime' : item.severity === 'critical' || item.severity === 'high' ? 'red' : 'amber'
    const severityLabel = isResolved
      ? 'Resolved'
      : `${item.severity.charAt(0).toUpperCase()}${item.severity.slice(1)} severity`

    return {
      id: item.documentId,
      title: item.title,
      detail: `${formatReportedAt(item.starts_at)} · ${item.description || item.disruption_status}`,
      severity: severityLabel,
      tone,
      icon: TYPE_ICONS[item.type] ?? 'i-lucide-triangle-alert',
      acknowledged: isResolved
    }
  })
)

async function loadDisruptions() {
  try {
    const response = await apiFetch<{ data: Disruption[] }>('/api/disruptions', {
      query: { sort: 'starts_at:desc' }
    })
    rawDisruptions.value = response.data
  } catch {
    rawDisruptions.value = []
  }
}

async function acknowledge(id: string) {
  acknowledging.value = id

  try {
    await apiFetch(`/api/disruptions/${id}`, {
      method: 'PUT',
      body: { data: { disruption_status: 'resolved', ends_at: new Date().toISOString() } }
    })

    toast.add({
      title: 'Disruption acknowledged',
      description: 'Marked resolved.',
      color: 'success'
    })

    await loadDisruptions()
  } catch (error: any) {
    toast.add({
      title: 'Unable to acknowledge disruption',
      description: error?.data?.error?.message || 'Please try again.',
      color: 'error'
    })
  } finally {
    acknowledging.value = null
  }
}

onMounted(() => {
  loadDisruptions()
})
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
              :disabled="item.acknowledged || acknowledging === item.id"
              @click="acknowledge(item.id)"
            >
              {{ item.acknowledged ? 'Acknowledged' : acknowledging === item.id ? 'Acknowledging…' : 'Acknowledge' }}
            </button>
          </div>
        </UCard>
      </div>

      <PamanaMapPanel
        icon="i-lucide-map-pin"
        label="Disruption locations"
        height="340px"
        tone="red"
        :markers="rawDisruptions"
        :user-location="userLocation"
      />
    </div>
  </div>
</template>
