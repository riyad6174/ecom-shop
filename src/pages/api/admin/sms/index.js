import { connectDB } from '@/lib/mongodb';
import SmsLog from '@/models/SmsLog';
import { verifyAdmin } from '@/lib/auth';

const VALID_STATUSES = ['sent', 'failed', 'suspicious_skipped', 'dedup_skipped'];

export default async function handler(req, res) {
  const admin = verifyAdmin(req);
  if (!admin) return res.status(401).json({ message: 'Unauthorized' });

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();

    const {
      page = 1,
      limit = 30,
      search = '',
      status = '',
      from = '',
      to = '',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const filter = {};

    if (search.trim()) {
      const regex = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ name: regex }, { phone: regex }, { orderId: regex }];
    }

    if (status && VALID_STATUSES.includes(status)) {
      filter.status = status;
    }

    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = toDate;
      }
    }

    const [logs, total, stats] = await Promise.all([
      SmsLog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      SmsLog.countDocuments(filter),
      Promise.all([
        SmsLog.countDocuments({ status: 'sent' }),
        SmsLog.countDocuments({ status: 'failed' }),
        SmsLog.countDocuments({ status: 'suspicious_skipped' }),
        SmsLog.countDocuments({ status: 'dedup_skipped' }),
      ]),
    ]);

    return res.status(200).json({
      logs,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      stats: {
        totalSent: stats[0],
        totalFailed: stats[1],
        totalSuspicious: stats[2],
        totalDeduped: stats[3],
      },
    });
  } catch (error) {
    console.error('SMS log fetch error:', error);
    return res.status(500).json({ message: 'Failed to fetch SMS log' });
  }
}
