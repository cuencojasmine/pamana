export function useGeolocation() {
  const location = useState<{ lat: number; lng: number } | null>('user-location', () => null)
  const error = useState<string | null>('user-location-error', () => null)
  const loading = useState<boolean>('user-location-loading', () => false)
  const watchId = useState<number | null>('user-location-watch-id', () => null)

  function start() {
    if (!import.meta.client || !navigator.geolocation) {
      error.value = 'Geolocation is not supported by this browser.'
      return
    }

    // The composable is used by the app shell and multiple map pages. Keep one
    // browser watcher so navigation never causes duplicate permission prompts.
    if (watchId.value !== null) return

    loading.value = true
    watchId.value = navigator.geolocation.watchPosition(
      position => {
        location.value = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
        error.value = null
        loading.value = false
      },
      geolocationError => {
        error.value = geolocationError.message
        loading.value = false
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
    )
  }

  function stop() {
    if (watchId.value !== null && import.meta.client) {
      navigator.geolocation.clearWatch(watchId.value)
      watchId.value = null
    }
  }

  onMounted(start)

  return { location, error, loading, start, stop }
}
