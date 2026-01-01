import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { Subscription, UsageStats, PlanTier } from '../types/subscription';
import {
  getSubscription,
  getUsageStats,
  getCurrentPlanTier,
} from '../services/subscription.service';
import { useAuth } from './useAuth';

interface SubscriptionContextType {
  subscription: Subscription | null;
  usage: UsageStats | null;
  planTier: PlanTier;
  loading: boolean;
  refreshSubscription: () => Promise<void>;
  refreshUsage: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

interface SubscriptionProviderProps {
  children: ReactNode;
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [planTier, setPlanTier] = useState<PlanTier>('free');
  const [loading, setLoading] = useState(true);

  const refreshSubscription = async () => {
    if (!user) {
      setSubscription(null);
      setPlanTier('free');
      return;
    }

    try {
      const [sub, tier] = await Promise.all([getSubscription(), getCurrentPlanTier()]);
      setSubscription(sub);
      setPlanTier(tier);
    } catch (error) {
      console.error('Error fetching subscription:', error);
      // Default to free tier on error
      setSubscription(null);
      setPlanTier('free');
    }
  };

  const refreshUsage = async () => {
    if (!user) {
      setUsage(null);
      return;
    }

    try {
      const usageData = await getUsageStats();
      setUsage(usageData);
    } catch (error) {
      console.error('Error fetching usage stats:', error);
      setUsage(null);
    }
  };

  // Load subscription and usage when user changes
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        if (user) {
          await Promise.all([refreshSubscription(), refreshUsage()]);
        } else {
          setSubscription(null);
          setUsage(null);
          setPlanTier('free');
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const value: SubscriptionContextType = {
    subscription,
    usage,
    planTier,
    loading,
    refreshSubscription,
    refreshUsage,
  };

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
