# Analytics Dashboard - Component Architecture

## Component Hierarchy

```
AnalyticsPage
├── DateRangeSelector
│   ├── Preset Buttons (Last 7 Days, Last 30 Days, etc.)
│   └── Custom Date Inputs (From/To)
│
├── SpendingAlerts (conditional - only if alerts exist)
│   └── Alert Cards
│       ├── Overspending Alerts
│       ├── Milestone Alerts
│       └── Unusual Activity Alerts
│
├── Summary Cards (3-column grid)
│   ├── Total Spending Card
│   ├── Average Transaction Card
│   └── Categories Count Card
│
├── Charts Row 1 (2-column grid)
│   ├── SpendingTrendsChart (Line Chart)
│   │   ├── ResponsiveContainer
│   │   ├── LineChart
│   │   ├── CartesianGrid
│   │   ├── XAxis (dates)
│   │   ├── YAxis (amounts)
│   │   ├── Tooltip
│   │   ├── Legend
│   │   └── Line (spending data)
│   │
│   └── CategoryBreakdownChart (Pie Chart)
│       ├── ResponsiveContainer
│       ├── PieChart
│       ├── Pie (with labels)
│       ├── Tooltip
│       ├── Legend
│       └── Category List (below chart)
│
├── MonthlyComparisonChart (full width)
│   ├── ResponsiveContainer
│   ├── BarChart
│   ├── CartesianGrid
│   ├── XAxis (months)
│   ├── YAxis (amounts)
│   ├── Tooltip
│   ├── Legend
│   └── Bar (monthly data)
│
├── Bottom Row (2-column grid)
│   ├── TopMerchantsCard
│   │   └── Merchant List
│   │       ├── Rank Badge
│   │       ├── Merchant Name
│   │       ├── Total Amount
│   │       └── Visit Info
│   │
│   └── TaxDeductibleSummary
│       ├── Total Summary Card
│       ├── Category Breakdown
│       │   ├── Category Name
│       │   ├── Amount
│       │   └── Progress Bar
│       └── Info Note
│
└── ExportReports
    ├── Description
    └── Export Buttons
        ├── Export as PDF
        └── Export as CSV
```

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      AnalyticsPage                           │
│  - Manages date range state                                  │
│  - Coordinates all child components                          │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     useAnalytics Hook                        │
│  - Fetches data via TanStack Query                          │
│  - Caches results (5 min stale time)                        │
│  - Provides loading/error states                            │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  analyticsService                            │
│  - Queries Firestore for receipts                           │
│  - Aggregates data into analytics structures                │
│  - Calculates metrics and trends                            │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Analytics Data                            │
│  {                                                           │
│    spendingTrends: SpendingTrend[]                          │
│    categoryBreakdown: CategoryData[]                        │
│    topMerchants: MerchantData[]                             │
│    monthlyComparison: MonthlyComparison[]                   │
│    taxDeductible: TaxDeductibleData                         │
│    alerts: SpendingAlert[]                                  │
│    totalSpending: number                                    │
│    averageTransaction: number                               │
│    transactionCount: number                                 │
│  }                                                           │
└─────────────────────────────────────────────────────────────┘
```

## State Management

```
┌─────────────────────────────────────────────────────────────┐
│                     Component State                          │
├─────────────────────────────────────────────────────────────┤
│  Local State (AnalyticsPage):                               │
│  - dateFrom: Date                                           │
│  - dateTo: Date                                             │
│                                                              │
│  React Query Cache:                                         │
│  - Analytics data for each date range                       │
│  - Automatically invalidated after 5 minutes                │
│  - Shared across all components                             │
│                                                              │
│  Auth Context (via useAuth):                                │
│  - user.uid for data queries                                │
│  - Authentication state                                     │
└─────────────────────────────────────────────────────────────┘
```

## Key Interactions

### 1. Date Range Selection Flow
```
User clicks preset button
  ↓
DateRangeSelector calculates new dates
  ↓
onDateRangeChange callback updates parent state
  ↓
AnalyticsPage re-renders with new filters
  ↓
useAnalytics hook detects changed query key
  ↓
New data fetched and cached
  ↓
All chart components re-render with new data
```

### 2. Export Flow
```
User clicks "Export as PDF" or "Export as CSV"
  ↓
ExportReports component accesses analytics data
  ↓
Data formatted for export format
  ↓
jsPDF/PapaParse generates file
  ↓
Browser downloads file
```

### 3. Error Recovery Flow
```
Data fetch fails
  ↓
useAnalytics returns error state
  ↓
AnalyticsPage shows error message
  ↓
User adjusts date range or refreshes
  ↓
React Query retries automatically
```

## Responsive Breakpoints

```
Mobile (< 640px):
├── All components stack vertically
├── Charts adjust to full width
└── Reduced padding and spacing

Tablet (640px - 1024px):
├── Summary cards: 2 columns
├── Charts: Still stacked
└── Increased spacing

Desktop (> 1024px):
├── Summary cards: 3 columns
├── Charts: 2 columns (except monthly - full width)
└── Optimal spacing and layout
```

## Performance Optimizations

### Implemented
- ✅ TanStack Query caching (5 min stale time)
- ✅ Single Firestore query for all data
- ✅ Client-side aggregations (no multiple queries)
- ✅ Efficient date calculations with date-fns
- ✅ Recharts optimization for responsive rendering

### Future Considerations
- 🔄 React.memo for expensive chart components
- 🔄 Virtual scrolling for large merchant lists
- 🔄 Lazy loading of chart components
- 🔄 Service worker for offline analytics
- 🔄 WebWorker for heavy calculations

## Type Safety

All components are fully typed with TypeScript:

```typescript
// Core Types
interface AnalyticsData { ... }
interface SpendingTrend { ... }
interface CategoryData { ... }
interface MerchantData { ... }
interface MonthlyComparison { ... }
interface TaxDeductibleData { ... }
interface SpendingAlert { ... }

// Filter Types
interface AnalyticsFilters {
  dateFrom: Date;
  dateTo: Date;
  categories?: string[];
  merchants?: string[];
}

// Export Types
type ExportFormat = 'pdf' | 'csv';
interface ExportOptions { ... }
```

## Testing Strategy

### Unit Tests (Recommended)
```
✓ analyticsService calculations
  - Spending trends with zero-filling
  - Category aggregation
  - Merchant ranking
  - Monthly comparison
  - Tax deductible filtering
  - Alert generation

✓ Component rendering
  - Chart components with mock data
  - Empty states
  - Error states
  - Loading states
```

### Integration Tests (Recommended)
```
✓ Date range selection
✓ Data fetching and caching
✓ Export functionality
✓ Navigation and routing
```

### E2E Tests (Recommended)
```
✓ Complete user flow
✓ Authentication + Analytics access
✓ Date range changes
✓ Export downloads
```

## Deployment Checklist

- [x] TypeScript compilation successful
- [x] All dependencies installed
- [x] Build completes without errors
- [x] Routes configured correctly
- [x] Navigation links added
- [x] Protected route working
- [ ] Test with real receipt data
- [ ] Verify Firebase rules allow analytics queries
- [ ] Test exports on different browsers
- [ ] Verify mobile responsiveness
- [ ] Performance testing with large datasets
