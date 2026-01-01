import { useSubscription } from '../contexts';

export const useUsageLimit = () => {
  const { usage, planTier } = useSubscription();

  const hasReachedLimit = () => {
    if (!usage) return false;

    // Unlimited usage (Pro plan)
    if (usage.receiptsLimit === -1) {
      return false;
    }

    return usage.receiptsProcessedThisMonth >= usage.receiptsLimit;
  };

  const getRemainingReceipts = () => {
    if (!usage) return 0;

    // Unlimited usage
    if (usage.receiptsLimit === -1) {
      return -1; // -1 indicates unlimited
    }

    return Math.max(0, usage.receiptsLimit - usage.receiptsProcessedThisMonth);
  };

  const canProcessReceipt = () => {
    return !hasReachedLimit();
  };

  const getUsagePercentage = () => {
    if (!usage || usage.receiptsLimit === -1) return 0;

    return Math.min((usage.receiptsProcessedThisMonth / usage.receiptsLimit) * 100, 100);
  };

  return {
    usage,
    planTier,
    hasReachedLimit: hasReachedLimit(),
    remainingReceipts: getRemainingReceipts(),
    canProcessReceipt: canProcessReceipt(),
    usagePercentage: getUsagePercentage(),
  };
};
