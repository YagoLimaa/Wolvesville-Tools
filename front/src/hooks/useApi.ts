import { useCallback } from 'react';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { ApiResponse } from '@/lib/api';

interface UseApiOptions<T> extends Omit<UseQueryOptions<ApiResponse<T>>, 'queryKey' | 'queryFn'> {
  enabled?: boolean;
}

export function useApi<T = unknown>(
  queryKey: (string | number | undefined)[],
  apiFn: () => Promise<ApiResponse<T>>,
  options?: UseApiOptions<T>
) {
  const { enabled = true, ...queryOptions } = options || {};

  return useQuery({
    queryKey: queryKey.filter((key) => key !== undefined),
    queryFn: async () => {
      const response = await apiFn();

      if (response.error) {
        throw new Error(response.error);
      }

      if (response.status >= 400) {
        throw new Error('Failed to fetch data');
      }

      return response;
    },
    enabled,
    retry: 1,
    ...queryOptions,
  });
}

export function useApiData<T = unknown>(
  queryKey: (string | number | undefined)[],
  apiFn: () => Promise<ApiResponse<T>>,
  options?: UseApiOptions<T>
) {
  const { data, isLoading, isError, error } = useApi(queryKey, apiFn, options);

  return {
    data: data?.data,
    isLoading,
    isError,
    error: error instanceof Error ? error.message : 'Unknown error',
  };
}
