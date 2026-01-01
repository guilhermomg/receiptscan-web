import React from 'react';
import { Link } from 'react-router-dom';
import { useUsageLimit } from '../../hooks/useUsageLimit';

export const UsageIndicator: React.FC = () => {
  const { usage, planTier, hasReachedLimit, remainingReceipts, usagePercentage } = useUsageLimit();

  if (!usage) {
    return null;
  }

  const isUnlimited = usage.receiptsLimit === -1;
  const isNearLimit = usagePercentage > 80 && !isUnlimited;

  return (
    <div
      className={`rounded-lg border p-4 ${
        hasReachedLimit
          ? 'border-red-300 bg-red-50'
          : isNearLimit
            ? 'border-yellow-300 bg-yellow-50'
            : 'border-gray-200 bg-white'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-900">
            {hasReachedLimit ? 'Usage Limit Reached' : 'Monthly Usage'}
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            {isUnlimited ? (
              <>
                <span className="font-semibold">{usage.receiptsProcessedThisMonth}</span> receipts
                processed this month
                <span className="ml-1 text-green-600">(Unlimited)</span>
              </>
            ) : (
              <>
                <span className="font-semibold">{usage.receiptsProcessedThisMonth}</span> of{' '}
                <span className="font-semibold">{usage.receiptsLimit}</span> receipts used
                {remainingReceipts > 0 && (
                  <span className="ml-1 text-gray-500">({remainingReceipts} remaining)</span>
                )}
              </>
            )}
          </p>
        </div>
        {(hasReachedLimit || isNearLimit) && planTier !== 'pro' && (
          <Link
            to="/pricing"
            className="ml-4 whitespace-nowrap rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
          >
            Upgrade
          </Link>
        )}
      </div>
      {!isUnlimited && (
        <div className="mt-3">
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className={`h-full transition-all ${
                hasReachedLimit ? 'bg-red-500' : isNearLimit ? 'bg-yellow-500' : 'bg-primary-500'
              }`}
              style={{ width: `${usagePercentage}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
