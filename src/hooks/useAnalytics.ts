import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/useAuth';
import { analyticsService } from '../services/analytics.service';
import type { AnalyticsFilters } from '../types/analytics';

export const useAnalytics = (filters: AnalyticsFilters) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['analytics', user?.uid, filters],
    queryFn: () => {
      if (!user?.uid) {
        throw new Error('User not authenticated');
      }
      return analyticsService.getAnalyticsData(user.uid, filters);
    },
    enabled: !!user?.uid,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
};
