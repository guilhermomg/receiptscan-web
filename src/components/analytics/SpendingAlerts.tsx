import React from 'react';
import type { SpendingAlert } from '../../types/analytics';

interface SpendingAlertsProps {
  alerts: SpendingAlert[];
}

export const SpendingAlerts: React.FC<SpendingAlertsProps> = ({ alerts }) => {
  if (alerts.length === 0) {
    return null;
  }

  const getAlertIcon = (type: SpendingAlert['type']) => {
    switch (type) {
      case 'overspending':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        );
      case 'milestone':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
            />
          </svg>
        );
      case 'unusual':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
    }
  };

  const getAlertColor = (type: SpendingAlert['type']) => {
    switch (type) {
      case 'overspending':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'milestone':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'unusual':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Spending Alerts</h2>
      <div className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`flex items-start gap-3 p-4 rounded-lg border ${getAlertColor(alert.type)}`}
          >
            <div className="flex-shrink-0 mt-0.5">{getAlertIcon(alert.type)}</div>
            <div className="flex-1">
              <p className="text-sm font-medium">{alert.message}</p>
              {alert.amount && (
                <p className="text-sm mt-1 font-semibold">${alert.amount.toFixed(2)}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
