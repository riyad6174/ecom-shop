# Order Error Tracking & Admin Panel — Implementation Plan

## Goal
Track **order submission errors** (user-facing failures) from both the server and client, persist them to MongoDB, and surface them in a new **Admin → Order Errors** page. Successful orders are **not** tracked (a `409` duplicate is also **not** tracked, since the order was actually saved and the client treats it as success).

## Current Flow (verified)
- **Server:** `src/pages/api/submit.js` — `POST /api/submit`. Validates required fields (400), connects DB (8s timeout race), `Order.create` (unique `orderId`), returns `200`. On failure returns `409` (duplicate code `11000`) or `500`. The catch block is the server-side error point.
- **Client (two entry points):**
  1. `src/components/checkout/OrderDialog.jsx` (cart checkout dialog) — `handleSubmit` retries up to 2 attempts; `409` → treated as success; 4xx → shown as error; 5xx/network → retry then show error.
  2. `src/pages/order.js` (standalone order page) — single `fetch` with 10s `AbortController` timeout; `!response.ok` → error, catch → network error.
- **Admin nav** is inline per page header. Admin API pattern: `src/pages/api/admin/orders/index.js` (verifyAdmin, pagination page/limit max 100, search/status/date filters, stats via `Promise.all`). Admin UI pattern: `src/pages/admin/sms.js` (auth guard via `/api/admin/me`, header nav, stats cards, filter bar, table, pagination, toast).
- Models: `src/models/Order.js`, `src/models/SmsLog.js` (export pattern `mongoose.models.X || mongoose.model(...)`).

## Files to Create
1. `src/models/OrderError.js` — Mongoose model for order errors.
2. `src/pages/api/log-order-error.js` — public endpoint the **client** calls to record a user-facing failure.
3. `src/pages/api/admin/order-errors/index.js` — admin GET list (pagination, filters, stats).
4. `src/pages/admin/order-errors.js` — admin error log page.

## Files to Modify
1. `src/pages/api/submit.js` — write a server-side `OrderError` row in the catch block (non-409 only).
2. `src/components/checkout/OrderDialog.jsx` — report the final user-facing failure to `/api/log-order-error` once.
3. `src/pages/order.js` — report the failure to `/api/log-order-error` in the `catch`/`!response.ok` path.
4. `src/pages/admin/orders.js` — add "Order Errors" nav link.
5. `src/pages/admin/sms.js` — add "Order Errors" nav link (keep nav consistent).

## Details

### 1. `src/models/OrderError.js`
Export pattern like `SmsLog.js`. Fields:
- `type: String` — enum `['validation','network','timeout','server','db_connection','duplicate','unknown']`
- `source: String` — enum `['client','server']`
- `statusCode: Number` — HTTP status if any (`400`, `500`, etc.)
- `message: String` — human-readable error message (client or server text)
- `stack: String` — server error stack (optional)
- Customer:
  - `name: String`, `phone: String`, `deliveryZone: String`, `address: String`
- Order:
  - `orderId: String`
  - `productNames: String` — comma-joined item titles (reuse parsing like `lib/sms.js`)
  - `totalPrice: Number`, `shippingCharge: Number`, `grandTotal: Number`
  - `items: String` — original JSON string (raw)
  - `orderDate: String`, `submissionTime: String`
- `userAgent: String` — client browser UA (for diagnosing client errors)
- `url: String` — page URL where the error occurred (`/`, `/order`, etc.)
- `timestamps: true`
- Indexes: `{ createdAt: -1 }`, `{ type: 1 }`, `{ source: 1 }`, `{ orderId: 1 }`.

### 2. Server-side logging in `submit.js`
In the existing `catch (error)` block, **after** determining the status, and **only when NOT `11000`/`409`** (i.e. `500` path), fire a non-blocking log:
```js
if (error.code !== 11000) {
  logOrderError({
    type: error.name === 'DB connection timeout' ? 'db_connection' : 'server',
    source: 'server',
    statusCode: 500,
    message: error.message || 'Failed to submit order',
    stack: error.stack,
    name, phone, deliveryZone, address,
    orderId, items, totalPrice, shippingCharge, grandTotal, orderDate, submissionTime,
  }).catch(() => {});
}
```
Implement `logOrderError` in `src/lib/orderErrors.js` (new helper) or inline in `submit.js` guarded by try/catch — **never** let logging alter the existing response or throw. `connectDB` must be awaited inside the helper before Mongoose use.

> 400 validation errors (`!name || !phone ...`, `!orderId`) return early before the `try` block. To also capture these as server errors, wrap them: call the same `logOrderError` helper with `type: 'validation'`, `source: 'server'`, `statusCode: 400` before returning. This keeps server-side capture complete.

### 3. `src/pages/api/log-order-error.js` (public)
- `POST` only (405 otherwise).
- Accepts body: customer + order fields, plus `{ type, statusCode, message, url }`.
- `await connectDB()`; sanitize/trim values (never trust client). Coerce numbers.
- If `type` empty, infer `'unknown'`; map `AbortError` → `'timeout'`, network error → `'network'`, else `'server'`/`'validation'`.
- **Dedup:** `findOneAndUpdate({ orderId, source: 'client' }, {...}, { upsert: true, new: true })` so the client reporting the same `orderId` failure never creates duplicate rows (matches the client's single-final-report behavior and the 2-attempt retry).
- Return `200 { ok: true }`. Never throw; wrap in try/catch returning `200` regardless so logging never adds friction.

### 4. Client reporting
**`OrderDialog.jsx` (`handleSubmit`):** after the loop exhausts both attempts and reaches the `setSubmissionError(...)` at the end (the definitive user-visible failure), call:
```js
fetch('/api/log-order-error', {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ ...sheetData, type: 'network', statusCode: 0, message: 'Both submit attempts failed', url: typeof window !== 'undefined' ? window.location.href : '' }),
}).catch(() => {});
```
Do **not** log inside the loop (would duplicate). Only log once at the final failure. 409 is never reached here (returns success earlier).

**`order.js` (`handleSubmit`):** in the `!response.ok` branch and the `catch (error)` branch, call the same endpoint once:
- `!response.ok` → `type: 'server'/'validation'` based on `response.status >= 500 ? 'server' : 'validation'`, `statusCode: response.status`, message from `errorData.message`.
- `catch` → `type: error.name === 'AbortError' ? 'timeout' : 'network'`, `statusCode: 0`.
Fire-and-forget `.catch(() => {})`.

### 5. `src/pages/api/admin/order-errors/index.js`
Mirror `admin/orders/index.js`:
- `verifyAdmin` guard → 401. `GET` only.
- Query params: `page`, `limit` (max 100), `search` (matches `name | phone | orderId`), `type`, `source`, `from`, `to` (on `createdAt`).
- Filter `type` against the enum list; `source` against `['client','server']`; date range like orders API.
- Sort `createdAt: -1`.
- Returns `{ logs, total, page, totalPages, stats }` with `stats` = `{ totalValidation, totalNetwork, totalTimeout, totalServer, totalDbConnection, totalUnknown }` (counts by type) computed via `Promise.all`.

### 6. `src/pages/admin/order-errors.js`
Base styling on `admin/sms.js` (auth guard via `/api/admin/me`, header nav, Head, toast). Sections:
- **Stats row:** count per error `type` (validation / network / timeout / server / db connection / unknown).
- **Filters:** search (name/phone/orderId), type dropdown, source dropdown, date range.
- **Table columns:** Error Type (color-coded badge), Source (client/server), Status Code, Message (truncate, title tooltip), Customer (name + phone), Order Number, Product(s), Order Value (৳grandTotal), Timestamp.
- **Pagination** like sms.js.
- **Nav:** add `<Link href='/admin/order-errors'>Order Errors</Link>` in the header nav.
- Empty state, loading spinner, error handling consistent with sms.js.
- Add the same nav link to `admin/orders.js` and `admin/sms.js` for consistency.

### 7. `.env`
No new env vars required (uses existing `MONGODB_URI` via `connectDB`).

## Validation
- `npm run lint` — note: `next lint` is broken project-wide by an ESLint 9 + eslint-config-next incompatibility ("Cannot serialize key parse"); run `npx eslint <changed-files>` directly instead.
- Manual:
  - Submit an order with a bad payload (e.g. trigger DB failure / stop Mongo) → a `server`/`db_connection` row appears in Admin → Order Errors with customer + order details.
  - Force a client timeout / block the `/api/submit` fetch → a `network`/`timeout` row appears via `/api/log-order-error` (source `client`).
  - A successful order and a `409` duplicate → **no** new error rows.
  - Admin page: filters (type/source/search/date), pagination, stats cards work; auth guard redirects unauthenticated users to `/admin/login`.
  - Repeated client reports for the same `orderId` do not create duplicate rows (upsert).

## Notes / Risks
- **Client vs server duplicates:** same failed order can produce one server row (from `/api/submit`) and one client row (from `/api/log-order-error`). This is intentional (source field distinguishes them). Client dedups by `{orderId, source:'client'}`; server rows are keyed naturally.
- **Sensitive data:** storing full name/phone/address in error rows duplicates customer PII already in `Order`. Acceptable for a shop admin; note it.
- **Never break order flow:** all logging is fire-and-forget with `.catch(() => {})`; a DB failure in logging must not alter the submit response.
- **connectDB inside helpers:** `logOrderError` and `/api/log-order-error` must call `connectDB()` before any Mongoose call (they run outside the main request's connection context in the fire-and-forget case).
