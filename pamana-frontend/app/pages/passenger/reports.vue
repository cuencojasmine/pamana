<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'passenger']
})

useHead({
  title: 'My Reports | PAMANA'
})

const toast = useToast()
const selectedType = ref('Flood')
const location = ref('Santo Tomas Stop (auto-detected)')

const reportTypes = ['Flood', 'Breakdown', 'Overcrowding', 'Road closure']

const reports = [
  {
    title: 'Flooding reported',
    details: 'Santo Tomas Stop · Today, 7:04 AM',
    label: 'Flood',
    icon: 'i-lucide-cloud-rain',
    tone: 'red'
  },
  {
    title: 'Overcrowded vehicle',
    details: 'Route SL–SF 01 · Yesterday, 5:41 PM',
    label: 'Overcrowding',
    icon: 'i-lucide-users',
    tone: 'amber'
  },
  {
    title: 'Road cleared',
    details: 'OGC Stop · May 20, 8:12 AM',
    label: 'Resolved',
    icon: 'i-lucide-check',
    tone: 'lime'
  }
]

function submitReport() {
  toast.add({
    title: 'Report prepared',
    description: `${selectedType.value} at ${location.value}. Crowdsourced submission will be connected in Hackathon Priority 8.`,
    color: 'success'
  })
}
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
          :disabled="!location.trim()"
          @click="submitReport"
        >
          Submit Report
        </UButton>

        <p class="mt-3 text-xs leading-relaxed text-neutral-400">
          Demo UI only. Reports are not sent until the crowdsourcing endpoint is connected.
        </p>
      </UCard>
    </div>
  </div>
</template>
