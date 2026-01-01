import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PLANS } from '../types/subscription';
import { PricingCard } from '../components/subscription';
import { useAuth, useSubscription } from '../contexts';
import { createCheckoutSession } from '../services/subscription.service';
import { Spinner } from '../components/common';

export const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { subscription, loading: subscriptionLoading } = useSubscription();
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSelectPlan = async (planId: string) => {
    // Free plan doesn't require checkout
    if (planId === 'free') {
      if (user) {
        navigate('/billing');
      } else {
        navigate('/signup');
      }
      return;
    }

    // Redirect to login if not authenticated
    if (!user) {
      navigate('/login', { state: { from: '/pricing', planId } });
      return;
    }

    // Handle checkout for paid plans
    setProcessingPlanId(planId);
    setError(null);

    try {
      const session = await createCheckoutSession({
        planId,
        successUrl: `${window.location.origin}/billing?success=true`,
        cancelUrl: `${window.location.origin}/pricing`,
      });

      // Redirect to Stripe Checkout
      window.location.href = session.url;
    } catch (err) {
      console.error('Error creating checkout session:', err);
      setError('Failed to start checkout. Please try again.');
      setProcessingPlanId(null);
    }
  };

  if (subscriptionLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const currentPlanId = subscription?.planId || 'free';

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Choose Your Plan
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Select the perfect plan for your receipt scanning needs
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-auto mt-8 max-w-2xl rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              currentPlanId={currentPlanId}
              onSelect={handleSelectPlan}
              loading={processingPlanId === plan.id}
            />
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-16 border-t border-gray-200 pt-12">
          <h2 className="text-center text-2xl font-bold text-gray-900">
            Frequently Asked Questions
          </h2>
          <div className="mx-auto mt-8 max-w-3xl space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Can I change my plan later?</h3>
              <p className="mt-2 text-gray-600">
                Yes, you can upgrade or downgrade your plan at any time from your billing page.
                Changes take effect immediately, with prorated billing.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                What happens if I exceed my receipt limit?
              </h3>
              <p className="mt-2 text-gray-600">
                If you reach your monthly limit, you'll be prompted to upgrade to continue
                processing receipts. Your existing receipts remain accessible.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Can I cancel my subscription?</h3>
              <p className="mt-2 text-gray-600">
                Yes, you can cancel anytime from your billing page. You'll retain access to paid
                features until the end of your billing period.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
