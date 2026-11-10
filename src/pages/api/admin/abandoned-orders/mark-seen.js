import { connectDB } from '@/lib/mongodb';
import { verifyAdmin } from '@/lib/auth';
import CheckoutSession from '@/models/CheckoutSession';

// Resets the "new abandoned orders" counter. Records are kept — only the
// seenByAdmin flag changes. `upTo` (the serverTime returned with the list the
// admin is looking at) keeps orders detected after that list was loaded
// counted as new.
export default async function handler(req, res) {
  if (!verifyAdmin(req)) return res.status(401).json({ message: 'Unauthorized' });
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  try {
    await connectDB();
    const filter = { status: 'abandoned', seenByAdmin: false };
    const upTo = req.body?.upTo ? new Date(req.body.upTo) : null;
    if (upTo && !Number.isNaN(upTo.getTime())) filter.abandonedAt = { $lte: upTo };

    const r = await CheckoutSession.updateMany(filter, { $set: { seenByAdmin: true } });
    return res.status(200).json({ ok: true, marked: r.modifiedCount || 0 });
  } catch (error) {
    console.error('Abandoned mark-seen error:', error);
    return res.status(500).json({ message: 'Failed' });
  }
}
