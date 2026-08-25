<script setup lang="ts">
withDefaults(defineProps<{
  label: string
  value: string | number
  icon?: string
  tone?: 'neutral' | 'lime' | 'teal' | 'amber' | 'red'
}>(), {
  tone: 'neutral'
})

const toneClasses = {
  neutral: 'text-neutral-900',
  lime: 'text-lime-700',
  teal: 'text-teal-700',
  amber: 'text-amber-700',
  red: 'text-red-600'
}
</script>

<template>
  <div class="glass card-lift rounded-2xl p-4">
    <p class="flex items-center gap-1.5 text-[11px] font-medium text-neutral-400">
      <UIcon v-if="icon" :name="icon" class="size-3.5" />
      {{ label }}
    </p>
    <p class="stat-num mt-1 text-2xl" :class="toneClasses[tone]">
      {{ value }}
    </p>
  </div>
</template>
