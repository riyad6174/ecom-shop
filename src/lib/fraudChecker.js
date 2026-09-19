// FraudChecker courier-history helper (server-only — API key never leaves the server).
// Never throws: resolves to sanitized data or null so order creation can never fail because of QC.

const DEFAULT_TIMEOUT_MS = 4500;
const MAX_COURIERS = 10;

function getConfig() {
  return {
    apiKey: process.env.FRAUDCHECKER_API_KEY || '',
    apiUrl: process.env.FRAUDCHECKER_API_URL || 'https://fraudchecker.link/api/v1/qc/',
    timeoutMs: Number(process.env.FRAUDCHECKER_TIMEOUT_MS) || DEFAULT_TIMEOUT_MS,
  };
}

// Vendor expects 11-digit "01XXXXXXXXX". Accepts +880 / 880 / 01 + separators.
export function normalizePhoneForQC(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  if (!digits) return null;
  let local = digits;
  // International format: 880 + 10 digits starting with 1 (e.g. 8801712345678)
  // → local format: 0 + those 10 digits (e.g. 01712345678).
  if (local.startsWith('880')) local = `0${local.slice(3)}`;
  if (!/^01\d{9}$/.test(local)) return null;
  return local;
}

function num(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function sanitizeCouriers(couriers) {
  if (!couriers || typeof couriers !== 'object') return {};
  const out = {};
  for (const [name, c] of Object.entries(couriers).slice(0, MAX_COURIERS)) {
    if (!c || typeof c !== 'object') continue;
    out[String(name).slice(0, 60)] = {
      total: num(c.total),
      delivered: num(c.delivered),
      cancelled: num(c.cancelled),
    };
  }
  return out;
}

export function emptyFraudCheck() {
  return {
    totalParcels: 0,
    totalDelivered: 0,
    totalCancelled: 0,
    deliveryRate: null,
    riskStatus: '',
    couriers: {},
  };
}

export function sanitizeFraudResponse(json) {
  if (!json || json.success !== true) return null;
  let rate = json.delivery_rate === null || json.delivery_rate === undefined ? null : num(json.delivery_rate, null);
  if (rate !== null && rate !== undefined) {
    if (!Number.isFinite(rate)) rate = null;
    else rate = Math.min(100, Math.max(0, Math.round(rate * 100) / 100));
  }
  return {
    totalParcels: num(json.total_parcels),
    totalDelivered: num(json.total_delivered),
    totalCancelled: num(json.total_cancelled),
    deliveryRate: rate === undefined ? null : rate,
    riskStatus: String(json.risk_status || '').slice(0, 50),
    couriers: sanitizeCouriers(json.couriers),
  };
}

// Main entry: fetch courier history for a raw phone string. Returns sanitized data or null.
export async function fetchCourierHistory(rawPhone) {
  const { apiKey, apiUrl, timeoutMs } = getConfig();
  const phone = normalizePhoneForQC(rawPhone);
  if (!phone) {
    console.log(`[QC] skip — invalid phone format: ${String(rawPhone || '').slice(0, 20)}`);
    return null;
  }
  if (!apiKey) {
    console.warn('[QC] skip — FRAUDCHECKER_API_KEY not set');
    return null;
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const url = `${apiUrl.replace(/\/?$/, '/')}?api_key=${encodeURIComponent(apiKey)}&phone=${encodeURIComponent(phone)}`;
    const res = await fetch(url, { method: 'GET', signal: controller.signal });
    if (!res.ok) {
      console.warn(`[QC] vendor HTTP ${res.status} for ${phone}`);
      return null;
    }
    const json = await res.json().catch(() => null);
    const data = sanitizeFraudResponse(json);
    if (!data) {
      console.warn(`[QC] vendor success=false for ${phone}`);
      return null;
    }
    console.log(`[QC] ok ${phone} — ${data.totalDelivered}/${data.totalParcels} (${data.deliveryRate}%) ${data.riskStatus}`);
    return data;
  } catch (err) {
    console.warn(`[QC] fail ${phone}:`, err?.name === 'AbortError' ? `timeout after ${timeoutMs}ms` : err?.message || err);
    return null;
  } finally {
    clearTimeout(timer);
  }
}
