export const useApi = () => {
  const config = useRuntimeConfig();

  const apiUrl = config.public.apiUrl as string;

  const apiFetch = <T>(endpoint: string, options: any = {}) => {
    return $fetch<T>(`${apiUrl}${endpoint}`, {
      ...options,
    });
  };

  return {
    apiUrl,
    apiFetch,
  };
};
