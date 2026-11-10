import { connectDB } from '@/lib/mongodb';
import { sweepAbandonedCheckouts } from '@/lib/abandonedCheckout';

// Backend inactivity detection for abandoned checkouts. Runs every minute
// (vercel.json). Works even when the customer closed the browser, because it
// only looks at lastActivityAt in the database.
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const secret = process.env.CRON_SECRET;
  if (secret && req.headers['authorization'] !== `Bearer ${secret}`) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    await connectDB();
    const result = await sweepAbandonedCheckouts();
    return res.status(200).json({ ok: true, ...result });
  } catch (error) {
    console.error('[CRON] detect-abandoned error:', error.message || error);
    return res.status(500).json({ message: 'Failed' });
  }
}
