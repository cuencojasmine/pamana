export function useGeolocation() {
  const location = useState<{ lat: number; lng: number } | null>(
    'user-location',
    () => null
  )

  const error = useState<string | null>(
    'user-location-error',
    () => null
  )

  const loading = useState<boolean>(
    'user-location-loading',
    () => false
  )

  const requested = useState<boolean>(
    'user-location-requested',
    () => false
  )

  function start() {
    if (!import.meta.client) return

    if (!navigator.geolocation) {
      error.value = 'Geolocation is not supported by this browser.'
      return
    }

    // Prevent several map components from requesting location repeatedly.
    if (requested.value) return

    requested.value = true
    loading.value = true

    navigator.geolocation.getCurrentPosition(
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
      {
        enableHighAccuracy: false,
        maximumAge: 60000,
        timeout: 8000
      }
    )
  }

  onMounted(start)

  return {
    location,
    error,
    loading,
    start
  }
}