<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'passenger']
})

useHead({
  title: 'My Reports | PAMANA'
})

const { apiFetch } = useApi()
const toast = useToast()
const selectedType = ref('Flood')
const location = ref('Santo Tomas Stop (auto-detected)')
const submitting = ref(false)

const reportTypes = ['Flood', 'Breakdown', 'Overcrowding', 'Road closure']

const REPORT_TYPE_MAP: Record<string, string> = {
  Flood: 'flood',
  Breakdown: 'vehicle_breakdown',
  Overcrowding: 'vehicle_full',
  'Road closure': 'route_unavailable'
}

const REPORT_TYPE_DISPLAY: Record<string, { label: string; icon: string; tone: string }> = {
  flood: { label: 'Flood', icon: 'i-lucide-cloud-rain', tone: 'red' },
  vehicle_breakdown: { label: 'Breakdown', icon: 'i-lucide-wrench', tone: 'amber' },
  vehicle_full: { label: 'Overcrowding', icon: 'i-lucide-users', tone: 'amber' },
  route_unavailable: { label: 'Road closure', icon: 'i-lucide-triangle-alert', tone: 'red' },
  vehicle_arrived: { label: 'Vehicle arrived', icon: 'i-lucide-bus-front', tone: 'lime' },
  seats_available: { label: 'Seats available', icon: 'i-lucide-check', tone: 'lime' }
}

interface PassengerReport {
  documentId: string
  report_type: string
  location_note: string | null
  reported_at: string
}

function formatReportedAt(iso: string) {
  const date = new Date(iso)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  const time = date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })

  if (isToday) return `Today, ${time}`

  return `${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}, ${time}`
}

const rawReports = ref<PassengerReport[]>([])

const reports = computed(() =>
  rawReports.value.map(report => {
    const display = REPORT_TYPE_DISPLAY[report.report_type] ?? {
      label: report.report_type,
      icon: 'i-lucide-info',
      tone: 'lime'
    }

    return {
      title: `${display.label} reported`,
      details: `${report.location_note || 'Location not specified'} · ${formatReportedAt(report.reported_at)}`,
      label: display.label,
      icon: display.icon,
      tone: display.tone
    }
  })
)

async function loadReports() {
  try {
    const response = await apiFetch<{ data: PassengerReport[] }>('/api/passenger-reports', {
      query: { sort: 'reported_at:desc' }
    })
    rawReports.value = response.data
  } catch {
    rawReports.value = []
  }
}

async function submitReport() {
  submitting.value = true

  try {
    await apiFetch('/api/passenger-reports', {
      method: 'POST',
      body: {
        data: {
          report_type: REPORT_TYPE_MAP[selectedType.value],
          location_note: location.value || undefined
        }
      }
    })

    toast.add({
      title: 'Report submitted',
      description: `${selectedType.value} at ${location.value}.`,
      color: 'success'
    })

    await loadReports()
  } catch (error: any) {
    toast.add({
      title: 'Unable to submit report',
      description: error?.data?.error?.message || 'Please try again.',
      color: 'error'
    })
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadReports()
})
</script>

<template>
  <div>
    <PamanaPageHeader title="My Reports" role="passenger" />

    <div class="grid gap-5 lg:grid-cols-3">
      <div class="space-y-3 lg:col-span-2">
        <UCard
          v-for="report in reports"
          :key="report.title"
          class="glass card-lift rounded-30"
          :ui="{ root: 'ring-0 rounded-30' }"
        >
          <div class="flex items-center gap-3">
            <span
              class="flex size-10 shrink-0 items-center justify-center rounded-full"
              :class="{
                'bg-red-100 text-red-600': report.tone === 'red',
                'bg-amber-100 text-amber-700': report.tone === 'amber',
                'bg-lime-300/20 text-lime-700': report.tone === 'lime'
              }"
            >
              <UIcon :name="report.icon" class="size-4" />
            </span>

            <div class="min-w-0 flex-1">
              <p class="text-sm font-semibold text-neutral-900">{{ report.title }}</p>
              <p class="mt-0.5 text-xs text-neutral-400">{{ report.details }}</p>
            </div>

            <span
              class="pill shrink-0"
              :class="{
                'bg-red-100 text-red-600': report.tone === 'red',
                'bg-amber-100 text-amber-700': report.tone === 'amber',
                'bg-lime-300/15 text-lime-700': report.tone === 'lime'
              }"
            >
              {{ report.label }}
            </span>
          </div>
        </UCard>
      </div>

      <UCard class="glass glow-lime rounded-30" :ui="{ root: 'ring-0 rounded-30', body: 'relative z-10' }">
        <h2 class="font-display text-sm font-semibold text-neutral-900">New report</h2>

        <div class="mt-4 grid grid-cols-2 gap-2">
          <button
            v-for="type in reportTypes"
            :key="type"
            type="button"
            class="rounded-xl border py-2.5 text-xs font-semibold"
            :class="selectedType === type
              ? 'border-lime-500 bg-lime-50 text-lime-700 ring-1 ring-lime-300/30'
              : 'border-neutral-900/10 bg-white/40 text-neutral-500 hover:border-neutral-900/20'"
            @click="selectedType = type"
          >
            {{ type }}
          </button>
        </div>

        <UFormField label="Location" class="mt-4">
          <UInput v-model="location" icon="i-lucide-map-pin" class="w-full" />
        </UFormField>

        <UButton
          block
          size="lg"
          icon="i-lucide-send"
          class="mt-4 rounded-full font-semibold text-neutral-950"
          :loading="submitting"
          :disabled="submitting || !location.trim()"
          @click="submitReport"
        >
          Submit Report
        </UButton>
      </UCard>
    </div>
  </div>
</template>
