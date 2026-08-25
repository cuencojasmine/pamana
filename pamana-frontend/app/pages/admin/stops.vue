<script setup lang="ts">
//@ts-nocheck
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { RouteStop, Route } from '~/types/transportation'

definePageMeta({
  middleware: [
    'auth',
    'admin'
  ]
})

useHead({
  title: 'Stops | PAMANA'
})

const toast = useToast()

const {
  items: stops,
  loading,
  fetchAll,
  create,
  update,
  remove,
  extractErrorMessage
} = useCrud<RouteStop>('/api/route-stops')

const { items: routes, fetchAll: fetchRoutes } = useCrud<Route>('/api/routes')

const isFormOpen = ref(false)
const isDeleteOpen = ref(false)
const saving = ref(false)
const deleting = ref(false)
const editingDocumentId = ref<string | null>(null)
const deletingStop = ref<RouteStop | null>(null)

const stopTypeOptions = [
  { label: 'Pickup', value: 'pickup' },
  { label: 'Drop-off', value: 'dropoff' },
  { label: 'Both', value: 'both' },
  { label: 'Terminal', value: 'terminal' }
]

const routeOptions = computed(() =>
  routes.value.map((route) => ({ label: route.route_name, value: route.id }))
)

const schema = z.object({
  name: z.string().min(1, 'Stop name is required'),
  route: z.number({ invalid_type_error: 'Route is required' }),
  sequence: z.number().min(1, 'Sequence must be at least 1'),
  latitude: z.number(),
  longitude: z.number(),
  stop_type: z.enum(['pickup', 'dropoff', 'both', 'terminal']).optional()
})

type Schema = z.output<typeof schema>

const emptyState = (): Schema => ({
  name: '',
  route: undefined,
  sequence: 1,
  latitude: undefined,
  longitude: undefined,
  stop_type: 'both'
})

const state = reactive<Schema>(emptyState())

const isEditing = computed(() => editingDocumentId.value !== null)

const routeName = (stop: RouteStop) => stop.route?.route_name || '—'

const load = async () => {
  try {
    await Promise.all([
      fetchAll({ populate: 'route' }),
      fetchRoutes({ 'pagination[pageSize]': 200 })
    ])
  } catch (error) {
    toast.add({
      title: 'Failed to load stops',
      description: extractErrorMessage(error),
      color: 'error'
    })
  }
}

onMounted(load)

const openCreate = () => {
  editingDocumentId.value = null
  Object.assign(state, emptyState())
  isFormOpen.value = true
}

const openEdit = (stop: RouteStop) => {
  editingDocumentId.value = stop.documentId
  Object.assign(state, {
    name: stop.name,
    route: stop.route?.id,
    sequence: stop.sequence,
    latitude: stop.latitude,
    longitude: stop.longitude,
    stop_type: stop.stop_type || 'both'
  })
  isFormOpen.value = true
}

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  saving.value = true

  try {
    if (isEditing.value && editingDocumentId.value) {
      await update(editingDocumentId.value, event.data)
      toast.add({ title: 'Stop updated', color: 'success' })
    } else {
      await create(event.data)
      toast.add({ title: 'Stop created', color: 'success' })
    }

    isFormOpen.value = false
    await load()
  } catch (error) {
    toast.add({
      title: 'Save failed',
      description: extractErrorMessage(error),
      color: 'error'
    })
  } finally {
    saving.value = false
  }
}

const confirmDelete = (stop: RouteStop) => {
  deletingStop.value = stop
  isDeleteOpen.value = true
}

const performDelete = async () => {
  if (!deletingStop.value) return

  deleting.value = true

  try {
    await remove(deletingStop.value.documentId)
    toast.add({ title: 'Stop deleted', color: 'success' })
    isDeleteOpen.value = false
    deletingStop.value = null
    await load()
  } catch (error) {
    toast.add({
      title: 'Delete failed',
      description: extractErrorMessage(error),
      color: 'error'
    })
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="glass glow-lime rounded-30 flex flex-wrap items-start justify-between gap-4 p-5 sm:p-6">
      <div>
        <p class="text-sm font-medium text-lime-600">
          Transportation Management
        </p>

        <h1 class="mt-1 font-display text-3xl font-bold tracking-tight text-neutral-900">
          Stops
        </h1>

        <p class="mt-2 text-neutral-500">
          Manage pickup points, loading areas, and route-stop locations.
        </p>
      </div>

      <UButton
        icon="i-lucide-plus"
        class="rounded-full font-semibold text-neutral-950 shadow-[0_12px_24px_-16px_rgba(77,124,15,0.8)]"
        :disabled="routes.length === 0"
        @click="openCreate"
      >
        Add Stop
      </UButton>
    </div>

    <UAlert
      v-if="!loading && routes.length === 0"
      color="warning"
      variant="soft"
      icon="i-lucide-triangle-alert"
      title="Add a route first"
      description="Stops must be assigned to a route. Create a route before adding stops."
    />

    <UCard
      class="glass rounded-30"
      :ui="{ root: 'ring-0 rounded-3xl', body: 'relative z-10 p-0' }"
    >
      <div
        v-if="loading"
        class="flex items-center justify-center py-16"
      >
        <div class="h-8 w-8 animate-spin rounded-full border-4 border-neutral-900/10 border-t-lime-300" />
      </div>

      <div
        v-else-if="stops.length === 0"
        class="flex flex-col items-center justify-center py-16 text-center"
      >
        <UIcon
          name="i-lucide-map-pin"
          class="mb-4 size-12 text-lime-600"
        />

        <h2 class="font-display text-lg font-semibold text-neutral-900">
          No stops yet
        </h2>

        <p class="mt-2 max-w-md text-sm text-neutral-500">
          Add pickup and drop-off points along your routes.
        </p>
      </div>

      <div
        v-else
        class="overflow-x-auto"
      >
        <table class="data-table">
          <thead>
            <tr class="border-b border-neutral-900/10 text-xs uppercase tracking-wide text-neutral-400">
              <th class="px-6 py-3 font-medium">Stop</th>
              <th class="px-6 py-3 font-medium">Route</th>
              <th class="px-6 py-3 font-medium">Sequence</th>
              <th class="px-6 py-3 font-medium">Coordinates</th>
              <th class="px-6 py-3 font-medium">Type</th>
              <th class="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="stop in stops"
              :key="stop.id"
              class="border-b border-neutral-900/5 last:border-0 hover:bg-neutral-900/[0.02]"
            >
              <td class="px-6 py-4 font-medium text-neutral-900">
                {{ stop.name }}
              </td>

              <td class="px-6 py-4 text-neutral-600">
                {{ routeName(stop) }}
              </td>

              <td class="px-6 py-4 text-neutral-600">
                {{ stop.sequence }}
              </td>

              <td class="px-6 py-4 text-neutral-600">
                {{ stop.latitude }}, {{ stop.longitude }}
              </td>

              <td class="px-6 py-4">
                <UBadge
                  class="!bg-neutral-900/[0.06] !text-neutral-600"
                  variant="soft"
                >
                  {{ stop.stop_type || 'both' }}
                </UBadge>
              </td>

              <td class="px-6 py-4">
                <div class="flex justify-end gap-2">
                  <UButton
                    icon="i-lucide-pencil"
                    color="neutral"
                    variant="soft"
                    size="xs"
                    class="bg-neutral-900/[0.04] text-neutral-700 hover:bg-neutral-900/[0.06]"
                    @click="openEdit(stop)"
                  />

                  <UButton
                    icon="i-lucide-trash-2"
                    color="error"
                    variant="soft"
                    size="xs"
                    @click="confirmDelete(stop)"
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </UCard>

    <USlideover v-model:open="isFormOpen">
      <template #content>
        <div class="glass-solid flex h-full flex-col">
          <div class="flex h-20 items-center justify-between border-b border-neutral-900/10 px-6">
            <h2 class="font-display text-lg font-semibold text-neutral-900">
              {{ isEditing ? 'Edit Stop' : 'Add Stop' }}
            </h2>

            <UButton
              color="neutral"
              variant="ghost"
              icon="i-lucide-x"
              @click="isFormOpen = false"
            />
          </div>

          <div class="flex-1 overflow-y-auto p-6">
            <UForm
              :schema="schema"
              :state="state"
              class="space-y-5"
              @submit="onSubmit"
            >
              <UFormField
                label="Stop Name"
                name="name"
                required
              >
                <UInput
                  v-model="state.name"
                  placeholder="e.g. San Luis Public Market"
                  class="w-full"
                />
              </UFormField>

              <UFormField
                label="Route"
                name="route"
                required
              >
                <USelect
                  v-model="state.route"
                  :items="routeOptions"
                  placeholder="Select a route"
                  class="w-full"
                />
              </UFormField>

              <UFormField
                label="Sequence"
                name="sequence"
                required
                help="Order of this stop along the route (1 = first)"
              >
                <UInput
                  v-model.number="state.sequence"
                  type="number"
                  min="1"
                  class="w-full"
                />
              </UFormField>

              <div class="grid grid-cols-2 gap-4">
                <UFormField
                  label="Latitude"
                  name="latitude"
                  required
                >
                  <UInput
                    v-model.number="state.latitude"
                    type="number"
                    step="0.000001"
                    placeholder="15.0181"
                    class="w-full"
                  />
                </UFormField>

                <UFormField
                  label="Longitude"
                  name="longitude"
                  required
                >
                  <UInput
                    v-model.number="state.longitude"
                    type="number"
                    step="0.000001"
                    placeholder="120.6473"
                    class="w-full"
                  />
                </UFormField>
              </div>

              <UFormField
                label="Stop Type"
                name="stop_type"
              >
                <USelect
                  v-model="state.stop_type"
                  :items="stopTypeOptions"
                  class="w-full"
                />
              </UFormField>

              <div class="flex gap-3 pt-2">
                <UButton
                  type="submit"
                  block
                  class="font-semibold text-neutral-950"
                  :loading="saving"
                  :disabled="saving"
                >
                  {{ isEditing ? 'Save Changes' : 'Create Stop' }}
                </UButton>
              </div>
            </UForm>
          </div>
        </div>
      </template>
    </USlideover>

    <UModal v-model:open="isDeleteOpen">
      <template #content>
        <UCard :ui="{ root: 'rounded-3xl' }">
          <template #header>
            <h3 class="font-display text-lg font-semibold text-neutral-900">
              Delete stop?
            </h3>
          </template>

          <p class="text-sm text-neutral-600">
            This will permanently remove
            <span class="font-medium text-neutral-900">{{ deletingStop?.name }}</span>.
          </p>

          <template #footer>
            <div class="flex justify-end gap-3">
              <UButton
                color="neutral"
                variant="soft"
                :disabled="deleting"
                @click="isDeleteOpen = false"
              >
                Cancel
              </UButton>

              <UButton
                color="error"
                :loading="deleting"
                :disabled="deleting"
                @click="performDelete"
              >
                Delete
              </UButton>
            </div>
          </template>
        </UCard>
      </template>
    </UModal>
  </div>
</template>
