import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { MonthlyComparison } from '../../types/analytics';

interface MonthlyComparisonChartProps {
  data: MonthlyComparison[];
}

export const MonthlyComparisonChart: React.FC<MonthlyComparisonChartProps> = ({ data }) => {
  const chartData = data.map((item) => ({
    month: item.month,
    amount: parseFloat(item.amount.toFixed(2)),
    count: item.count,
  }));

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Monthly Comparison</h2>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="month"
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
              formatter={(value: number | undefined, name: string | undefined) => [
                name === 'amount' ? `$${(value || 0).toFixed(2)}` : `${value || 0} receipts`,
                name === 'amount' ? 'Amount' : 'Receipts',
              ]}
            />
            <Legend />
            <Bar dataKey="amount" fill="#3b82f6" name="Spending" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
