import { connectDB } from '@/lib/mongodb';
import CheckoutSession from '@/models/CheckoutSession';
import { isValidSessionId, sanitizeCheckoutPayload, toLocalPhone } from '@/lib/abandonedCheckout';

// Progressive checkout tracking. Called (debounced) by the checkout forms
// once a valid phone number has been entered, and via sendBeacon when the
// page is hidden/closed. One document per sessionId — always updated in
// place, never duplicated.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // sendBeacon may deliver the JSON as text/plain
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ message: 'Invalid body' });
    }
  }

  const { sessionId } = body || {};
  if (!isValidSessionId(sessionId)) {
    return res.status(400).json({ message: 'Invalid session' });
  }

  const data = sanitizeCheckoutPayload(body);
  const phoneLocal = toLocalPhone(data.phone);
  // Tracking only starts with a valid phone number
  if (!phoneLocal) {
    return res.status(400).json({ message: 'Invalid phone' });
  }

  try {
    await connectDB();

    // Any activity makes the session active again (also reviving one the
    // sweep already marked abandoned). The status filter means a completed
    // session is never touched: its upsert collides with the unique
    // sessionId and is ignored below.
    await CheckoutSession.updateOne(
      { sessionId, status: { $ne: 'completed' } },
      {
        $set: { ...data, phoneLocal, status: 'active', lastActivityAt: new Date() },
      },
      { upsert: true },
    );
    return res.status(200).json({ ok: true });
  } catch (err) {
    if (err?.code === 11000) {
      // Session already completed (or a concurrent first insert) — nothing to do
      return res.status(200).json({ ok: true, ignored: true });
    }
    console.error('[CHECKOUT] track error:', err?.message || err);
    return res.status(500).json({ message: 'Failed' });
  }
}
