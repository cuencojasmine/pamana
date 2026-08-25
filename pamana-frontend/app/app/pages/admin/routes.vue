<script setup lang="ts">
//@ts-nocheck
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { Route } from '~/types/transportation'

definePageMeta({
  middleware: [
    'auth',
    'admin'
  ]
})

useHead({
  title: 'Routes | PAMANA'
})

const toast = useToast()

const {
  items: routes,
  loading,
  fetchAll,
  create,
  update,
  remove,
  extractErrorMessage
} = useCrud<Route>('/api/routes')

const isFormOpen = ref(false)
const isDeleteOpen = ref(false)
const saving = ref(false)
const deleting = ref(false)
const editingDocumentId = ref<string | null>(null)
const deletingRoute = ref<Route | null>(null)

const statusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' }
]

const schema = z.object({
  route_name: z.string().min(1, 'Route name is required'),
  route_code: z.string().min(1, 'Route code is required'),
  origin: z.string().min(1, 'Origin is required'),
  destination: z.string().min(1, 'Destination is required'),
  base_fare: z.union([z.number(), z.nan()]).optional(),
  estimated_travel_time: z.union([z.number(), z.nan()]).optional(),
  route_status: z.enum(['active', 'inactive'])
})

type Schema = z.output<typeof schema>

const emptyState = (): Schema => ({
  route_name: '',
  route_code: '',
  origin: '',
  destination: '',
  base_fare: undefined,
  estimated_travel_time: undefined,
  route_status: 'active'
})

const state = reactive<Schema>(emptyState())

const isEditing = computed(() => editingDocumentId.value !== null)

const load = async () => {
  try {
    await fetchAll()
  } catch (error) {
    toast.add({
      title: 'Failed to load routes',
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

const openEdit = (route: Route) => {
  editingDocumentId.value = route.documentId
  Object.assign(state, {
    route_name: route.route_name,
    route_code: route.route_code,
    origin: route.origin,
    destination: route.destination,
    base_fare: route.base_fare ?? undefined,
    estimated_travel_time: route.estimated_travel_time ?? undefined,
    route_status: route.route_status
  })
  isFormOpen.value = true
}

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  saving.value = true

  try {
    const payload = {
      ...event.data,
      base_fare: event.data.base_fare || null,
      estimated_travel_time: event.data.estimated_travel_time || null
    }

    if (isEditing.value && editingDocumentId.value) {
      await update(editingDocumentId.value, payload)
      toast.add({ title: 'Route updated', color: 'success' })
    } else {
      await create(payload)
      toast.add({ title: 'Route created', color: 'success' })
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

const confirmDelete = (route: Route) => {
  deletingRoute.value = route
  isDeleteOpen.value = true
}

const performDelete = async () => {
  if (!deletingRoute.value) return

  deleting.value = true

  try {
    await remove(deletingRoute.value.documentId)
    toast.add({ title: 'Route deleted', color: 'success' })
    isDeleteOpen.value = false
    deletingRoute.value = null
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
          Routes
        </h1>

        <p class="mt-2 text-neutral-500">
          Manage PAMANA transportation routes and corridor information.
        </p>
      </div>

      <UButton
        icon="i-lucide-plus"
        class="rounded-full font-semibold text-neutral-950 shadow-[0_12px_24px_-16px_rgba(77,124,15,0.8)]"
        @click="openCreate"
      >
        Add Route
      </UButton>
    </div>

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
        v-else-if="routes.length === 0"
        class="flex flex-col items-center justify-center py-16 text-center"
      >
        <UIcon
          name="i-lucide-route"
          class="mb-4 size-12 text-lime-600"
        />

        <h2 class="font-display text-lg font-semibold text-neutral-900">
          No routes yet
        </h2>

        <p class="mt-2 max-w-md text-sm text-neutral-500">
          Add the San Luis &harr; San Fernando corridor to get started.
        </p>
      </div>

      <div
        v-else
        class="overflow-x-auto"
      >
        <table class="data-table">
          <thead>
            <tr class="border-b border-neutral-900/10 text-xs uppercase tracking-wide text-neutral-400">
              <th class="px-6 py-3 font-medium">Route</th>
              <th class="px-6 py-3 font-medium">Code</th>
              <th class="px-6 py-3 font-medium">Origin &rarr; Destination</th>
              <th class="px-6 py-3 font-medium">Base Fare</th>
              <th class="px-6 py-3 font-medium">Est. Time</th>
              <th class="px-6 py-3 font-medium">Status</th>
              <th class="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="route in routes"
              :key="route.id"
              class="border-b border-neutral-900/5 last:border-0 hover:bg-neutral-900/[0.02]"
            >
              <td class="px-6 py-4 font-medium text-neutral-900">
                {{ route.route_name }}
              </td>

              <td class="px-6 py-4 text-neutral-600">
                {{ route.route_code }}
              </td>

              <td class="px-6 py-4 text-neutral-600">
                {{ route.origin }} &rarr; {{ route.destination }}
              </td>

              <td class="px-6 py-4 text-neutral-600">
                {{ route.base_fare ? `₱${route.base_fare}` : '—' }}
              </td>

              <td class="px-6 py-4 text-neutral-600">
                {{ route.estimated_travel_time ? `${route.estimated_travel_time} min` : '—' }}
              </td>

              <td class="px-6 py-4">
                <UBadge
                  :class="
                    route.route_status === 'active'
                      ? '!bg-lime-300/15 !text-lime-600 ring-1 ring-lime-300/30'
                      : '!bg-neutral-900/[0.06] !text-neutral-500'
                  "
                  variant="soft"
                >
                  {{ route.route_status }}
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
                    @click="openEdit(route)"
                  />

                  <UButton
                    icon="i-lucide-trash-2"
                    color="error"
                    variant="soft"
                    size="xs"
                    @click="confirmDelete(route)"
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
              {{ isEditing ? 'Edit Route' : 'Add Route' }}
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
                label="Route Name"
                name="route_name"
                required
              >
                <UInput
                  v-model="state.route_name"
                  placeholder="e.g. San Luis - San Fernando"
                  class="w-full"
                />
              </UFormField>

              <UFormField
                label="Route Code"
                name="route_code"
                required
              >
                <UInput
                  v-model="state.route_code"
                  placeholder="e.g. SL-SF-01"
                  class="w-full"
                />
              </UFormField>

              <div class="grid grid-cols-2 gap-4">
                <UFormField
                  label="Origin"
                  name="origin"
                  required
                >
                  <UInput
                    v-model="state.origin"
                    placeholder="San Luis"
                    class="w-full"
                  />
                </UFormField>

                <UFormField
                  label="Destination"
                  name="destination"
                  required
                >
                  <UInput
                    v-model="state.destination"
                    placeholder="San Fernando"
                    class="w-full"
                  />
                </UFormField>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <UFormField
                  label="Base Fare (₱)"
                  name="base_fare"
                >
                  <UInput
                    v-model.number="state.base_fare"
                    type="number"
                    min="0"
                    step="0.01"
                    class="w-full"
                  />
                </UFormField>

                <UFormField
                  label="Est. Travel Time (min)"
                  name="estimated_travel_time"
                >
                  <UInput
                    v-model.number="state.estimated_travel_time"
                    type="number"
                    min="0"
                    class="w-full"
                  />
                </UFormField>
              </div>

              <UFormField
                label="Status"
                name="route_status"
                required
              >
                <USelect
                  v-model="state.route_status"
                  :items="statusOptions"
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
                  {{ isEditing ? 'Save Changes' : 'Create Route' }}
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
              Delete route?
            </h3>
          </template>

          <p class="text-sm text-neutral-600">
            This will permanently remove
            <span class="font-medium text-neutral-900">{{ deletingRoute?.route_name }}</span>.
            Stops, vehicles, and trips linked to this route will be affected.
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
