import { connectDB } from '@/lib/mongodb';
import SmsLog from '@/models/SmsLog';

const API_KEY = process.env.BULKSMS_API_KEY || 'PH7HSfBBakv0S569DcUK';
const SENDER_ID = process.env.BULKSMS_SENDER_ID || 'SHEII SHOP';

const BASE_URL = 'http://bulksmsbd.net/api';

// Cap so a slow provider never hangs the background task indefinitely.
// Providers can stall >15s on reused keep-alive sockets, so allow a generous
// window and let the retry in sendSMS handle genuine one-off slowness.
const FETCH_TIMEOUT_MS = 30000;
const SEND_ATTEMPTS = 2;

// ── Balance cache (process-local, ~60s TTL) ────────────────────────────────
// Note: only works within a single server instance. If scaled to multiple
// instances, move this cache to Redis/Mongo instead.
let balanceCache = { value: null, expires: 0 };
const BALANCE_TTL_MS = 60 * 1000;

function getTodayBD() {
  const now = new Date(Date.now() + 6 * 60 * 60 * 1000); // Asia/Dhaka (UTC+6)
  return now.toISOString().slice(0, 10);
}

function normalizePhone(phone) {
  if (!phone) return '';
  let p = String(phone).replace(/[\s+]/g, '');
  if (p.startsWith('0')) return `880${p}`;
  if (p.startsWith('880')) return p;
  if (p.startsWith('88')) return p;
  return p;
}

function buildConfirmationMessage(order) {
  const amount = Number(order.grandTotal) || 0;
  const id = order.orderId || '';
  return (
    `ধন্যবাদ, অর্ডারটি সফল হয়েছে।\nমোট ${amount} Tk\n#ORD${id}\n-সেইই শপ`
  );
}

function countOrderQuantity(itemsStr) {
  try {
    const arr = JSON.parse(itemsStr || '[]');
    return arr.reduce((sum, it) => sum + (Number(it.quantity) || 1), 0);
  } catch {
    return 0;
  }
}

function extractProductNames(itemsStr) {
  try {
    const arr = JSON.parse(itemsStr || '[]');
    const names = arr
      .map((it) => it.title || it.name || 'Item')
      .filter(Boolean);
    return [...new Set(names)].join(', ');
  } catch {
    return '';
  }
}

// POST + connection: close avoids long-URL encoding pitfalls and the
// intermittent stalls the provider has over a pooled keep-alive socket.
async function requestProvider(path, params) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(`${BASE_URL}/${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Connection: 'close',
      },
      body: params.toString(),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

async function sendSMS({ phone, message }) {
  const params = new URLSearchParams({
    api_key: API_KEY,
    type: 'text',
    senderid: SENDER_ID,
    number: phone,
    message,
  });

  let lastError = null;
  for (let attempt = 0; attempt < SEND_ATTEMPTS; attempt++) {
    try {
      const res = await requestProvider('smsapi', params);
      const data = await res.json().catch(() => ({}));
      const code = Number(data.response_code);
      return {
        ok: code === 202,
        code: Number.isNaN(code) ? -1 : code,
        message:
          data.message ||
          data.error_message ||
          (code === 202 ? 'Sent' : 'Provider error'),
      };
    } catch (error) {
      lastError = error;
      // AbortError means the provider didn't respond in time — retry once.
      if (attempt === SEND_ATTEMPTS - 1) break;
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  return {
    ok: false,
    code: -1,
    message:
      lastError?.name === 'AbortError'
        ? 'Request timeout'
        : lastError?.message || 'Request failed',
  };
}

async function getBalance() {
  const now = Date.now();
  if (balanceCache.value !== null && now < balanceCache.expires) {
    return balanceCache.value;
  }

  const params = new URLSearchParams({ api_key: API_KEY });

  try {
    const res = await requestProvider('getBalanceApi', params);
    const data = await res.json().catch(() => ({}));
    const code = Number(data.response_code);
    const balance =
      code === 202 && !Number.isNaN(Number(data.balance)) ? Number(data.balance) : 0;

    balanceCache.value = { balance, code, fetchedAt: now };
    balanceCache.expires = now + BALANCE_TTL_MS;
    return balanceCache.value;
  } catch (error) {
    return {
      balance: 0,
      code: -1,
      fetchedAt: now,
    };
  }
}

async function createLog(entry) {
  try {
    await SmsLog.create({
      status: 'sent',
      apiCode: 202,
      ...entry,
    });
  } catch (error) {
    console.error('[SMS] Failed to persist log:', error.message || error);
  }
}

async function sendOrderConfirmationSMS(order) {
  try {
    await connectDB();

    const phone = normalizePhone(order.phone);
    const sentDate = getTodayBD();
    const totalQty = countOrderQuantity(order.items);

    const base = {
      name: order.name,
      phone,
      orderId: order.orderId,
      productNames: extractProductNames(order.items),
      orderValue: Number(order.grandTotal) || 0,
      sentDate,
    };

    // Rule 1: suspicious order (single order quantity > 6) → skip
    if (totalQty > 6) {
      await createLog({
        ...base,
        status: 'suspicious_skipped',
        apiCode: 0,
        reason: `Total quantity ${totalQty} > 6`,
      });
      console.log(`[SMS] Skipped suspicious order ${order.orderId} (qty ${totalQty})`);
      return;
    }

    // Rule 2: same-day dedup (one sent SMS per phone per BD day)
    const existing = await SmsLog.findOne({
      phone,
      sentDate,
      status: 'sent',
    });
    if (existing) {
      await createLog({
        ...base,
        status: 'dedup_skipped',
        apiCode: 0,
        reason: 'Already sent today',
      });
      console.log(`[SMS] Dedup skip ${order.orderId} — already sent to ${phone} today`);
      return;
    }

    const message = buildConfirmationMessage(order);
    const result = await sendSMS({ phone, message });

    await createLog({
      ...base,
      message,
      status: result.ok ? 'sent' : 'failed',
      apiCode: result.code,
      apiMessage: result.message,
    });

    console.log(
      `[SMS] ${result.ok ? 'SENT' : 'FAILED'} ${order.orderId} → ${phone} (code ${result.code})`,
    );
  } catch (error) {
    // Never propagate — background task must not break the order flow
    console.error('[SMS] sendOrderConfirmationSMS error:', error.message || error);
  }
}

export {
  normalizePhone,
  getTodayBD,
  buildConfirmationMessage,
  countOrderQuantity,
  extractProductNames,
  sendSMS,
  getBalance,
  sendOrderConfirmationSMS,
};
