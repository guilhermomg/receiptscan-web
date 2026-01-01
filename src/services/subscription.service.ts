import apiClient from '../lib/axios';
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

/**
 * Get current user's subscription
 */
export const getSubscription = async (): Promise<Subscription | null> => {
  try {
    const response = await apiClient.get<Subscription>('/subscriptions/current');
    return response.data;
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
  const response = await apiClient.get<UsageStats>('/subscriptions/usage');
  return response.data;
};

/**
 * Create a checkout session for a new subscription
 */
export const createCheckoutSession = async (
  request: CreateCheckoutSessionRequest
): Promise<CheckoutSession> => {
  const response = await apiClient.post<CheckoutSession>('/subscriptions/checkout', request);
  return response.data;
};

/**
 * Update subscription to a different plan
 */
export const updateSubscription = async (
  request: UpdateSubscriptionRequest
): Promise<Subscription> => {
  const response = await apiClient.put<Subscription>('/subscriptions/current', request);
  return response.data;
};

/**
 * Cancel subscription at period end
 */
export const cancelSubscription = async (): Promise<Subscription> => {
  const response = await apiClient.post<Subscription>('/subscriptions/current/cancel');
  return response.data;
};

/**
 * Reactivate a canceled subscription
 */
export const reactivateSubscription = async (): Promise<Subscription> => {
  const response = await apiClient.post<Subscription>('/subscriptions/current/reactivate');
  return response.data;
};

/**
 * Get billing history (invoices)
 */
export const getBillingHistory = async (): Promise<Invoice[]> => {
  const response = await apiClient.get<Invoice[]>('/subscriptions/invoices');
  return response.data;
};

/**
 * Get payment methods
 */
export const getPaymentMethods = async (): Promise<PaymentMethod[]> => {
  const response = await apiClient.get<PaymentMethod[]>('/subscriptions/payment-methods');
  return response.data;
};

/**
 * Add a new payment method
 */
export const addPaymentMethod = async (paymentMethodId: string): Promise<PaymentMethod> => {
  const response = await apiClient.post<PaymentMethod>('/subscriptions/payment-methods', {
    paymentMethodId,
  });
  return response.data;
};

/**
 * Set default payment method
 */
export const setDefaultPaymentMethod = async (paymentMethodId: string): Promise<void> => {
  await apiClient.put(`/subscriptions/payment-methods/${paymentMethodId}/default`);
};

/**
 * Remove a payment method
 */
export const removePaymentMethod = async (paymentMethodId: string): Promise<void> => {
  await apiClient.delete(`/subscriptions/payment-methods/${paymentMethodId}`);
};

/**
 * Get customer portal URL for Stripe-managed billing
 */
export const getCustomerPortalUrl = async (returnUrl: string): Promise<string> => {
  const response = await apiClient.post<{ url: string }>('/subscriptions/portal', { returnUrl });
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
