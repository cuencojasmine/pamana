<script setup lang="ts">
//@ts-nocheck
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { Driver, Cooperative, Vehicle } from '~/types/transportation'

definePageMeta({
  middleware: [
    'auth',
    'admin'
  ]
})

useHead({
  title: 'Drivers | PAMANA'
})

const toast = useToast()

const {
  items: driversList,
  loading,
  fetchAll,
  create,
  update,
  remove,
  extractErrorMessage
} = useCrud<Driver>('/api/drivers')

const { items: cooperatives, fetchAll: fetchCooperatives } = useCrud<Cooperative>('/api/cooperatives')
const { items: vehicles, fetchAll: fetchVehicles } = useCrud<Vehicle>('/api/vehicles')

const isFormOpen = ref(false)
const isDeleteOpen = ref(false)
const saving = ref(false)
const deleting = ref(false)
const editingDocumentId = ref<string | null>(null)
const deletingDriver = ref<Driver | null>(null)

const statusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' }
]

const cooperativeOptions = computed(() =>
  cooperatives.value.map((coop) => ({ label: coop.name, value: coop.id }))
)

const vehicleOptions = computed(() =>
  vehicles.value.map((vehicle) => ({
    label: `${vehicle.vehicle_number} (${vehicle.plate_number})`,
    value: vehicle.id
  }))
)

const schema = z.object({
  driver_number: z.string().min(1, 'Driver number is required'),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  contact_number: z.string().optional(),
  license_number: z.string().optional(),
  driver_status: z.enum(['active', 'inactive']),
  cooperative: z.number().optional(),
  vehicle: z.number().optional()
})

type Schema = z.output<typeof schema>

const emptyState = (): Schema => ({
  driver_number: '',
  first_name: '',
  last_name: '',
  contact_number: '',
  license_number: '',
  driver_status: 'active',
  cooperative: undefined,
  vehicle: undefined
})

const state = reactive<Schema>(emptyState())

const isEditing = computed(() => editingDocumentId.value !== null)

const load = async () => {
  try {
    await Promise.all([
      fetchAll({ populate: 'cooperative,vehicle' }),
      fetchCooperatives({ 'pagination[pageSize]': 200 }),
      fetchVehicles({ 'pagination[pageSize]': 200 })
    ])
  } catch (error) {
    toast.add({
      title: 'Failed to load drivers',
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

const openEdit = (driver: Driver) => {
  editingDocumentId.value = driver.documentId
  Object.assign(state, {
    driver_number: driver.driver_number,
    first_name: driver.first_name,
    last_name: driver.last_name,
    contact_number: driver.contact_number || '',
    license_number: driver.license_number || '',
    driver_status: driver.driver_status,
    cooperative: driver.cooperative?.id,
    vehicle: driver.vehicle?.id
  })
  isFormOpen.value = true
}

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  saving.value = true

  try {
    if (isEditing.value && editingDocumentId.value) {
      await update(editingDocumentId.value, event.data)
      toast.add({ title: 'Driver updated', color: 'success' })
    } else {
      await create(event.data)
      toast.add({ title: 'Driver created', color: 'success' })
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

const confirmDelete = (driver: Driver) => {
  deletingDriver.value = driver
  isDeleteOpen.value = true
}

const performDelete = async () => {
  if (!deletingDriver.value) return

  deleting.value = true

  try {
    await remove(deletingDriver.value.documentId)
    toast.add({ title: 'Driver deleted', color: 'success' })
    isDeleteOpen.value = false
    deletingDriver.value = null
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
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p class="text-sm font-medium text-lime-600">
          Transportation Management
        </p>

        <h1 class="mt-1 font-display text-3xl font-bold tracking-tight text-neutral-900">
          Drivers
        </h1>

        <p class="mt-2 text-neutral-500">
          Manage PAMANA driver profiles and transportation assignments.
        </p>
      </div>

      <UButton
        icon="i-lucide-plus"
        class="font-semibold text-neutral-950"
        @click="openCreate"
      >
        Add Driver
      </UButton>
    </div>

    <UCard
      class="glass glow-lime rounded-3xl"
      :ui="{ root: 'ring-0 rounded-3xl', body: 'relative z-10 p-0' }"
    >
      <div
        v-if="loading"
        class="flex items-center justify-center py-16"
      >
        <div class="h-8 w-8 animate-spin rounded-full border-4 border-neutral-900/10 border-t-lime-300" />
      </div>

      <div
        v-else-if="driversList.length === 0"
        class="flex flex-col items-center justify-center py-16 text-center"
      >
        <UIcon
          name="i-lucide-id-card"
          class="mb-4 size-12 text-lime-600"
        />

        <h2 class="font-display text-lg font-semibold text-neutral-900">
          No drivers yet
        </h2>

        <p class="mt-2 max-w-md text-sm text-neutral-500">
          Add the drivers operating on the pilot corridor.
        </p>
      </div>

      <div
        v-else
        class="overflow-x-auto"
      >
        <table class="w-full text-left text-sm">
          <thead>
            <tr class="border-b border-neutral-900/10 text-xs uppercase tracking-wide text-neutral-400">
              <th class="px-6 py-3 font-medium">Driver</th>
              <th class="px-6 py-3 font-medium">Driver No.</th>
              <th class="px-6 py-3 font-medium">Contact</th>
              <th class="px-6 py-3 font-medium">Cooperative</th>
              <th class="px-6 py-3 font-medium">Vehicle</th>
              <th class="px-6 py-3 font-medium">Status</th>
              <th class="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="driver in driversList"
              :key="driver.id"
              class="border-b border-neutral-900/5 last:border-0 hover:bg-neutral-900/[0.02]"
            >
              <td class="px-6 py-4">
                <p class="font-medium text-neutral-900">{{ driver.first_name }} {{ driver.last_name }}</p>
                <p
                  v-if="driver.license_number"
                  class="text-xs text-neutral-400"
                >
                  Lic. {{ driver.license_number }}
                </p>
              </td>

              <td class="px-6 py-4 text-neutral-600">
                {{ driver.driver_number }}
              </td>

              <td class="px-6 py-4 text-neutral-600">
                {{ driver.contact_number || '—' }}
              </td>

              <td class="px-6 py-4 text-neutral-600">
                {{ driver.cooperative?.name || '—' }}
              </td>

              <td class="px-6 py-4 text-neutral-600">
                {{ driver.vehicle?.vehicle_number || '—' }}
              </td>

              <td class="px-6 py-4">
                <UBadge
                  :class="
                    driver.driver_status === 'active'
                      ? '!bg-lime-300/15 !text-lime-600 ring-1 ring-lime-300/30'
                      : '!bg-neutral-900/[0.06] !text-neutral-500'
                  "
                  variant="soft"
                >
                  {{ driver.driver_status }}
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
                    @click="openEdit(driver)"
                  />

                  <UButton
                    icon="i-lucide-trash-2"
                    color="error"
                    variant="soft"
                    size="xs"
                    @click="confirmDelete(driver)"
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
              {{ isEditing ? 'Edit Driver' : 'Add Driver' }}
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
                  label="First Name"
                  name="first_name"
                  required
                >
                  <UInput
                    v-model="state.first_name"
                    placeholder="Juan"
                    class="w-full"
                  />
                </UFormField>

                <UFormField
                  label="Last Name"
                  name="last_name"
                  required
                >
                  <UInput
                    v-model="state.last_name"
                    placeholder="Dela Cruz"
                    class="w-full"
                  />
                </UFormField>
              </div>

              <UFormField
                label="Driver Number"
                name="driver_number"
                required
              >
                <UInput
                  v-model="state.driver_number"
                  placeholder="e.g. D-001"
                  class="w-full"
                />
              </UFormField>

              <UFormField
                label="Contact Number"
                name="contact_number"
              >
                <UInput
                  v-model="state.contact_number"
                  placeholder="09XX XXX XXXX"
                  class="w-full"
                />
              </UFormField>

              <UFormField
                label="License Number"
                name="license_number"
              >
                <UInput
                  v-model="state.license_number"
                  placeholder="Driver's license number"
                  class="w-full"
                />
              </UFormField>

              <UFormField
                label="Status"
                name="driver_status"
                required
              >
                <USelect
                  v-model="state.driver_status"
                  :items="statusOptions"
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
                label="Vehicle"
                name="vehicle"
              >
                <USelect
                  v-model="state.vehicle"
                  :items="vehicleOptions"
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
                  {{ isEditing ? 'Save Changes' : 'Create Driver' }}
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
              Delete driver?
            </h3>
          </template>

          <p class="text-sm text-neutral-600">
            This will permanently remove
            <span class="font-medium text-neutral-900">{{ deletingDriver?.first_name }} {{ deletingDriver?.last_name }}</span>.
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
