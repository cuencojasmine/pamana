const TOKEN_STORAGE_KEY = "pamana_token";

export const useApi = () => {
  const config = useRuntimeConfig();

  const apiUrl = config.public.apiUrl as string;

  const token = () => useState<string | null>("auth-token", () => null);
  const user = () => useState<any>("auth-user", () => null);

  const buildHeaders = (extra?: Record<string, string>) => ({
    ...(token().value ? { Authorization: `Bearer ${token().value}` } : {}),
    ...(extra || {}),
  });

  const clearSession = () => {
    token().value = null;
    user().value = null;

    if (import.meta.client) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  };

  const refreshSession = async (): Promise<boolean> => {
    try {
      const response = await $fetch<{ jwt: string }>(`${apiUrl}/api/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });

      token().value = response.jwt;

      if (import.meta.client) {
        localStorage.setItem(TOKEN_STORAGE_KEY, response.jwt);
      }

      return true;
    } catch {
      clearSession();

      if (import.meta.client) {
        await navigateTo("/login");
      }

      return false;
    }
  };

  const apiFetch = async <T>(endpoint: string, options: any = {}): Promise<T> => {
    const isAuthRoute = endpoint.startsWith("/api/auth/");

    const request = () =>
      $fetch<T>(`${apiUrl}${endpoint}`, {
        ...options,
        headers: buildHeaders(options.headers),
        credentials: "include",
      });

    try {
      return await request();
    } catch (error: any) {
      const status = error?.response?.status || error?.statusCode;

      if (status === 401 && token().value && !isAuthRoute) {
        const refreshed = await refreshSession();

        if (refreshed) {
          return await request();
        }
      }

      throw error;
    }
  };

  return {
    apiUrl,
    apiFetch,
  };
};
