import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSubscription } from '../contexts';
import { SubscriptionStatus, BillingHistory } from '../components/subscription';
import { Button, Modal, Spinner } from '../components/common';
import { PLANS } from '../types/subscription';
import type { Invoice } from '../types/billing';
import {
  getBillingHistory,
  cancelSubscription,
  reactivateSubscription,
  getCustomerPortalUrl,
} from '../services/subscription.service';

export const BillingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { subscription, usage, loading, refreshSubscription } = useSubscription();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [reactivating, setReactivating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for success parameter from Stripe redirect
    if (searchParams.get('success') === 'true') {
      setShowSuccess(true);
      refreshSubscription();
      // Remove the success parameter from URL
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('success');
      navigate(`/billing?${newSearchParams.toString()}`, { replace: true });
    }
  }, [searchParams, navigate, refreshSubscription]);

  useEffect(() => {
    const loadInvoices = async () => {
      try {
        const history = await getBillingHistory();
        setInvoices(history);
      } catch (err) {
        console.error('Error loading billing history:', err);
      } finally {
        setLoadingInvoices(false);
      }
    };

    loadInvoices();
  }, []);

  const handleCancelSubscription = async () => {
    setCanceling(true);
    setError(null);

    try {
      await cancelSubscription();
      await refreshSubscription();
      setShowCancelModal(false);
    } catch (err) {
      console.error('Error canceling subscription:', err);
      setError('Failed to cancel subscription. Please try again.');
    } finally {
      setCanceling(false);
    }
  };

  const handleReactivateSubscription = async () => {
    setReactivating(true);
    setError(null);

    try {
      await reactivateSubscription();
      await refreshSubscription();
    } catch (err) {
      console.error('Error reactivating subscription:', err);
      setError('Failed to reactivate subscription. Please try again.');
    } finally {
      setReactivating(false);
    }
  };

  const handleManagePaymentMethods = async () => {
    try {
      const portalUrl = await getCustomerPortalUrl(window.location.href);
      window.location.href = portalUrl;
    } catch (err) {
      console.error('Error opening customer portal:', err);
      setError('Failed to open payment management. Please try again.');
    }
  };

  const handleChangePlan = () => {
    navigate('/pricing');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const currentPlan = PLANS.find((p) => p.id === (subscription?.planId || 'free'));
  const canCancel =
    subscription && subscription.status === 'active' && !subscription.cancelAtPeriodEnd;
  const canReactivate = subscription && subscription.cancelAtPeriodEnd;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Billing & Subscription</h1>
          <p className="mt-2 text-gray-600">Manage your subscription and billing information</p>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  Subscription activated successfully!
                </p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={() => setShowSuccess(false)}
                  className="inline-flex rounded-md bg-green-50 p-1.5 text-green-500 hover:bg-green-100"
                >
                  <span className="sr-only">Dismiss</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4">
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

        {/* Subscription Status */}
        <div className="mb-8">
          <SubscriptionStatus subscription={subscription} usage={usage} />
        </div>

        {/* Actions */}
        <div className="mb-8 flex flex-wrap gap-4">
          <Button variant="primary" size="lg" onClick={handleChangePlan}>
            {currentPlan?.id === 'free' ? 'Upgrade Plan' : 'Change Plan'}
          </Button>

          {subscription && (
            <Button variant="outline" size="lg" onClick={handleManagePaymentMethods}>
              Manage Payment Methods
            </Button>
          )}

          {canReactivate && (
            <Button
              variant="secondary"
              size="lg"
              onClick={handleReactivateSubscription}
              disabled={reactivating}
            >
              {reactivating ? 'Reactivating...' : 'Reactivate Subscription'}
            </Button>
          )}

          {canCancel && (
            <Button variant="danger" size="lg" onClick={() => setShowCancelModal(true)}>
              Cancel Subscription
            </Button>
          )}
        </div>

        {/* Billing History */}
        <div>
          {loadingInvoices ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : (
            <BillingHistory invoices={invoices} />
          )}
        </div>

        {/* Cancel Confirmation Modal */}
        <Modal
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          title="Cancel Subscription"
        >
          <div className="space-y-4">
            <p className="text-gray-700">
              Are you sure you want to cancel your subscription? You'll retain access to paid
              features until the end of your current billing period.
            </p>
            <p className="text-sm text-gray-600">
              After cancellation, you'll be moved to the Free plan and limited to 10 receipts per
              month.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setShowCancelModal(false)}
                disabled={canceling}
                className="flex-1"
              >
                Keep Subscription
              </Button>
              <Button
                variant="danger"
                size="lg"
                onClick={handleCancelSubscription}
                disabled={canceling}
                className="flex-1"
              >
                {canceling ? 'Canceling...' : 'Yes, Cancel'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};
