<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'lgu']
})

useHead({
  title: 'Recommendations | PAMANA'
})

const toast = useToast()

const recommendations = ref([
  {
    id: 1,
    confidence: 92,
    title: 'Dispatch 3 additional jeepneys to San Luis Terminal',
    body: "Predicted surge 7:00–8:00 AM based on historical demand and today's passenger reports.",
    status: 'pending'
  },
  {
    id: 2,
    confidence: 78,
    title: 'Reroute around Santo Tomas flood segment',
    body: 'Active flood disruption may delay 3 scheduled trips by 15+ minutes.',
    status: 'pending'
  }
])

const actioned = [
  { title: 'Add van dispatch — SM City corridor', confidence: 85, action: 'Approved', date: 'May 20' },
  { title: 'Alert cooperative — low supply OGC Stop', confidence: 81, action: 'Approved', date: 'May 19' },
  { title: 'Reroute — road works Santo Tomas', confidence: 63, action: 'Dismissed', date: 'May 18' }
]

function setStatus(id: number, status: 'approved' | 'dismissed') {
  const item = recommendations.value.find(recommendation => recommendation.id === id)
  if (item) item.status = status

  toast.add({
    title: status === 'approved' ? 'Recommendation approved' : 'Recommendation dismissed',
    description: 'This prototype decision is stored only for the current session.',
    color: status === 'approved' ? 'success' : 'neutral'
  })
}
</script>

<template>
  <div>
    <PamanaPageHeader title="Recommendations" role="lgu" />

    <div class="grid gap-4 md:grid-cols-2">
      <UCard
        v-for="item in recommendations"
        :key="item.id"
        class="glass glow-teal rounded-30"
        :ui="{ root: 'ring-0 rounded-30', body: 'relative z-10' }"
      >
        <div class="flex items-center justify-between gap-3">
          <span class="pill bg-teal-100 text-teal-700 normal-case">
            <UIcon name="i-lucide-brain-circuit" class="size-3.5" />
            AI recommendation
          </span>
          <span class="text-xs text-neutral-400">{{ item.confidence }}% confidence</span>
        </div>

        <h2 class="mt-4 font-display font-semibold text-neutral-900">{{ item.title }}</h2>
        <p class="mt-2 text-sm leading-relaxed text-neutral-500">{{ item.body }}</p>

        <div v-if="item.status === 'pending'" class="mt-5 flex flex-wrap gap-2">
          <button type="button" class="btn-primary text-xs" @click="setStatus(item.id, 'approved')">Approve & Dispatch</button>
          <button type="button" class="btn-soft text-xs" @click="setStatus(item.id, 'dismissed')">Dismiss</button>
        </div>
        <span
          v-else
          class="pill mt-5"
          :class="item.status === 'approved' ? 'bg-lime-300/15 text-lime-700' : 'bg-neutral-100 text-neutral-500'"
        >
          {{ item.status }}
        </span>
      </UCard>

      <UCard class="glass rounded-30 md:col-span-2" :ui="{ root: 'ring-0 rounded-30' }">
        <h2 class="font-display text-sm font-semibold text-neutral-900">Recently actioned</h2>
        <div class="mt-4 overflow-x-auto">
          <table class="data-table">
            <thead><tr><th>Recommendation</th><th>Confidence</th><th>Action taken</th><th>Date</th></tr></thead>
            <tbody>
              <tr v-for="item in actioned" :key="item.title">
                <td class="font-medium">{{ item.title }}</td>
                <td>{{ item.confidence }}%</td>
                <td>
                  <span class="pill" :class="item.action === 'Approved' ? 'bg-lime-300/15 text-lime-700' : 'bg-neutral-100 text-neutral-500'">
                    {{ item.action }}
                  </span>
                </td>
                <td>{{ item.date }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </UCard>
    </div>

    <p class="mt-4 text-xs text-neutral-400">Recommendation values are simulated and clearly labeled for prototype use.</p>
  </div>
</template>
