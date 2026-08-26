<script setup lang="ts">
// @ts-nocheck

definePageMeta({
  middleware: ['auth', 'passenger']
})

useHead({
  title: 'My Reports | PAMANA'
})

const { apiFetch } = useApi()
const toast = useToast()

const selectedType = ref('Flood')
const location = ref('')
const submitting = ref(false)
const loadingReports = ref(false)
const detectingLocation = ref(false)
const locationStatus = ref<
  'idle' | 'detecting' | 'detected' | 'denied' | 'error'
>('idle')

const coordinates = ref<{
  latitude: number
  longitude: number
} | null>(null)

const reportTypes = [
  {
    label: 'Flood',
    value: 'flood',
    icon: 'i-lucide-cloud-rain',
    tone: 'red'
  },
  {
    label: 'Breakdown',
    value: 'vehicle_breakdown',
    icon: 'i-lucide-wrench',
    tone: 'amber'
  },
  {
    label: 'Overcrowding',
    value: 'vehicle_full',
    icon: 'i-lucide-users',
    tone: 'amber'
  },
  {
    label: 'Road closure',
    value: 'route_unavailable',
    icon: 'i-lucide-triangle-alert',
    tone: 'red'
  }
]

const REPORT_TYPE_MAP: Record<string, string> = {
  Flood: 'flood',
  Breakdown: 'vehicle_breakdown',
  Overcrowding: 'vehicle_full',
  'Road closure': 'route_unavailable'
}

const REPORT_TYPE_DISPLAY: Record<
  string,
  {
    label: string
    icon: string
    tone: string
  }
> = {
  flood: {
    label: 'Flood',
    icon: 'i-lucide-cloud-rain',
    tone: 'red'
  },
  vehicle_breakdown: {
    label: 'Breakdown',
    icon: 'i-lucide-wrench',
    tone: 'amber'
  },
  vehicle_full: {
    label: 'Overcrowding',
    icon: 'i-lucide-users',
    tone: 'amber'
  },
  route_unavailable: {
    label: 'Road closure',
    icon: 'i-lucide-triangle-alert',
    tone: 'red'
  },
  vehicle_arrived: {
    label: 'Vehicle arrived',
    icon: 'i-lucide-bus-front',
    tone: 'lime'
  },
  seats_available: {
    label: 'Seats available',
    icon: 'i-lucide-check',
    tone: 'lime'
  }
}

interface PassengerReport {
  id?: number
  documentId: string
  report_type: string
  location_note: string | null
  reported_at: string | null
  createdAt?: string
}

const rawReports = ref<PassengerReport[]>([])

const reports = computed(() => {
  return rawReports.value.map((report, index) => {
    const display =
      REPORT_TYPE_DISPLAY[report.report_type] ?? {
        label: report.report_type || 'Report',
        icon: 'i-lucide-info',
        tone: 'lime'
      }

    const reportedAt =
      report.reported_at ||
      report.createdAt ||
      ''

    return {
      id:
        report.documentId ||
        report.id ||
        `${report.report_type}-${index}`,
      title: `${display.label} reported`,
      details: `${
        report.location_note || 'Location not specified'
      } · ${formatReportedAt(reportedAt)}`,
      label: display.label,
      icon: display.icon,
      tone: display.tone
    }
  })
})

const locationStatusText = computed(() => {
  if (locationStatus.value === 'detecting') {
    return 'Detecting your current location...'
  }

  if (locationStatus.value === 'detected') {
    return 'Current GPS location detected. You can edit the location description.'
  }

  if (locationStatus.value === 'denied') {
    return 'Location permission was denied. Enter the location manually.'
  }

  if (locationStatus.value === 'error') {
    return 'Current location is unavailable. Enter the location manually.'
  }

  return 'Enter the stop, road, barangay, or landmark.'
})

function formatReportedAt(iso: string) {
  if (!iso) {
    return 'Recently'
  }

  const date = new Date(iso)

  if (Number.isNaN(date.getTime())) {
    return 'Recently'
  }

  const now = new Date()
  const isToday =
    date.toDateString() === now.toDateString()

  const time = date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit'
  })

  if (isToday) {
    return `Today, ${time}`
  }

  return `${date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric'
  })}, ${time}`
}

async function loadReports() {
  loadingReports.value = true

  try {
    const response = await apiFetch<{
      data: PassengerReport[]
    }>('/api/passenger-reports', {
      query: {
        sort: 'reported_at:desc',
        'pagination[pageSize]': 50
      }
    })

    rawReports.value = Array.isArray(response?.data)
      ? response.data
      : []
  } catch (error: any) {
    rawReports.value = []

    toast.add({
      title: 'Unable to load reports',
      description:
        error?.data?.error?.message ||
        error?.statusMessage ||
        'Please refresh and try again.',
      color: 'error'
    })
  } finally {
    loadingReports.value = false
  }
}

function detectCurrentLocation(
  showErrorToast = true
) {
  if (!import.meta.client) {
    return
  }

  if (!navigator.geolocation) {
    locationStatus.value = 'error'

    if (showErrorToast) {
      toast.add({
        title: 'Location unavailable',
        description:
          'This browser does not support location services.',
        color: 'error'
      })
    }

    return
  }

  detectingLocation.value = true
  locationStatus.value = 'detecting'

  navigator.geolocation.getCurrentPosition(
    position => {
      const latitude =
        position.coords.latitude

      const longitude =
        position.coords.longitude

      coordinates.value = {
        latitude,
        longitude
      }

      location.value =
        `Current location (${latitude.toFixed(6)}, ` +
        `${longitude.toFixed(6)})`

      locationStatus.value = 'detected'
      detectingLocation.value = false
    },
    error => {
      detectingLocation.value = false

      if (error.code === error.PERMISSION_DENIED) {
        locationStatus.value = 'denied'

        if (showErrorToast) {
          toast.add({
            title: 'Location permission denied',
            description:
              'Allow location access or enter the location manually.',
            color: 'warning'
          })
        }

        return
      }

      locationStatus.value = 'error'

      if (showErrorToast) {
        toast.add({
          title: 'Unable to detect location',
          description:
            'Enter the stop, road, or landmark manually.',
          color: 'error'
        })
      }
    },
    {
      enableHighAccuracy: false,
      timeout: 8000,
      maximumAge: 60000
    }
  )
}

async function submitReport() {
  const cleanLocation = location.value.trim()
  const reportType =
    REPORT_TYPE_MAP[selectedType.value]

  if (!cleanLocation) {
    toast.add({
      title: 'Location required',
      description:
        'Enter or detect the location of the condition.',
      color: 'error'
    })

    return
  }

  if (!reportType) {
    toast.add({
      title: 'Report type required',
      description:
        'Select the type of condition you want to report.',
      color: 'error'
    })

    return
  }

  submitting.value = true

  try {
    await apiFetch('/api/passenger-reports', {
      method: 'POST',
      body: {
        data: {
          report_type: reportType,
          location_note: cleanLocation
        }
      }
    })

    toast.add({
      title: 'Report submitted',
      description:
        `${selectedType.value} at ${cleanLocation}.`,
      color: 'success'
    })

    await loadReports()
  } catch (error: any) {
    toast.add({
      title: 'Unable to submit report',
      description:
        error?.data?.error?.message ||
        error?.statusMessage ||
        'Please try again.',
      color: 'error'
    })
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadReports()

  // Requests GPS permission when the page opens.
  detectCurrentLocation(false)
})
</script>

<template>
  <div>
    <PamanaPageHeader
      title="My Reports"
      role="passenger"
    />

    <div class="grid gap-5 lg:grid-cols-3">
      <!-- Previous reports -->
      <div class="space-y-3 lg:col-span-2">
        <div
          v-if="loadingReports"
          class="glass flex min-h-48 items-center justify-center rounded-30 p-6"
        >
          <div class="text-center">
            <div
              class="mx-auto size-9 animate-spin rounded-full border-4 border-neutral-900/10 border-t-lime-500"
            />

            <p class="mt-3 text-sm text-neutral-500">
              Loading your reports...
            </p>
          </div>
        </div>

        <UCard
          v-for="report in reports"
          v-else
          :key="report.id"
          class="glass card-lift rounded-30"
          :ui="{ root: 'ring-0 rounded-30' }"
        >
          <div class="flex items-center gap-3">
            <span
              class="flex size-10 shrink-0 items-center justify-center rounded-full"
              :class="{
                'bg-red-100 text-red-600':
                  report.tone === 'red',
                'bg-amber-100 text-amber-700':
                  report.tone === 'amber',
                'bg-lime-300/20 text-lime-700':
                  report.tone === 'lime'
              }"
            >
              <UIcon
                :name="report.icon"
                class="size-4"
              />
            </span>

            <div class="min-w-0 flex-1">
              <p
                class="text-sm font-semibold text-neutral-900"
              >
                {{ report.title }}
              </p>

              <p
                class="mt-0.5 text-xs text-neutral-500"
              >
                {{ report.details }}
              </p>
            </div>

            <span
              class="pill hidden shrink-0 sm:inline-flex"
              :class="{
                'bg-red-100 text-red-600':
                  report.tone === 'red',
                'bg-amber-100 text-amber-700':
                  report.tone === 'amber',
                'bg-lime-300/15 text-lime-700':
                  report.tone === 'lime'
              }"
            >
              {{ report.label }}
            </span>
          </div>
        </UCard>

        <UCard
          v-if="!loadingReports && !reports.length"
          class="glass rounded-30"
          :ui="{ root: 'ring-0 rounded-30' }"
        >
          <div
            class="flex flex-col items-center py-8 text-center"
          >
            <span
              class="flex size-12 items-center justify-center rounded-2xl bg-lime-300/15"
            >
              <UIcon
                name="i-lucide-clipboard-list"
                class="size-6 text-lime-600"
              />
            </span>

            <h2
              class="mt-3 font-display font-semibold text-neutral-900"
            >
              No reports yet
            </h2>

            <p
              class="mt-1 max-w-sm text-sm text-neutral-500"
            >
              Reports you submit will appear here.
            </p>
          </div>
        </UCard>
      </div>

      <!-- New report -->
      <UCard
        class="glass glow-lime h-fit rounded-30"
        :ui="{
          root: 'ring-0 rounded-30',
          body: 'relative z-10'
        }"
      >
        <div class="flex items-center gap-2">
          <UIcon
            name="i-lucide-message-square-warning"
            class="size-5 text-lime-600"
          />

          <h2
            class="font-display text-sm font-semibold text-neutral-900"
          >
            New report
          </h2>
        </div>

        <form
          class="report-form mt-4"
          @submit.prevent="submitReport"
        >
          <!-- Report types -->
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="type in reportTypes"
              :key="type.value"
              type="button"
              class="flex min-h-20 flex-col items-center justify-center rounded-xl border px-2 py-2.5 text-xs font-semibold transition"
              :class="
                selectedType === type.label
                  ? 'border-lime-500 bg-lime-50 text-lime-700 ring-1 ring-lime-300/30'
                  : 'border-neutral-200 bg-white/70 text-neutral-600 hover:border-lime-300 hover:bg-lime-50/50'
              "
              @click="selectedType = type.label"
            >
              <UIcon
                :name="type.icon"
                class="mb-1.5 size-5"
              />

              {{ type.label }}
            </button>
          </div>

          <!-- Location -->
          <UFormField
            label="Location"
            required
            class="mt-4"
          >
            <UInput
              v-model="location"
              icon="i-lucide-map-pin"
              placeholder="Stop, road, barangay, or landmark"
              autocomplete="off"
              color="neutral"
              variant="outline"
              size="lg"
              class="report-location-input w-full"
            />
          </UFormField>

          <p
            class="mt-2 text-xs"
            :class="
              locationStatus === 'detected'
                ? 'text-lime-700'
                : locationStatus === 'denied' ||
                    locationStatus === 'error'
                  ? 'text-amber-700'
                  : 'text-neutral-500'
            "
          >
            {{ locationStatusText }}
          </p>

          <UButton
            type="button"
            block
            variant="soft"
            color="neutral"
            icon="i-lucide-locate-fixed"
            class="mt-3 rounded-full"
            :loading="detectingLocation"
            :disabled="detectingLocation"
            @click="detectCurrentLocation(true)"
          >
            Use Current Location
          </UButton>

          <UButton
            type="submit"
            block
            size="lg"
            icon="i-lucide-send"
            class="submit-report-button mt-3 rounded-full font-semibold"
            :loading="submitting"
            :disabled="
              submitting ||
              detectingLocation ||
              !location.trim()
            "
          >
            Submit Report
          </UButton>
        </form>
      </UCard>
    </div>
  </div>
</template>

<style scoped>
.report-form :deep(label) {
  color: #262626 !important;
  font-weight: 600 !important;
}

.report-location-input :deep(input) {
  background-color: #ffffff !important;
  color: #171717 !important;
  caret-color: #65a30d !important;
}

.report-location-input :deep(input::placeholder) {
  color: #737373 !important;
  opacity: 1 !important;
}

.report-location-input :deep(input:focus) {
  outline: none !important;
}

.submit-report-button {
  background-color: #84cc16 !important;
  color: #171717 !important;
}

.submit-report-button:hover {
  background-color: #65a30d !important;
  color: #ffffff !important;
}

.submit-report-button:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}
</style>