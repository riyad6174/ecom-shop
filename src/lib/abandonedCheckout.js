// Server-side helpers for abandoned-checkout tracking.
// Shared by /api/checkout/track, /api/submit, /api/cron/detect-abandoned
// and the admin abandoned-orders APIs.
import CheckoutSession from '@/models/CheckoutSession';
import Order from '@/models/Order';

// No activity for this long → abandoned. The cron runs every minute, so a
// session is classified 3–4 minutes after the customer's last interaction.
export const ABANDON_AFTER_MS = 3 * 60 * 1000;

const SESSION_ID_RE = /^[A-Za-z0-9_-]{8,64}$/;

export function isValidSessionId(id) {
  return typeof id === 'string' && SESSION_ID_RE.test(id);
}

/** "+8801712345678" | "8801712345678" | "01712345678" → "01712345678", else '' */
export function toLocalPhone(phone) {
  let digits = String(phone || '').replace(/\D/g, '');
  if (digits.startsWith('880')) digits = `0${digits.slice(3)}`;
  return /^01[3-9]\d{8}$/.test(digits) ? digits : '';
}

/** Every format an Order.phone may have been saved in for this number. */
export function phoneVariants(local) {
  if (!local) return [];
  const rest = local.slice(1);
  return [local, `880${rest}`, `+880${rest}`];
}

const str = (v, max) => String(v ?? '').slice(0, max);
const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

/** Whitelist + clamp the fields a client may write to a checkout session. */
export function sanitizeCheckoutPayload(body = {}) {
  const items = Array.isArray(body.items) ? body.items.slice(0, 20) : [];
  return {
    name: str(body.name, 120),
    phone: str(body.phone, 20),
    deliveryZone: str(body.deliveryZone, 80),
    address: str(body.address, 500),
    items: items.map((it) => ({
      id: str(it?.id, 100),
      title: str(it?.title, 200),
      variant: str(it?.variant, 100),
      price: num(it?.price),
      quantity: Math.max(1, Math.min(999, Math.floor(num(it?.quantity)) || 1)),
      image: str(it?.image, 500),
    })),
    totalPrice: num(body.totalPrice),
    shippingCharge: num(body.shippingCharge),
    grandTotal: num(body.grandTotal),
    couponCode: str(body.couponCode, 50),
    pageUrl: str(body.pageUrl, 1000),
    trafficSource: str(body.trafficSource, 50),
    deviceType: str(body.deviceType, 20),
  };
}

/**
 * Mark a checkout session as completed. Upserts, so a tracking request that
 * is still in flight can never create an "active" record after the order
 * (its upsert hits the unique sessionId and is ignored). Completed status
 * overrides abandoned unconditionally — a placed order always wins.
 */
export async function completeCheckoutSession(sessionId, { orderId, name, phone } = {}) {
  if (!isValidSessionId(sessionId)) return;
  const now = new Date();
  try {
    await CheckoutSession.updateOne(
      { sessionId },
      {
        $set: { status: 'completed', completedAt: now, orderId: orderId || '' },
        $setOnInsert: {
          name: str(name, 120),
          phone: str(phone, 20),
          phoneLocal: toLocalPhone(phone),
          lastActivityAt: now,
        },
      },
      { upsert: true },
    );
  } catch (err) {
    // Two concurrent upserts on the same sessionId: the loser gets E11000.
    // Retry as a plain update — the document exists now.
    if (err?.code === 11000) {
      await CheckoutSession.updateOne(
        { sessionId },
        { $set: { status: 'completed', completedAt: now, orderId: orderId || '' } },
      );
    } else {
      throw err;
    }
  }
}

/**
 * Backend inactivity detection. Moves `active` sessions whose last activity
 * is older than ABANDON_AFTER_MS to `abandoned`.
 *
 * Safety net: if an order with the same phone was placed after the session
 * started (e.g. the completion call failed, or an old cached client didn't
 * send its sessionId), the session is marked completed instead.
 *
 * Every write is conditional on `status: 'active'` and the stale
 * lastActivityAt, so a concurrent completion or a fresh tracking update
 * always wins over the sweep. Idempotent and safe to run concurrently.
 */
export async function sweepAbandonedCheckouts({ limit = 500 } = {}) {
  const now = new Date();
  const cutoff = new Date(now.getTime() - ABANDON_AFTER_MS);

  const stale = await CheckoutSession.find({ status: 'active', lastActivityAt: { $lt: cutoff } })
    .select('_id phoneLocal createdAt')
    .sort({ lastActivityAt: 1 })
    .limit(limit)
    .lean();
  if (stale.length === 0) return { abandoned: 0, completed: 0 };

  // One query for all candidate phones: orders placed since the oldest session began.
  const allVariants = [...new Set(stale.flatMap((s) => phoneVariants(s.phoneLocal)))];
  const oldest = stale.reduce((min, s) => (s.createdAt < min ? s.createdAt : min), stale[0].createdAt);
  const orders = allVariants.length
    ? await Order.find({ phone: { $in: allVariants }, createdAt: { $gte: oldest } })
        .select('phone orderId createdAt')
        .lean()
    : [];
  const ordersByPhone = new Map();
  for (const o of orders) {
    const local = toLocalPhone(o.phone);
    if (!local) continue;
    if (!ordersByPhone.has(local)) ordersByPhone.set(local, []);
    ordersByPhone.get(local).push(o);
  }

  const toAbandon = [];
  let completed = 0;
  for (const s of stale) {
    const match = (ordersByPhone.get(s.phoneLocal) || []).find((o) => o.createdAt >= s.createdAt);
    if (match) {
      const r = await CheckoutSession.updateOne(
        { _id: s._id, status: 'active' },
        { $set: { status: 'completed', completedAt: now, orderId: match.orderId || '' } },
      );
      completed += r.modifiedCount || 0;
    } else {
      toAbandon.push(s._id);
    }
  }

  let abandoned = 0;
  if (toAbandon.length) {
    const r = await CheckoutSession.updateMany(
      { _id: { $in: toAbandon }, status: 'active', lastActivityAt: { $lt: cutoff } },
      { $set: { status: 'abandoned', abandonedAt: now } },
    );
    abandoned = r.modifiedCount || 0;
  }

  return { abandoned, completed };
}

/** Number of abandoned orders no admin has seen yet. */
export function countNewAbandoned() {
  return CheckoutSession.countDocuments({ status: 'abandoned', seenByAdmin: false });
}

// Admin reads also run the sweep (throttled per server instance) so the list
// and counter are accurate between cron runs and in local dev without cron.
let lastSweepAt = 0;
export async function sweepIfDue(minIntervalMs = 20 * 1000) {
  if (Date.now() - lastSweepAt < minIntervalMs) return;
  lastSweepAt = Date.now();
  try {
    await sweepAbandonedCheckouts();
  } catch (err) {
    lastSweepAt = 0;
    console.warn('[ABANDONED] sweep failed:', err?.message || err);
  }
}
