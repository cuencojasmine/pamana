import type { StrapiListResponse } from "~/types";

export function useCrud<T>(endpoint: string) {
  const { apiFetch } = useApi();

  const items = ref<T[]>([]) as Ref<T[]>;
  const loading = ref(false);
  const error = ref<string | null>(null);

  const extractErrorMessage = (err: any) => {
    return (
      err?.data?.error?.message ||
      err?.statusMessage ||
      err?.message ||
      "Something went wrong. Please try again."
    );
  };

  const fetchAll = async (query: Record<string, any> = {}) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await apiFetch<StrapiListResponse<T>>(endpoint, {
        query: {
          "pagination[pageSize]": 100,
          sort: "createdAt:desc",
          ...query,
        },
      });

      items.value = response.data;

      return response.data;
    } catch (err) {
      error.value = extractErrorMessage(err);

      throw err;
    } finally {
      loading.value = false;
    }
  };

  const create = async (data: Record<string, any>) => {
    const response = await apiFetch<{ data: T }>(endpoint, {
      method: "POST",
      body: { data },
    });

    return response.data;
  };

  const update = async (documentId: string, data: Record<string, any>) => {
    const response = await apiFetch<{ data: T }>(`${endpoint}/${documentId}`, {
      method: "PUT",
      body: { data },
    });

    return response.data;
  };

  const remove = async (documentId: string) => {
    await apiFetch(`${endpoint}/${documentId}`, {
      method: "DELETE",
    });
  };

  return {
    items,
    loading,
    error,
    extractErrorMessage,
    fetchAll,
    create,
    update,
    remove,
  };
}
