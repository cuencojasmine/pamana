<script setup lang="ts">
//@ts-nocheck
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { Cooperative } from '~/types/transportation'

definePageMeta({
  middleware: [
    'auth',
    'admin'
  ]
})

useHead({
  title: 'Cooperatives | PAMANA'
})

const toast = useToast()

const {
  items: cooperatives,
  loading,
  fetchAll,
  create,
  update,
  remove,
  extractErrorMessage
} = useCrud<Cooperative>('/api/cooperatives')

const isFormOpen = ref(false)
const isDeleteOpen = ref(false)
const saving = ref(false)
const deleting = ref(false)
const editingDocumentId = ref<string | null>(null)
const deletingCooperative = ref<Cooperative | null>(null)

const statusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' }
]

const schema = z.object({
  name: z.string().min(1, 'Cooperative name is required'),
  address: z.string().optional(),
  contact_person: z.string().optional(),
  contact_number: z.string().optional(),
  cooperative_status: z.enum(['active', 'inactive'])
})

type Schema = z.output<typeof schema>

const emptyState = (): Schema => ({
  name: '',
  address: '',
  contact_person: '',
  contact_number: '',
  cooperative_status: 'active'
})

const state = reactive<Schema>(emptyState())

const isEditing = computed(() => editingDocumentId.value !== null)

const load = async () => {
  try {
    await fetchAll()
  } catch (error) {
    toast.add({
      title: 'Failed to load cooperatives',
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

const openEdit = (cooperative: Cooperative) => {
  editingDocumentId.value = cooperative.documentId
  Object.assign(state, {
    name: cooperative.name,
    address: cooperative.address || '',
    contact_person: cooperative.contact_person || '',
    contact_number: cooperative.contact_number || '',
    cooperative_status: cooperative.cooperative_status
  })
  isFormOpen.value = true
}

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  saving.value = true

  try {
    if (isEditing.value && editingDocumentId.value) {
      await update(editingDocumentId.value, event.data)
      toast.add({ title: 'Cooperative updated', color: 'success' })
    } else {
      await create(event.data)
      toast.add({ title: 'Cooperative created', color: 'success' })
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

const confirmDelete = (cooperative: Cooperative) => {
  deletingCooperative.value = cooperative
  isDeleteOpen.value = true
}

const performDelete = async () => {
  if (!deletingCooperative.value) return

  deleting.value = true

  try {
    await remove(deletingCooperative.value.documentId)
    toast.add({ title: 'Cooperative deleted', color: 'success' })
    isDeleteOpen.value = false
    deletingCooperative.value = null
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
          Cooperatives
        </h1>

        <p class="mt-2 text-neutral-500">
          Manage transport cooperatives participating in the PAMANA network.
        </p>
      </div>

      <UButton
        icon="i-lucide-plus"
        class="font-semibold text-neutral-950"
        @click="openCreate"
      >
        Add Cooperative
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
        v-else-if="cooperatives.length === 0"
        class="flex flex-col items-center justify-center py-16 text-center"
      >
        <UIcon
          name="i-lucide-building-2"
          class="mb-4 size-12 text-lime-600"
        />

        <h2 class="font-display text-lg font-semibold text-neutral-900">
          No cooperatives yet
        </h2>

        <p class="mt-2 max-w-md text-sm text-neutral-500">
          Add the transport cooperatives operating on the pilot corridor.
        </p>
      </div>

      <div
        v-else
        class="overflow-x-auto"
      >
        <table class="w-full text-left text-sm">
          <thead>
            <tr class="border-b border-neutral-900/10 text-xs uppercase tracking-wide text-neutral-400">
              <th class="px-6 py-3 font-medium">Name</th>
              <th class="px-6 py-3 font-medium">Contact Person</th>
              <th class="px-6 py-3 font-medium">Contact Number</th>
              <th class="px-6 py-3 font-medium">Status</th>
              <th class="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="cooperative in cooperatives"
              :key="cooperative.id"
              class="border-b border-neutral-900/5 last:border-0 hover:bg-neutral-900/[0.02]"
            >
              <td class="px-6 py-4 font-medium text-neutral-900">
                {{ cooperative.name }}
              </td>

              <td class="px-6 py-4 text-neutral-600">
                {{ cooperative.contact_person || '—' }}
              </td>

              <td class="px-6 py-4 text-neutral-600">
                {{ cooperative.contact_number || '—' }}
              </td>

              <td class="px-6 py-4">
                <UBadge
                  :class="
                    cooperative.cooperative_status === 'active'
                      ? '!bg-lime-300/15 !text-lime-600 ring-1 ring-lime-300/30'
                      : '!bg-neutral-900/[0.06] !text-neutral-500'
                  "
                  variant="soft"
                >
                  {{ cooperative.cooperative_status }}
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
                    @click="openEdit(cooperative)"
                  />

                  <UButton
                    icon="i-lucide-trash-2"
                    color="error"
                    variant="soft"
                    size="xs"
                    @click="confirmDelete(cooperative)"
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
              {{ isEditing ? 'Edit Cooperative' : 'Add Cooperative' }}
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
                label="Cooperative Name"
                name="name"
                required
              >
                <UInput
                  v-model="state.name"
                  placeholder="e.g. San Luis Transport Cooperative"
                  class="w-full"
                />
              </UFormField>

              <UFormField
                label="Contact Person"
                name="contact_person"
              >
                <UInput
                  v-model="state.contact_person"
                  placeholder="Full name"
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
                label="Address"
                name="address"
              >
                <UTextarea
                  v-model="state.address"
                  placeholder="Cooperative address"
                  class="w-full"
                  :rows="3"
                />
              </UFormField>

              <UFormField
                label="Status"
                name="cooperative_status"
                required
              >
                <USelect
                  v-model="state.cooperative_status"
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
                  {{ isEditing ? 'Save Changes' : 'Create Cooperative' }}
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
              Delete cooperative?
            </h3>
          </template>

          <p class="text-sm text-neutral-600">
            This will permanently remove
            <span class="font-medium text-neutral-900">{{ deletingCooperative?.name }}</span>.
            Vehicles and drivers linked to this cooperative will be unassigned.
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
