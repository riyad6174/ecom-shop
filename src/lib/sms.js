import { connectDB } from '@/lib/mongodb';
import SmsLog from '@/models/SmsLog';

const API_KEY = process.env.BULKSMS_API_KEY || 'PH7HSfBBakv0S569DcUK';
const SENDER_ID = process.env.BULKSMS_SENDER_ID || 'SHEII SHOP';
const CONTACT_NUMBER = '01814575428';

const BASE_URL = 'http://bulksmsbd.net/api';

// 15s cap so a slow provider never hangs the background task indefinitely
const FETCH_TIMEOUT_MS = 15000;

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
  return (
    `অর্ডার গ্রহণ করা হয়েছে।\nমোট: ৳${amount}\n-SHEII SHOP : ${CONTACT_NUMBER}`
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

async function fetchWithTimeout(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { signal: controller.signal });
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
  const url = `${BASE_URL}/smsapi?${params.toString()}`;

  try {
    const res = await fetchWithTimeout(url);
    const data = await res.json().catch(() => ({}));
    const code = Number(data.response_code);
    return {
      ok: code === 202,
      code: Number.isNaN(code) ? -1 : code,
      message: data.message || (code === 202 ? 'Sent' : 'Provider error'),
    };
  } catch (error) {
    return {
      ok: false,
      code: -1,
      message: error.name === 'AbortError' ? 'Request timeout' : error.message || 'Request failed',
    };
  }
}

async function getBalance() {
  const now = Date.now();
  if (balanceCache.value !== null && now < balanceCache.expires) {
    return balanceCache.value;
  }

  const params = new URLSearchParams({ api_key: API_KEY });
  const url = `${BASE_URL}/getBalanceApi?${params.toString()}`;

  try {
    const res = await fetchWithTimeout(url);
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
