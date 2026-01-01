import React from 'react';
import type { Plan } from '../../types/subscription';
import { Button } from '../common';
import { formatPrice, formatReceiptLimit } from '../../utils/priceUtils';

interface PricingCardProps {
  plan: Plan;
  currentPlanId?: string;
  onSelect: (planId: string) => void;
  loading?: boolean;
}

export const PricingCard: React.FC<PricingCardProps> = ({
  plan,
  currentPlanId,
  onSelect,
  loading = false,
}) => {
  const isCurrentPlan = currentPlanId === plan.id;
  const isFree = plan.price === 0;

  return (
    <div
      className={`relative rounded-lg border-2 p-6 shadow-sm transition-all ${
        plan.popular
          ? 'border-primary-500 shadow-lg scale-105'
          : isCurrentPlan
            ? 'border-primary-300'
            : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 transform">
          <span className="rounded-full bg-primary-500 px-3 py-1 text-xs font-semibold text-white">
            Most Popular
          </span>
        </div>
      )}

      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
        <p className="mt-2 text-sm text-gray-500">{plan.description}</p>

        <div className="mt-4">
          <span className="text-4xl font-bold text-gray-900">{formatPrice(plan.price)}</span>
          {!isFree && <span className="text-gray-500">/month</span>}
        </div>

        <Button
          variant={isCurrentPlan ? 'outline' : plan.popular ? 'primary' : 'secondary'}
          size="lg"
          className="mt-6 w-full"
          onClick={() => onSelect(plan.id)}
          disabled={isCurrentPlan || loading}
        >
          {isCurrentPlan ? 'Current Plan' : isFree ? 'Get Started' : 'Upgrade'}
        </Button>
      </div>

      <div className="mt-6 space-y-3">
        <div className="flex items-start">
          <svg
            className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="ml-3 text-sm text-gray-700">
            <strong>{formatReceiptLimit(plan.features.receiptsPerMonth)}</strong> receipts per month
          </span>
        </div>

        <div className="flex items-start">
          <svg
            className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="ml-3 text-sm text-gray-700">
            Export to {plan.features.exportFormats.join(', ')}
          </span>
        </div>

        {plan.features.advancedAnalytics && (
          <div className="flex items-start">
            <svg
              className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="ml-3 text-sm text-gray-700">Advanced analytics</span>
          </div>
        )}

        {plan.features.prioritySupport && (
          <div className="flex items-start">
            <svg
              className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="ml-3 text-sm text-gray-700">Priority support</span>
          </div>
        )}

        {plan.features.apiAccess && (
          <div className="flex items-start">
            <svg
              className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="ml-3 text-sm text-gray-700">API access</span>
          </div>
        )}
      </div>
    </div>
  );
};
