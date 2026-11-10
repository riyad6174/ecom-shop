import { connectDB } from '@/lib/mongodb';
import { verifyAdmin } from '@/lib/auth';
import { countNewAbandoned, sweepIfDue } from '@/lib/abandonedCheckout';

// Sidebar badge: number of abandoned orders no admin has seen yet.
export default async function handler(req, res) {
  if (!verifyAdmin(req)) return res.status(401).json({ message: 'Unauthorized' });
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' });

  try {
    await connectDB();
    await sweepIfDue();
    const count = await countNewAbandoned();
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ count });
  } catch (error) {
    console.error('Abandoned count error:', error);
    return res.status(500).json({ message: 'Failed' });
  }
}
