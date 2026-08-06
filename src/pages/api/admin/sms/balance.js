import { getBalance } from '@/lib/sms';
import { verifyAdmin } from '@/lib/auth';

export default async function handler(req, res) {
  const admin = verifyAdmin(req);
  if (!admin) return res.status(401).json({ message: 'Unauthorized' });

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { balance, code, fetchedAt } = await getBalance();
    return res.status(200).json({ balance, code, fetchedAt });
  } catch (error) {
    console.error('SMS balance fetch error:', error);
    return res.status(500).json({ message: 'Failed to fetch SMS balance' });
  }
}
