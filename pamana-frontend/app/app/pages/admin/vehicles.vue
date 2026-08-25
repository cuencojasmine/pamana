<script setup lang="ts">
//@ts-nocheck
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { Vehicle, Route, Cooperative, Driver } from '~/types/transportation'

definePageMeta({
  middleware: [
    'auth',
    'admin'
  ]
})

useHead({
  title: 'Vehicles | PAMANA'
})

const toast = useToast()

const {
  items: vehicles,
  loading,
  fetchAll,
  create,
  update,
  remove,
  extractErrorMessage
} = useCrud<Vehicle>('/api/vehicles')

const { items: routes, fetchAll: fetchRoutes } = useCrud<Route>('/api/routes')
const { items: cooperatives, fetchAll: fetchCooperatives } = useCrud<Cooperative>('/api/cooperatives')
const { items: drivers, fetchAll: fetchDrivers } = useCrud<Driver>('/api/drivers')

const isFormOpen = ref(false)
const isDeleteOpen = ref(false)
const saving = ref(false)
const deleting = ref(false)
const editingDocumentId = ref<string | null>(null)
const deletingVehicle = ref<Vehicle | null>(null)

const statusOptions = [
  { label: 'Available', value: 'available' },
  { label: 'In Transit', value: 'in_transit' },
  { label: 'Full', value: 'full' },
  { label: 'Offline', value: 'offline' }
]

const statusColor: Record<string, string> = {
  available: '!bg-lime-300/15 !text-lime-600 ring-1 ring-lime-300/30',
  in_transit: '!bg-blue-500/10 !text-blue-600 ring-1 ring-blue-500/20',
  full: '!bg-amber-500/10 !text-amber-600 ring-1 ring-amber-500/20',
  offline: '!bg-neutral-900/[0.06] !text-neutral-500'
}

const routeOptions = computed(() =>
  routes.value.map((route) => ({ label: route.route_name, value: route.id }))
)

const cooperativeOptions = computed(() =>
  cooperatives.value.map((coop) => ({ label: coop.name, value: coop.id }))
)

const driverOptions = computed(() =>
  drivers.value.map((driver) => ({
    label: `${driver.first_name} ${driver.last_name}`,
    value: driver.id
  }))
)

const schema = z.object({
  vehicle_number: z.string().min(1, 'Vehicle number is required'),
  plate_number: z.string().min(1, 'Plate number is required'),
  vehicle_type: z.string().min(1, 'Vehicle type is required'),
  capacity: z.union([z.number(), z.nan()]).optional(),
  vehicle_status: z.enum(['available', 'in_transit', 'full', 'offline']),
  route: z.number().optional(),
  cooperative: z.number().optional(),
  driver: z.number().optional()
})

type Schema = z.output<typeof schema>

const emptyState = (): Schema => ({
  vehicle_number: '',
  plate_number: '',
  vehicle_type: '',
  capacity: undefined,
  vehicle_status: 'available',
  route: undefined,
  cooperative: undefined,
  driver: undefined
})

const state = reactive<Schema>(emptyState())

const isEditing = computed(() => editingDocumentId.value !== null)

const load = async () => {
  try {
    await Promise.all([
      fetchAll({ populate: 'route,cooperative,driver' }),
      fetchRoutes({ 'pagination[pageSize]': 200 }),
      fetchCooperatives({ 'pagination[pageSize]': 200 }),
      fetchDrivers({ 'pagination[pageSize]': 200 })
    ])
  } catch (error) {
    toast.add({
      title: 'Failed to load vehicles',
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

const openEdit = (vehicle: Vehicle) => {
  editingDocumentId.value = vehicle.documentId
  Object.assign(state, {
    vehicle_number: vehicle.vehicle_number,
    plate_number: vehicle.plate_number,
    vehicle_type: vehicle.vehicle_type,
    capacity: vehicle.capacity ?? undefined,
    vehicle_status: vehicle.vehicle_status,
    route: vehicle.route?.id,
    cooperative: vehicle.cooperative?.id,
    driver: vehicle.driver?.id
  })
  isFormOpen.value = true
}

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  saving.value = true

  try {
    const payload = {
      ...event.data,
      capacity: event.data.capacity || null
    }

    if (isEditing.value && editingDocumentId.value) {
      await update(editingDocumentId.value, payload)
      toast.add({ title: 'Vehicle updated', color: 'success' })
    } else {
      await create(payload)
      toast.add({ title: 'Vehicle created', color: 'success' })
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

const confirmDelete = (vehicle: Vehicle) => {
  deletingVehicle.value = vehicle
  isDeleteOpen.value = true
}

const performDelete = async () => {
  if (!deletingVehicle.value) return

  deleting.value = true

  try {
    await remove(deletingVehicle.value.documentId)
    toast.add({ title: 'Vehicle deleted', color: 'success' })
    isDeleteOpen.value = false
    deletingVehicle.value = null
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
          Vehicles
        </h1>

        <p class="mt-2 text-neutral-500">
          Manage vehicles operating within the PAMANA transportation network.
        </p>
      </div>

      <UButton
        icon="i-lucide-plus"
        class="rounded-full font-semibold text-neutral-950 shadow-[0_12px_24px_-16px_rgba(77,124,15,0.8)]"
        @click="openCreate"
      >
        Add Vehicle
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
        v-else-if="vehicles.length === 0"
        class="flex flex-col items-center justify-center py-16 text-center"
      >
        <UIcon
          name="i-lucide-bus-front"
          class="mb-4 size-12 text-lime-600"
        />

        <h2 class="font-display text-lg font-semibold text-neutral-900">
          No vehicles yet
        </h2>

        <p class="mt-2 max-w-md text-sm text-neutral-500">
          Register the vehicles operating on the pilot corridor.
        </p>
      </div>

      <div
        v-else
        class="overflow-x-auto"
      >
        <table class="data-table">
          <thead>
            <tr class="border-b border-neutral-900/10 text-xs uppercase tracking-wide text-neutral-400">
              <th class="px-6 py-3 font-medium">Vehicle</th>
              <th class="px-6 py-3 font-medium">Plate No.</th>
              <th class="px-6 py-3 font-medium">Route</th>
              <th class="px-6 py-3 font-medium">Cooperative</th>
              <th class="px-6 py-3 font-medium">Driver</th>
              <th class="px-6 py-3 font-medium">Capacity</th>
              <th class="px-6 py-3 font-medium">Status</th>
              <th class="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="vehicle in vehicles"
              :key="vehicle.id"
              class="border-b border-neutral-900/5 last:border-0 hover:bg-neutral-900/[0.02]"
            >
              <td class="px-6 py-4">
                <p class="font-medium text-neutral-900">{{ vehicle.vehicle_number }}</p>
                <p class="text-xs text-neutral-400">{{ vehicle.vehicle_type }}</p>
              </td>

              <td class="px-6 py-4 text-neutral-600">
                {{ vehicle.plate_number }}
              </td>

              <td class="px-6 py-4 text-neutral-600">
                {{ vehicle.route?.route_name || '—' }}
              </td>

              <td class="px-6 py-4 text-neutral-600">
                {{ vehicle.cooperative?.name || '—' }}
              </td>

              <td class="px-6 py-4 text-neutral-600">
                {{ vehicle.driver ? `${vehicle.driver.first_name} ${vehicle.driver.last_name}` : '—' }}
              </td>

              <td class="px-6 py-4 text-neutral-600">
                {{ vehicle.capacity ?? '—' }}
              </td>

              <td class="px-6 py-4">
                <UBadge
                  :class="statusColor[vehicle.vehicle_status]"
                  variant="soft"
                >
                  {{ vehicle.vehicle_status.replace('_', ' ') }}
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
                    @click="openEdit(vehicle)"
                  />

                  <UButton
                    icon="i-lucide-trash-2"
                    color="error"
                    variant="soft"
                    size="xs"
                    @click="confirmDelete(vehicle)"
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
              {{ isEditing ? 'Edit Vehicle' : 'Add Vehicle' }}
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
              <div class="grid grid-cols-2 gap-4">
                <UFormField
                  label="Vehicle Number"
                  name="vehicle_number"
                  required
                >
                  <UInput
                    v-model="state.vehicle_number"
                    placeholder="e.g. V-001"
                    class="w-full"
                  />
                </UFormField>

                <UFormField
                  label="Plate Number"
                  name="plate_number"
                  required
                >
                  <UInput
                    v-model="state.plate_number"
                    placeholder="e.g. ABC 1234"
                    class="w-full"
                  />
                </UFormField>
              </div>

              <UFormField
                label="Vehicle Type"
                name="vehicle_type"
                required
              >
                <UInput
                  v-model="state.vehicle_type"
                  placeholder="e.g. Modern Jeepney, Tricycle"
                  class="w-full"
                />
              </UFormField>

              <div class="grid grid-cols-2 gap-4">
                <UFormField
                  label="Capacity"
                  name="capacity"
                >
                  <UInput
                    v-model.number="state.capacity"
                    type="number"
                    min="1"
                    class="w-full"
                  />
                </UFormField>

                <UFormField
                  label="Status"
                  name="vehicle_status"
                  required
                >
                  <USelect
                    v-model="state.vehicle_status"
                    :items="statusOptions"
                    class="w-full"
                  />
                </UFormField>
              </div>

              <UFormField
                label="Route"
                name="route"
              >
                <USelect
                  v-model="state.route"
                  :items="routeOptions"
                  placeholder="Unassigned"
                  class="w-full"
                />
              </UFormField>

              <UFormField
                label="Cooperative"
                name="cooperative"
              >
                <USelect
                  v-model="state.cooperative"
                  :items="cooperativeOptions"
                  placeholder="Unassigned"
                  class="w-full"
                />
              </UFormField>

              <UFormField
                label="Driver"
                name="driver"
              >
                <USelect
                  v-model="state.driver"
                  :items="driverOptions"
                  placeholder="Unassigned"
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
                  {{ isEditing ? 'Save Changes' : 'Create Vehicle' }}
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
              Delete vehicle?
            </h3>
          </template>

          <p class="text-sm text-neutral-600">
            This will permanently remove
            <span class="font-medium text-neutral-900">{{ deletingVehicle?.vehicle_number }}</span>.
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
