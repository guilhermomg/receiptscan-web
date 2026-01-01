import React from 'react';
import type { Subscription, UsageStats } from '../../types/subscription';
import { PLANS } from '../../types/subscription';
import { format } from 'date-fns';

interface SubscriptionStatusProps {
  subscription: Subscription | null;
  usage: UsageStats | null;
}

export const SubscriptionStatus: React.FC<SubscriptionStatusProps> = ({ subscription, usage }) => {
  const getCurrentPlan = () => {
    if (!subscription) {
      return PLANS.find((p) => p.id === 'free');
    }
    return PLANS.find((p) => p.id === subscription.planId);
  };

  const plan = getCurrentPlan();

  if (!plan) {
    return null;
  }

  const getStatusBadge = () => {
    if (!subscription) {
      return <span className="text-sm text-gray-500">Free Plan</span>;
    }

    const statusColors = {
      active: 'bg-green-100 text-green-800',
      canceled: 'bg-red-100 text-red-800',
      past_due: 'bg-yellow-100 text-yellow-800',
      incomplete: 'bg-gray-100 text-gray-800',
      trialing: 'bg-blue-100 text-blue-800',
    };

    const statusLabels = {
      active: 'Active',
      canceled: subscription.cancelAtPeriodEnd ? 'Cancels at period end' : 'Canceled',
      past_due: 'Past Due',
      incomplete: 'Incomplete',
      trialing: 'Trial',
    };

    return (
      <span
        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusColors[subscription.status]}`}
      >
        {statusLabels[subscription.status]}
      </span>
    );
  };

  const formatUsage = () => {
    if (!usage) return 'Loading...';
    const limit = usage.receiptsLimit === -1 ? 'Unlimited' : usage.receiptsLimit;
    return `${usage.receiptsProcessedThisMonth} / ${limit}`;
  };

  const getUsagePercentage = () => {
    if (!usage || usage.receiptsLimit === -1) return 0;
    return Math.min((usage.receiptsProcessedThisMonth / usage.receiptsLimit) * 100, 100);
  };

  const usagePercentage = getUsagePercentage();
  const isNearLimit = usagePercentage > 80;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{plan.name} Plan</h3>
          <p className="mt-1 text-sm text-gray-500">{plan.description}</p>
        </div>
        {getStatusBadge()}
      </div>

      {subscription && subscription.status === 'active' && (
        <div className="mt-4 text-sm text-gray-600">
          <p>
            Current period: {format(new Date(subscription.currentPeriodStart), 'MMM d, yyyy')} -{' '}
            {format(new Date(subscription.currentPeriodEnd), 'MMM d, yyyy')}
          </p>
        </div>
      )}

      {usage && (
        <div className="mt-6">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-gray-700">Receipts this month</span>
            <span className={`font-semibold ${isNearLimit ? 'text-red-600' : 'text-gray-900'}`}>
              {formatUsage()}
            </span>
          </div>
          {usage.receiptsLimit !== -1 && (
            <div className="mt-2">
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className={`h-full transition-all ${
                    isNearLimit ? 'bg-red-500' : 'bg-primary-500'
                  }`}
                  style={{ width: `${usagePercentage}%` }}
                />
              </div>
              {isNearLimit && (
                <p className="mt-2 text-xs text-red-600">
                  You're approaching your monthly limit. Consider upgrading to continue processing
                  receipts.
                </p>
              )}
            </div>
          )}
          {usage.receiptsLimit !== -1 && (
            <p className="mt-2 text-xs text-gray-500">
              Resets on {format(new Date(usage.resetDate), 'MMM d, yyyy')}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
