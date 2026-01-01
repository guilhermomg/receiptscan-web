import React, { useState } from 'react';
import { subDays, subMonths, startOfMonth, endOfMonth, format } from 'date-fns';

interface DateRangeSelectorProps {
  dateFrom: Date;
  dateTo: Date;
  onDateRangeChange: (dateFrom: Date, dateTo: Date) => void;
}

type PresetRange =
  | 'last7days'
  | 'last30days'
  | 'last3months'
  | 'thisMonth'
  | 'lastMonth'
  | 'custom';

export const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  dateFrom,
  dateTo,
  onDateRangeChange,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<PresetRange>('last30days');
  const [showCustomPicker, setShowCustomPicker] = useState(false);

  const handlePresetChange = (preset: PresetRange) => {
    setSelectedPreset(preset);
    setShowCustomPicker(preset === 'custom');

    const today = new Date();
    let newDateFrom: Date;
    let newDateTo: Date = today;

    switch (preset) {
      case 'last7days':
        newDateFrom = subDays(today, 7);
        break;
      case 'last30days':
        newDateFrom = subDays(today, 30);
        break;
      case 'last3months':
        newDateFrom = subMonths(today, 3);
        break;
      case 'thisMonth':
        newDateFrom = startOfMonth(today);
        newDateTo = endOfMonth(today);
        break;
      case 'lastMonth': {
        const lastMonth = subMonths(today, 1);
        newDateFrom = startOfMonth(lastMonth);
        newDateTo = endOfMonth(lastMonth);
        break;
      }
      default:
        return;
    }

    onDateRangeChange(newDateFrom, newDateTo);
  };

  const handleCustomDateChange = (field: 'from' | 'to', value: string) => {
    const newDate = new Date(value);
    if (field === 'from') {
      onDateRangeChange(newDate, dateTo);
    } else {
      onDateRangeChange(dateFrom, newDate);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <label className="block text-sm font-medium text-gray-700 mb-3">Date Range</label>

      {/* Preset Buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => handlePresetChange('last7days')}
          className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
            selectedPreset === 'last7days'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Last 7 Days
        </button>
        <button
          onClick={() => handlePresetChange('last30days')}
          className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
            selectedPreset === 'last30days'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Last 30 Days
        </button>
        <button
          onClick={() => handlePresetChange('last3months')}
          className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
            selectedPreset === 'last3months'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Last 3 Months
        </button>
        <button
          onClick={() => handlePresetChange('thisMonth')}
          className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
            selectedPreset === 'thisMonth'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          This Month
        </button>
        <button
          onClick={() => handlePresetChange('lastMonth')}
          className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
            selectedPreset === 'lastMonth'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Last Month
        </button>
        <button
          onClick={() => handlePresetChange('custom')}
          className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
            selectedPreset === 'custom'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Custom
        </button>
      </div>

      {/* Custom Date Pickers */}
      {showCustomPicker && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">From</label>
            <input
              type="date"
              value={format(dateFrom, 'yyyy-MM-dd')}
              onChange={(e) => handleCustomDateChange('from', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">To</label>
            <input
              type="date"
              value={format(dateTo, 'yyyy-MM-dd')}
              onChange={(e) => handleCustomDateChange('to', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      )}

      {/* Selected Range Display */}
      <div className="mt-3 text-sm text-gray-600">
        <span className="font-medium">Selected Range:</span> {format(dateFrom, 'MMM dd, yyyy')} -{' '}
        {format(dateTo, 'MMM dd, yyyy')}
      </div>
    </div>
  );
};
