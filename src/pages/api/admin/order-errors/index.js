import { connectDB } from '@/lib/mongodb';
import OrderError from '@/models/OrderError';
import { verifyAdmin } from '@/lib/auth';

const VALID_TYPES = ['validation', 'network', 'timeout', 'server', 'db_connection', 'duplicate', 'unknown'];
const VALID_SOURCES = ['client', 'server'];

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
      type = '',
      source = '',
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

    if (type && VALID_TYPES.includes(type)) {
      filter.type = type;
    }

    if (source && VALID_SOURCES.includes(source)) {
      filter.source = source;
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
      OrderError.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      OrderError.countDocuments(filter),
      Promise.all(
        VALID_TYPES.map((t) => OrderError.countDocuments({ type: t })),
      ),
    ]);

    const statsObj = {};
    VALID_TYPES.forEach((t, i) => {
      statsObj[`total${t.replace(/_([a-z])/g, (_, c) => c.toUpperCase())}`] = stats[i];
    });

    return res.status(200).json({
      logs,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      stats: statsObj,
    });
  } catch (error) {
    console.error('Order errors fetch error:', error);
    return res.status(500).json({ message: 'Failed to fetch order errors' });
  }
}
