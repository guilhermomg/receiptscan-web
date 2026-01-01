# AI Receipt Processing Integration

This document describes the AI receipt processing integration implemented in the ReceiptScan.ai frontend application.

## Overview

The AI receipt processing integration enables users to:
1. Upload receipt images
2. Submit receipts to backend API for AI processing
3. Track processing status in real-time with polling
4. View extracted receipt data with confidence scores
5. Edit and update extracted data
6. Retry failed processing
7. Store processed data in application state

## Architecture

### Components

#### 1. **ReceiptProcessor** (`src/components/receipt/ReceiptProcessor.tsx`)
Main orchestration component that:
- Submits receipts for AI processing
- Polls for processing status every 2 seconds
- Handles timeout after 60 seconds
- Manages processing lifecycle (pending → processing → completed/failed)
- Integrates with Zustand store to persist processed data

#### 2. **ReceiptProcessingStatus** (`src/components/receipt/ReceiptProcessingStatus.tsx`)
Displays current processing status:
- Pending: Waiting indicator
- Processing: Spinner with optional progress percentage
- Completed: Success checkmark
- Failed: Error icon with error message

#### 3. **ReceiptDataDisplay** (`src/components/receipt/ReceiptDataDisplay.tsx`)
Displays extracted receipt data:
- Merchant name with confidence score
- Date with confidence score
- Total amount with confidence badge
- Subtotal and tax (optional)
- Line items with quantity, price, and confidence
- Category and payment method (optional)
- Highlights confidence scores >70% in green
- Shows lower confidence scores (<70%) in yellow

#### 4. **ReceiptDataEditor** (`src/components/receipt/ReceiptDataEditor.tsx`)
Modal for editing extracted data:
- Edit merchant, date, total
- Edit subtotal, tax (optional fields)
- Add/remove/edit line items
- Edit category and payment method
- Validation for required fields
- Save/cancel actions

### Services

#### Receipt Service (`src/services/receipt.service.ts`)
API client for receipt operations:
- `submitReceipt(data)`: Submit receipt for AI processing
- `getProcessingStatus(receiptId)`: Get current processing status
- `retryProcessing(receiptId)`: Retry failed processing
- `updateReceiptData(receiptId, data)`: Update edited receipt data

### Hooks

#### TanStack Query Hooks (`src/hooks/useReceipt.ts`)
- `useSubmitReceipt()`: Mutation hook for submitting receipts
- `useReceiptProcessingStatus(receiptId)`: Query hook with automatic polling
- `useRetryProcessing()`: Mutation hook for retrying
- `useUpdateReceiptData()`: Mutation hook for updating data

Query configuration:
- Polling interval: 2 seconds while status is 'pending' or 'processing'
- Stops polling when status is 'completed' or 'failed'
- Retry: 1 attempt
- Stale time: 60 seconds

### State Management

#### Receipt Store (`src/store/receipt.ts`)
Zustand store extended with:
- `setProcessedData(id, data)`: Store processed receipt data
- Updates receipt status to 'processed' when data is set

### Types

#### Enhanced Receipt Types (`src/types/receipt.ts`)
- `ReceiptItem`: Individual line item with confidence score
- `ProcessedReceiptData`: Complete extracted receipt information
- `Receipt`: Extended with processing states and processed data

New receipt statuses:
- `processing`: AI processing in progress
- `processed`: Processing completed with data

## API Integration

### Expected Backend Endpoints

#### Submit Receipt
```
POST /api/receipts/process
Body: { imageUrl: string, fileName: string }
Response: { receiptId: string, status: string, message?: string }
```

#### Get Processing Status
```
GET /api/receipts/:receiptId/status
Response: {
  receiptId: string,
  status: 'pending' | 'processing' | 'completed' | 'failed',
  progress?: number,
  data?: ProcessedReceiptData,
  error?: string
}
```

#### Retry Processing
```
POST /api/receipts/:receiptId/retry
Response: { receiptId: string, status: string, message?: string }
```

#### Update Receipt Data
```
PATCH /api/receipts/:receiptId
Body: Partial<ProcessedReceiptData>
Response: ProcessedReceiptData
```

## Features

### Real-time Status Tracking
- Automatic polling every 2 seconds while processing
- Visual feedback with spinners and progress indicators
- Timeout after 60 seconds with option to check status manually

### Confidence Scores
- Displayed for merchant, date, total, and individual items
- Visual badges: green for >70%, yellow for 50-70%, red for <50%
- High confidence (>70%) items show checkmark icon

### Error Handling
- Clear error messages for failed processing
- Retry button with loading state
- Toast notifications for user feedback
- Graceful handling of API errors

### Data Persistence
- Processed data stored in Zustand store
- Survives component re-renders
- Accessible across the application

### User Experience
- Loading states during processing
- Real-time progress updates
- Inline editing of extracted data
- Validation for edited data
- Confirmation toasts for actions

## Usage Example

The integration is automatically active in the existing `ReceiptUpload` component flow:

1. User uploads receipt → `ReceiptUpload` component
2. Receipt is uploaded → status changes to 'uploaded'
3. `ReceiptProcessor` automatically submits to AI processing
4. Status updates poll every 2 seconds
5. When completed, extracted data is displayed
6. User can edit data if needed
7. Data is persisted in store

## Configuration

### Environment Variables
The service uses the existing API base URL:
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

### Polling Configuration
Adjust in `src/hooks/useReceipt.ts`:
- `refetchInterval`: Currently 2000ms (2 seconds)
- Timeout: Handled in `ReceiptProcessor` component (60000ms)

### Confidence Thresholds
Defined in `ReceiptDataDisplay` component:
- High confidence: >70%
- Medium confidence: 50-70%
- Low confidence: <50%

## Testing Notes

Since the backend API is not yet implemented, the integration will:
- Show error states when API endpoints are not available
- Allow retry functionality to be tested
- Display mock error messages

To test with a mock backend:
1. Set up API endpoints matching the expected structure
2. Return appropriate status updates during polling
3. Include confidence scores in the response data

## Future Enhancements

Potential improvements:
- WebSocket support for real-time updates (alternative to polling)
- Batch processing for multiple receipts
- Receipt template recognition
- Category auto-suggestion
- Duplicate receipt detection
- Export processed data
- Receipt history and search
