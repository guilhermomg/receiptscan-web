import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Modal } from '../common';
import { PLANS } from '../../types/subscription';
import type { PlanTier } from '../../types/subscription';

interface UsageLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier: PlanTier;
  remainingReceipts: number;
}

export const UsageLimitModal: React.FC<UsageLimitModalProps> = ({
  isOpen,
  onClose,
  currentTier,
  remainingReceipts,
}) => {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    navigate('/pricing');
    onClose();
  };

  const currentPlan = PLANS.find((p) => p.tier === currentTier);
  const nextPlan = PLANS.find((p) => {
    if (currentTier === 'free') return p.tier === 'basic';
    if (currentTier === 'basic') return p.tier === 'pro';
    return false;
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Usage Limit Reached">
      <div className="space-y-4">
        <div className="rounded-lg bg-yellow-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                You've reached your monthly limit
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  You've used all {currentPlan?.features.receiptsPerMonth} receipts in your{' '}
                  {currentPlan?.name} plan this month.{' '}
                  {remainingReceipts === 0 && 'You have no remaining receipts.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {nextPlan && (
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h4 className="font-semibold text-gray-900">Upgrade to {nextPlan.name}</h4>
            <p className="mt-2 text-sm text-gray-600">
              Get{' '}
              {nextPlan.features.receiptsPerMonth === -1
                ? 'unlimited'
                : nextPlan.features.receiptsPerMonth}{' '}
              receipts per month for just ${(nextPlan.price / 100).toFixed(2)}/month
            </p>
            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <svg
                  className="mr-2 h-4 w-4 text-green-500"
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
                Export to {nextPlan.features.exportFormats.join(', ')}
              </li>
              {nextPlan.features.advancedAnalytics && (
                <li className="flex items-center">
                  <svg
                    className="mr-2 h-4 w-4 text-green-500"
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
                  Advanced analytics
                </li>
              )}
              {nextPlan.features.prioritySupport && (
                <li className="flex items-center">
                  <svg
                    className="mr-2 h-4 w-4 text-green-500"
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
                  Priority support
                </li>
              )}
            </ul>
          </div>
        )}

        <div className="flex gap-3">
          <Button variant="outline" size="lg" onClick={onClose} className="flex-1">
            Maybe Later
          </Button>
          <Button variant="primary" size="lg" onClick={handleUpgrade} className="flex-1">
            View Plans
          </Button>
        </div>
      </div>
    </Modal>
  );
};
