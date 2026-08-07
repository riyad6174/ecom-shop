import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import { sendOrderConfirmationSMS } from '@/lib/sms';

// Vercel Cron sends this header (value = CRON_SECRET env). This stops the
// public from triggering the endpoint. If CRON_SECRET is not set, only allow
// requests carrying the header (Vercel always sends it for cron jobs).
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const secret = process.env.CRON_SECRET;
  const headerSecret = req.headers['authorization'];
  if (secret && headerSecret !== `Bearer ${secret}`) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    await connectDB();

    // Orders still needing an SMS. Include 'pending' (never attempted) and
    // 'failed' (transient provider error) so a one-off failure retries on the
    // next run. Process in small batches.
    const pending = await Order.find({ smsStatus: { $in: ['pending', 'failed'] } })
      .sort({ createdAt: 1 })
      .limit(20)
      .lean();

    let sent = 0;
    let skipped = 0;
    let failed = 0;

    for (const order of pending) {
      const status = await sendOrderConfirmationSMS(order);
      if (status === 'sent') sent += 1;
      else if (status === 'failed') failed += 1;
      else skipped += 1;
    }

    return res.status(200).json({ ok: true, pending: pending.length, sent, failed, skipped });
  } catch (error) {
    console.error('[CRON] send-sms error:', error.message || error);
    return res.status(500).json({ message: 'Failed' });
  }
}
