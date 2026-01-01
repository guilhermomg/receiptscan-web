import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import type { SpendingTrend } from '../../types/analytics';

interface SpendingTrendsChartProps {
  data: SpendingTrend[];
}

export const SpendingTrendsChart: React.FC<SpendingTrendsChartProps> = ({ data }) => {
  // Format data for chart
  const chartData = data.map((item) => ({
    date: format(parseISO(item.date), 'MMM dd'),
    amount: parseFloat(item.amount.toFixed(2)),
    count: item.count,
  }));

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Spending Trends</h2>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              stroke="#666"
              style={{ fontSize: '12px' }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis stroke="#666" style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #ccc',
                borderRadius: '8px',
                padding: '12px',
              }}
              formatter={(value: number | undefined) => [`$${(value || 0).toFixed(2)}`, 'Amount']}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="amount"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6', r: 4 }}
              activeDot={{ r: 6 }}
              name="Spending"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
