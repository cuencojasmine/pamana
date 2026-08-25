<script setup lang="ts">
import 'leaflet/dist/leaflet.css'

type MapItem = Record<string, any>

const props = withDefaults(defineProps<{
  height?: string
  center?: [number, number]
  zoom?: number
  markers?: MapItem[]
  routePoints?: MapItem[]
  userLocation?: { lat: number; lng: number } | null
  markerLabel?: (item: MapItem) => string
}>(), {
  height: '360px',
  center: () => [15.05, 120.70],
  zoom: 11,
  markers: () => [],
  routePoints: () => [],
  userLocation: null
})

const emit = defineEmits<{
  ready: [map: any]
}>()

const mapElement = ref<HTMLElement | null>(null)
let map: any = null
let markerLayer: any = null
let routeLayer: any = null
let userMarker: any = null

const defaultLabel = (item: MapItem) => item.label ?? item.name ?? item.title ?? item.vehicle_number ?? item.plate_number ?? 'Location'

function coordinates(item: MapItem): [number, number] | null {
  const lat = Number(item.latitude ?? item.lat ?? item.location?.latitude ?? item.location?.lat)
  const lng = Number(item.longitude ?? item.lng ?? item.lon ?? item.location?.longitude ?? item.location?.lng)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  return [lat, lng]
}

function clearLayers() {
  markerLayer?.clearLayers()
  routeLayer?.remove()
  routeLayer = null
  userMarker?.remove()
  userMarker = null
}

async function renderMap() {
  if (!map) return
  const L = await import('leaflet')

  clearLayers()

  markerLayer = L.layerGroup().addTo(map)
  const bounds: [number, number][] = []

  for (const item of props.markers) {
    const point = coordinates(item)
    if (!point) continue

    const marker = L.circleMarker(point, {
      radius: 7,
      weight: 2,
      fillOpacity: 0.9
    }).addTo(markerLayer)
    marker.bindPopup(props.markerLabel ? props.markerLabel(item) : defaultLabel(item))
    bounds.push(point)
  }

  const route = props.routePoints
    .map(coordinates)
    .filter((point): point is [number, number] => point !== null)

  if (route.length >= 2) {
    routeLayer = L.polyline(route, { weight: 5, opacity: 0.8 }).addTo(map)
    bounds.push(...route)
  }

  if (props.userLocation) {
    const point: [number, number] = [props.userLocation.lat, props.userLocation.lng]
    userMarker = L.circleMarker(point, {
      radius: 8,
      weight: 3,
      fillOpacity: 1
    }).addTo(map)
    userMarker.bindPopup('Your current location')
    bounds.push(point)
  }

  if (bounds.length) {
    map.fitBounds(bounds, { padding: [32, 32], maxZoom: 15 })
  }
}

onMounted(async () => {
  if (!mapElement.value) return

  const L = await import('leaflet')
  map = L.map(mapElement.value, {
    center: props.center,
    zoom: props.zoom,
    zoomControl: true,
    attributionControl: true
  })

  L.tileLayer(
    useRuntimeConfig().public.mapTileUrl || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }
  ).addTo(map)

  emit('ready', map)
  await renderMap()
})

watch(
  () => [props.markers, props.routePoints, props.userLocation],
  () => renderMap(),
  { deep: true }
)

onBeforeUnmount(() => {
  if (map) {
    map.remove()
    map = null
  }
})
</script>

<template>
  <div class="relative overflow-hidden rounded-[inherit]" :style="{ minHeight: height }">
    <div ref="mapElement" class="absolute inset-0 z-0" />
    <div class="pointer-events-none absolute inset-0 z-10">
      <slot />
    </div>
  </div>
</template>
