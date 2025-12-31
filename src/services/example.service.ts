import apiClient from '../lib/axios';
import type { ApiResponse } from '../types';

// Example service for API calls
export const exampleService = {
  getAll: async <T>() => {
    const response = await apiClient.get<ApiResponse<T[]>>('/example');
    return response.data;
  },

  getById: async <T>(id: string) => {
    const response = await apiClient.get<ApiResponse<T>>(`/example/${id}`);
    return response.data;
  },

  create: async <T>(data: Partial<T>) => {
    const response = await apiClient.post<ApiResponse<T>>('/example', data);
    return response.data;
  },

  update: async <T>(id: string, data: Partial<T>) => {
    const response = await apiClient.put<ApiResponse<T>>(`/example/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<void>>(`/example/${id}`);
    return response.data;
  },
};
