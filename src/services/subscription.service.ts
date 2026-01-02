import apiClient from '../lib/axios';
import type { ApiResponse } from '../types';
import { PLANS } from '../types/subscription';
import type { Subscription, UsageStats, PaymentMethod, PlanTier } from '../types/subscription';
import type { Invoice, CheckoutSession } from '../types/billing';

export interface CreateCheckoutSessionRequest {
  planId: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CreateCheckoutSessionResponse {
  sessionId: string;
  url: string;
}

export interface UpdateSubscriptionRequest {
  planId: string;
}

interface BackendSubscription {
  id?: string;
  subscriptionId?: string;
  userId?: string;
  planId?: string;
  plan?: string;
  status?: Subscription['status'];
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  currentPeriodStartDate?: string;
  currentPeriodEndDate?: string;
  cancelAtPeriodEnd?: boolean;
  cancel_at_period_end?: boolean;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  stripe_subscription_id?: string;
  stripe_customer_id?: string;
  createdAt?: string;
  updatedAt?: string;
}

const mapBackendSubscription = (sub: BackendSubscription): Subscription => {
  const now = Date.now();

  return {
    id: sub.id || sub.subscriptionId || '',
    userId: sub.userId || '',
    planId: sub.planId || sub.plan || 'free',
    status: sub.status || 'active',
    currentPeriodStart: new Date(
      sub.currentPeriodStart || sub.currentPeriodStartDate || sub.currentPeriodEnd || now
    ),
    currentPeriodEnd: new Date(sub.currentPeriodEnd || sub.currentPeriodEndDate || now),
    cancelAtPeriodEnd: Boolean(sub.cancelAtPeriodEnd ?? sub.cancel_at_period_end ?? false),
    stripeSubscriptionId: sub.stripeSubscriptionId || sub.stripe_subscription_id || '',
    stripeCustomerId: sub.stripeCustomerId || sub.stripe_customer_id || '',
    createdAt: new Date(sub.createdAt || now),
    updatedAt: new Date(sub.updatedAt || now),
  };
};

/**
 * Get current user's subscription
 */
export const getSubscription = async (): Promise<Subscription | null> => {
  try {
    const response = await apiClient.get<
      | ApiResponse<{
          subscription: BackendSubscription | null;
        }>
      | BackendSubscription
    >('/v1/billing/subscription');

    // Handle ApiResponse shape
    if ('status' in response.data) {
      if (response.data.status !== 'success' || !response.data.data?.subscription) {
        return null;
      }
      return mapBackendSubscription(response.data.data.subscription);
    }

    // Handle direct subscription payload
    return mapBackendSubscription(response.data as BackendSubscription);
  } catch (error) {
    // Return null if no subscription exists (free tier)
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 404) {
        return null;
      }
    }
    throw error;
  }
};

/**
 * Get usage statistics for current user
 */
export const getUsageStats = async (): Promise<UsageStats> => {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const response = await apiClient.get<
    ApiResponse<{
      stats: {
        count: number;
        totalAmount: number;
      };
    }>
  >('/v1/receipts/stats', {
    params: {
      startDate: startOfMonth.toISOString(),
    },
  });

  const receiptsProcessedThisMonth =
    response.data && 'status' in response.data && response.data.status === 'success'
      ? (response.data.data?.stats.count ?? 0)
      : 0;

  const planTier = await getCurrentPlanTier();
  const plan = PLANS.find((p) => p.tier === planTier) || PLANS[0];
  const receiptsLimit = plan.features.receiptsPerMonth;

  const resetDate = new Date(startOfMonth);
  resetDate.setMonth(resetDate.getMonth() + 1);

  return {
    receiptsProcessedThisMonth,
    receiptsLimit,
    resetDate,
  };
};

/**
 * Create a checkout session for a new subscription
 */
export const createCheckoutSession = async (
  request: CreateCheckoutSessionRequest
): Promise<CheckoutSession> => {
  const response = await apiClient.post<CheckoutSession>('/v1/billing/create-checkout', request);
  return response.data;
};

/**
 * Update subscription to a different plan
 */
export const updateSubscription = async (
  request: UpdateSubscriptionRequest
): Promise<Subscription> => {
  const response = await apiClient.put<Subscription>('/v1/billing/subscription', request);
  return response.data;
};

/**
 * Cancel subscription at period end
 */
export const cancelSubscription = async (): Promise<Subscription> => {
  const response = await apiClient.post<Subscription>('/v1/billing/subscription/cancel');
  return response.data;
};

/**
 * Reactivate a canceled subscription
 */
export const reactivateSubscription = async (): Promise<Subscription> => {
  const response = await apiClient.post<Subscription>('/v1/billing/subscription/reactivate');
  return response.data;
};

/**
 * Get billing history (invoices)
 */
export const getBillingHistory = async (): Promise<Invoice[]> => {
  const response = await apiClient.get<Invoice[]>('/v1/billing/invoices');
  return response.data;
};

/**
 * Get payment methods
 */
export const getPaymentMethods = async (): Promise<PaymentMethod[]> => {
  const response = await apiClient.get<PaymentMethod[]>('/v1/billing/payment-methods');
  return response.data;
};

/**
 * Add a new payment method
 */
export const addPaymentMethod = async (paymentMethodId: string): Promise<PaymentMethod> => {
  const response = await apiClient.post<PaymentMethod>('/v1/billing/payment-methods', {
    paymentMethodId,
  });
  return response.data;
};

/**
 * Set default payment method
 */
export const setDefaultPaymentMethod = async (paymentMethodId: string): Promise<void> => {
  await apiClient.put(`/v1/billing/payment-methods/${paymentMethodId}/default`);
};

/**
 * Remove a payment method
 */
export const removePaymentMethod = async (paymentMethodId: string): Promise<void> => {
  await apiClient.delete(`/v1/billing/payment-methods/${paymentMethodId}`);
};

/**
 * Get customer portal URL for Stripe-managed billing
 */
export const getCustomerPortalUrl = async (returnUrl: string): Promise<string> => {
  const response = await apiClient.post<{ url: string }>('/v1/billing/create-portal', {
    returnUrl,
  });
  return response.data.url;
};

/**
 * Get the plan tier for a user (based on subscription or default to free)
 */
export const getCurrentPlanTier = async (): Promise<PlanTier> => {
  try {
    const subscription = await getSubscription();
    if (!subscription) {
      return 'free';
    }

    // Map subscription planId to tier
    const planIdToTier: Record<string, PlanTier> = {
      free: 'free',
      basic: 'basic',
      pro: 'pro',
    };

    return planIdToTier[subscription.planId] || 'free';
  } catch (error) {
    console.error('Error getting current plan tier:', error);
    return 'free';
  }
};

/**
 * Check if user has reached usage limit
 */
export const hasReachedUsageLimit = async (): Promise<boolean> => {
  try {
    const usage = await getUsageStats();

    // Unlimited usage
    if (usage.receiptsLimit === -1) {
      return false;
    }

    return usage.receiptsProcessedThisMonth >= usage.receiptsLimit;
  } catch (error) {
    console.error('Error checking usage limit:', error);
    return false;
  }
};
