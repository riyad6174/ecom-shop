# Order Confirmation SMS (BulkSMSBD) — Implementation Plan

## Goal
After a customer successfully places an order, send a confirmation SMS to their number in the **background** (never blocking or failing the order flow). Enforce two business rules:
1. **Suspicious order** → skip SMS when a single order's total quantity > 6.
2. **Same-day dedup** → only send one SMS per phone number per (Bangladesh) day; subsequent orders that day are skipped.

Add an **Admin → SMS Management** page showing the remaining SMS balance and a log of all message attempts with user info, order details, message status, and message body preview.

## Current Architecture (verified)
- Next.js 15 (Pages Router) + Mongoose + MongoDB. Models in `src/models`, API routes under `src/pages/api`, admin routes protected by `verifyAdmin` from `src/lib/auth.js` (cookie JWT, name `admin_token`).
- Orders created in `src/pages/api/submit.js` (`Order.create(...)`) with fields: `name, phone, deliveryZone, address, items (JSON string), totalPrice, shippingCharge, grandTotal, orderId, orderDate, submissionTime`. Successful create returns `200`; duplicate `orderId` returns `409`.
- Order model: `src/models/Order.js`. Admin nav lives in `src/pages/admin/orders.js` header (Orders / Manage Product / Admins) and `src/pages/admin/products.js`.
- Admin API pattern: `src/pages/api/admin/orders/index.js` (GET list w/ pagination, search, status, date filter + stats).
- BulkSMSBD: `http://bulksmsbd.net/api/`. Send SMS via `/api/smsapi` (GET, params: `api_key,type=text,senderid,number,message`). Balance via `/api/getBalanceApi` → verified response `{ response_code: 202, balance: <number> }`.
- API key: `PH7HSfBBakv0S569DcUK`, Sender ID: `SHEII SHOP`.

## Files to Create
1. **`src/models/SmsLog.js`** — log of every SMS attempt.
2. **`src/lib/sms.js`** — shared SMS helpers (normalize phone, build message, send, balance).
3. **`src/pages/api/admin/sms/index.js`** — GET list of SMS log entries (admin).
4. **`src/pages/api/admin/sms/balance.js`** — GET remaining balance (admin).
5. **`src/pages/admin/sms.js`** — Admin SMS management page.

## Files to Modify
1. **`src/pages/api/submit.js`** — trigger background SMS after order saved.
2. **`src/pages/admin/orders.js`** — add "SMS" nav link.
3. **`src/pages/admin/products.js`** — add "SMS" nav link (keep nav consistent).
4. **`.env`** — add `BULKSMS_API_KEY`, `BULKSMS_SENDER_ID`.

## Details

### 1. SmsLog model (`src/models/SmsLog.js`)
Follow the `Order.js` style (export pattern + model rebuild guard). Fields:
- `name: String`
- `phone: String` — normalized international (`8801XXXXXXXX`)
- `orderId: String`
- `productNames: String` — comma-joined product titles (derived from order items)
- `orderValue: Number` — `grandTotal`
- `message: String` — full message body sent
- `status: String` — enum `['sent', 'failed', 'suspicious_skipped', 'dedup_skipped']`, default `sent`
- `apiCode: Number` — BulkSMSBD `response_code` (e.g. `202`) or custom code (`-1` send error, `0` skipped)
- `apiMessage: String` — provider message / error text
- `reason: String` — optional human note (e.g. "Total qty 8 > 6", "Already sent today")
- `sentDate: String` — Bangladesh date `YYYY-MM-DD` (for dedup query)
- `timestamps: true`
- Indexes: `{ phone: 1, sentDate: 1 }`, `{ createdAt: -1 }`.

### 2. SMS helpers (`src/lib/sms.js`)
- `normalizePhone(phone)`:
  - strip spaces / leading `+`
  - if starts with `0` → prepend `880`
  - if starts with `880` → keep
  - if starts with `88` → keep (already international)
  - else return as-is
- `getTodayBD()` → `YYYY-MM-DD` string in Asia/Dhaka (offset +6).
- `buildConfirmationMessage(order)` → uses recommended template:
  ```
  অর্ডার গ্রহণ করা হয়েছে।
  মোট: ৳{grandTotal}
  -SHEII SHOP : 01814575428
  ```
  (Replace `{grandTotal}`; sender line uses the given contact number `01814575428`.)
- `countOrderQuantity(itemsStr)` → sum of item quantities (parse JSON, tolerate malformed).
- `sendSMS({ phone, message })` → GET request to
  `http://bulksmsbd.net/api/smsapi` with `api_key, type=text, number, senderid, message` (all URL-encoded). Returns `{ ok, code, message }` (ok when `response_code === 202`).
- `getBalance()` → GET `/api/getBalanceApi`; returns `{ balance, code }`. Cache result in module-scope var with ~60s TTL to avoid hammering provider.
- `sendOrderConfirmationSMS(order)` → orchestrates the full background flow (below). **Never throws** — all errors swallowed & logged.

### 3. Background flow (`sendOrderConfirmationSMS(order)`)
Called after `Order.create` succeeds. Order doc passed is the created doc (fields: `name, phone, grandTotal, orderId, items`).

Steps (all inside try/catch):
1. `await connectDB()`.
2. Normalize phone; compute `todayBD = getTodayBD()`; `totalQty = countOrderQuantity(order.items)`.
3. **Rule 1 (suspicious):** if `totalQty > 6` → create `SmsLog` record `{ status: 'suspicious_skipped', reason: 'Total quantity X > 6', apiCode: 0 }` and return. No SMS.
4. **Rule 2 (dedup):** query `SmsLog.findOne({ phone: normalized, sentDate: todayBD, status: 'sent' })`. If found → create `{ status: 'dedup_skipped', reason: 'Already sent today', apiCode: 0 }` and return. No SMS.
5. Build message; call `sendSMS`.
6. Create `SmsLog` record:
   - success → `status: 'sent', apiCode: 202`
   - failure → `status: 'failed', apiCode: <response_code or -1>, apiMessage: <text>`
7. Log outcome server-side; never propagate errors.

**Background execution in `submit.js`:** after `Order.create(...)` succeeds, invoke:
```js
sendOrderConfirmationSMS(savedOrder).catch(() => {});
```
**without** `await` (fire-and-forget) so the order response returns immediately and SMS/provider failures never affect order placement. Works reliably because the app runs on a persistent Next server (not serverless — confirmed by repo-local dev logs, real Mongo/R2 creds). Import `sendOrderConfirmationSMS` from `@/lib/sms`. Keep the existing `200`/`409` response logic unchanged.

> Note: the `409` duplicate path does NOT re-trigger SMS (SMS only fires on a genuinely created order).

### 4. Admin API: list SMS log (`src/pages/api/admin/sms/index.js`)
Mirror `orders/index.js` pattern:
- `verifyAdmin` guard → `401` if not.
- `GET` only.
- Query params: `page`, `limit` (max 100), `search` (matches `name | phone | orderId`), `status`, `from`, `to` (on `createdAt`).
- Returns `{ logs, total, page, totalPages, stats }` where `stats` = `{ totalSent, totalFailed, totalSuspicious, totalDeduped }` (global counts per status).
- Sort `createdAt: -1`.

### 5. Admin API: balance (`src/pages/api/admin/sms/balance.js`)
- `verifyAdmin` guard.
- `GET` only.
- Returns `{ balance, code, fetchedAt }` from `getBalance()`.
- `getBalance()` handles both `response_code: 202` and non-202 (return `code` + balance `0`).

### 6. Admin page (`src/pages/admin/sms.js`)
Base styling/nav on `admin/orders.js` (header with nav links, auth guard via `/api/admin/me`, `Head`, toast). Sections:
- **Balance card**: shows `৳{balance}` (fetch `/api/admin/sms/balance`), refresh button.
- **Stats row**: Sent / Failed / Suspicious skipped / Dedup skipped.
- **Filters**: search (name/phone/orderId), status dropdown, date range.
- **Table columns**: Customer (name + phone), Order Number, Product(s), Order Value (৳grandTotal), Message body preview (truncate first ~40 chars, tooltip/title for full), Status badge (color-coded: sent=green, failed=red, suspicious=orange, dedup=slate), Timestamp.
- **Pagination** like orders page.
- **Nav**: add a new `Link href="/admin/sms"` labeled "SMS" in the header nav (also add to `orders.js` and `products.js` nav for consistency).
- Empty state, loading spinner, error handling consistent with orders page.

### 7. `.env`
Add (values as provided):
```
BULKSMS_API_KEY=PH7HSfBBakv0S569DcUK
BULKSMS_SENDER_ID=SHEII SHOP
```
Read these in `lib/sms.js` (fall back to the provided defaults if unset).

## Validation
- `npm run lint` passes.
- Manual: place a normal order (≤6 qty) → SmsLog row `status: sent`; confirm via BulkSMSBD response `202`.
- Place 2nd order same phone same day → second row `status: dedup_skipped`, no SMS.
- Place order with total qty > 6 → row `status: suspicious_skipped`, no SMS.
- Admin SMS page: balance shows `2999.38` (or current), table lists rows with statuses, search/pagination work, auth guard redirects unauthenticated users.
- Verify normal order response time is unaffected (SMS is fire-and-forget).

## Notes / Risks
- **Real SMS cost:** every test sends a real SMS. Use a real test phone; watch balance.
- **Provider response format** for `/api/smsapi` is assumed to include `response_code` (per docs success `202`). Parsing tolerates missing fields.
- **Time zone:** dedup uses Asia/Dhaka date; a cron/recompute is NOT needed since checks happen live at order time.
- **Balance cache** is process-local (60s TTL); acceptable for single-instance hosting. If scaled to multiple instances later, move dedup/balance caching to Mongo/Redis.
- Fire-and-forget relies on a persistent server; if ever deployed to Vercel/serverless, the SMS trigger should move to a queue/cron + `GET` endpoint instead.
