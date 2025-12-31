# Receipt Processing Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                     USER UPLOADS RECEIPT IMAGE                      │
│                         (ReceiptUpload)                             │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │  Image Validation &    │
                    │  Compression           │
                    └────────────┬───────────┘
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │  Upload to Storage     │
                    │  (Mock - placeholder)  │
                    └────────────┬───────────┘
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │ Status: 'uploaded'     │
                    │ uploadedUrl available  │
                    └────────────┬───────────┘
                                 │
┌────────────────────────────────┴────────────────────────────────────┐
│                    RECEIPT PROCESSOR ACTIVATES                      │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │  Submit to Backend     │
                    │  POST /receipts/process│
                    │  { imageUrl, fileName } │
                    └────────────┬───────────┘
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │  Receive receiptId     │
                    │  Start Polling         │
                    └────────────┬───────────┘
                                 │
┌────────────────────────────────┴────────────────────────────────────┐
│                      POLLING LOOP (Every 2s)                        │
│                  GET /receipts/:id/status                           │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                    ┌────────────▼───────────┐
                    │   Check Status         │
                    └────────────┬───────────┘
                                 │
                 ┌───────────────┼───────────────┐
                 │               │               │
                 ▼               ▼               ▼
        ┌────────────┐  ┌────────────┐  ┌────────────┐
        │  pending/  │  │ completed  │  │   failed   │
        │ processing │  │            │  │            │
        └──────┬─────┘  └──────┬─────┘  └──────┬─────┘
               │                │                │
               │                │                │
    ┌──────────▼────────┐      │      ┌────────▼─────────┐
    │ Show Spinner      │      │      │ Show Error       │
    │ Continue Polling  │      │      │ Offer Retry      │
    │ (max 60s)         │      │      └──────────────────┘
    └───────────────────┘      │
                               │
┌──────────────────────────────┴─────────────────────────────────────┐
│                    PROCESSING COMPLETE                              │
└──────────────────────────────┬─────────────────────────────────────┘
                               │
                               ▼
                  ┌────────────────────────┐
                  │  Display Extracted Data│
                  │  - Merchant (conf)     │
                  │  - Date (conf)         │
                  │  - Total (conf)        │
                  │  - Items with prices   │
                  │  - Subtotal, Tax       │
                  │  - Category, Payment   │
                  └────────────┬───────────┘
                               │
                ┌──────────────┴─────────────┐
                │                            │
                ▼                            ▼
    ┌───────────────────┐       ┌──────────────────────┐
    │  User Accepts     │       │   User Clicks Edit   │
    │  Data as-is       │       └──────────┬───────────┘
    └───────────────────┘                  │
                                           ▼
                               ┌──────────────────────┐
                               │ Open Editor Modal    │
                               │ - Edit all fields    │
                               │ - Add/Remove items   │
                               └──────────┬───────────┘
                                          │
                                          ▼
                               ┌──────────────────────┐
                               │  Save Changes        │
                               │ PATCH /receipts/:id  │
                               └──────────┬───────────┘
                                          │
                                          ▼
                               ┌──────────────────────┐
                               │ Update Store & UI    │
                               │ Show Success Toast   │
                               └──────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                         DATA PERSISTENCE                            │
│                                                                     │
│  Zustand Store Updates:                                            │
│  - receipt.status = 'processed'                                    │
│  - receipt.processedData = extractedData                           │
│                                                                     │
│  Data Available Globally:                                          │
│  - useReceiptUploadStore().receipts                                │
│  - Persists across component re-renders                            │
└─────────────────────────────────────────────────────────────────────┘


COMPONENT INTERACTION:
═══════════════════════

ReceiptUpload
    │
    └─> ImagePreview (for each receipt)
            │
            └─> ReceiptProcessor (when uploaded)
                    │
                    ├─> ReceiptProcessingStatus (status display)
                    │
                    └─> ReceiptDataDisplay (when completed)
                            │
                            └─> ReceiptDataEditor (on edit click)


API INTEGRATION POINTS:
═══════════════════════

1. Submit Receipt
   POST /api/receipts/process
   Body: { imageUrl: string, fileName: string }
   Returns: { receiptId, status }

2. Poll Status
   GET /api/receipts/:receiptId/status
   Returns: { receiptId, status, progress?, data?, error? }
   Polls every 2s until completed/failed

3. Retry Processing
   POST /api/receipts/:receiptId/retry
   Returns: { receiptId, status }

4. Update Data
   PATCH /api/receipts/:receiptId
   Body: Partial<ProcessedReceiptData>
   Returns: Updated ProcessedReceiptData


CONFIDENCE SCORE VISUALIZATION:
═══════════════════════════════

Score > 70%:  [✓] Green badge with checkmark
Score 50-70%: [~] Yellow badge
Score < 50%:  [!] Red badge

Example Display:
┌─────────────────────────────────┐
│ Merchant: Starbucks             │
│ Confidence: 95% [✓]             │
├─────────────────────────────────┤
│ Date: Dec 31, 2024              │
│ Confidence: 88% [✓]             │
├─────────────────────────────────┤
│ Total: $24.50                   │
│ Confidence: 92% [✓]             │
└─────────────────────────────────┘
```
