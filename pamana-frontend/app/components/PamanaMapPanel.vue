<script setup lang="ts">
withDefaults(defineProps<{
  icon?: string
  label?: string
  height?: string
  tone?: 'lime' | 'emerald' | 'teal' | 'red'
}>(), {
  icon: 'i-lucide-map',
  label: 'Map preview',
  height: '360px',
  tone: 'lime'
})

const toneClasses = {
  lime: 'text-lime-600',
  emerald: 'text-emerald-600',
  teal: 'text-teal-600',
  red: 'text-red-500'
}
</script>

<template>
  <div class="mapfake flex items-center justify-center" :style="{ minHeight: height }">
    <slot name="overlay" />

    <div class="relative z-10 text-center">
      <UIcon :name="icon" class="mx-auto size-9 opacity-55" :class="toneClasses[tone]" />
      <p class="mt-2 text-xs font-semibold text-neutral-500">{{ label }}</p>
    </div>

    <slot />
  </div>
</template>
