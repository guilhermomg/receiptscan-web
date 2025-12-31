import { useQuery } from '@tanstack/react-query';
import apiClient from '../lib/axios';

// Example hook for fetching data
export const useExample = <T>(endpoint: string, enabled = true) => {
  return useQuery<T>({
    queryKey: [endpoint],
    queryFn: async () => {
      const response = await apiClient.get<T>(endpoint);
      return response.data;
    },
    enabled,
  });
};
