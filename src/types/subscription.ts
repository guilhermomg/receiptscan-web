// Subscription plan tiers
export type PlanTier = 'free' | 'basic' | 'pro';

export interface PlanFeatures {
  receiptsPerMonth: number; // -1 for unlimited
  exportFormats: string[];
  prioritySupport: boolean;
  advancedAnalytics: boolean;
  apiAccess: boolean;
}

export interface Plan {
  id: string;
  name: string;
  tier: PlanTier;
  price: number; // Price in cents per billing interval
  interval: 'month' | 'year';
  features: PlanFeatures;
  stripePriceId?: string;
  description: string;
  popular?: boolean;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'canceled' | 'past_due' | 'incomplete' | 'trialing';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentMethod {
  id: string;
  type: 'card';
  card: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
  isDefault: boolean;
}

export interface UsageStats {
  receiptsProcessedThisMonth: number;
  receiptsLimit: number; // -1 for unlimited
  resetDate: Date;
}

// Predefined plans
export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    tier: 'free',
    price: 0,
    interval: 'month',
    description: 'Perfect for getting started',
    features: {
      receiptsPerMonth: 10,
      exportFormats: ['CSV'],
      prioritySupport: false,
      advancedAnalytics: false,
      apiAccess: false,
    },
  },
  {
    id: 'basic',
    name: 'Basic',
    tier: 'basic',
    price: 900, // $9.00
    interval: 'month',
    description: 'Great for individuals',
    popular: true,
    features: {
      receiptsPerMonth: 100,
      exportFormats: ['CSV', 'PDF', 'Excel'],
      prioritySupport: false,
      advancedAnalytics: true,
      apiAccess: false,
    },
  },
  {
    id: 'pro',
    name: 'Pro',
    tier: 'pro',
    price: 2900, // $29.00
    interval: 'month',
    description: 'For power users and businesses',
    features: {
      receiptsPerMonth: -1, // unlimited
      exportFormats: ['CSV', 'PDF', 'Excel', 'JSON'],
      prioritySupport: true,
      advancedAnalytics: true,
      apiAccess: true,
    },
  },
];
