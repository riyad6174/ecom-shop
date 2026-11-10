import { connectDB } from '@/lib/mongodb';
import { verifyAdmin } from '@/lib/auth';
import CheckoutSession from '@/models/CheckoutSession';
import Order from '@/models/Order';
import { countNewAbandoned, phoneVariants, sweepIfDue, toLocalPhone } from '@/lib/abandonedCheckout';

export default async function handler(req, res) {
  if (!verifyAdmin(req)) return res.status(401).json({ message: 'Unauthorized' });
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' });

  try {
    await connectDB();
    await sweepIfDue();
    // Taken after the sweep: everything in this response was detected by now
    const serverTime = new Date();

    const { page = 1, limit = 30, search = '', from = '', to = '' } = req.query;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 30));

    // Only abandoned sessions — completed ones can never appear here
    const filter = { status: 'abandoned' };
    if (search.trim()) {
      const regex = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ name: regex }, { phone: regex }, { phoneLocal: regex }, { address: regex }, { 'items.title': regex }];
    }
    if (from || to) {
      filter.abandonedAt = {};
      // YYYY-MM-DD = a Bangladesh calendar day (UTC+6), not a UTC day
      const isDay = (v) => /^\d{4}-\d{2}-\d{2}$/.test(v);
      if (from) filter.abandonedAt.$gte = isDay(from) ? new Date(`${from}T00:00:00+06:00`) : new Date(from);
      if (to) {
        filter.abandonedAt.$lte = isDay(to) ? new Date(`${to}T23:59:59.999+06:00`) : new Date(to);
      }
    }

    // Today's start in Bangladesh time (UTC+6), same as the orders API
    const BD_OFFSET_MS = 6 * 60 * 60 * 1000;
    const nowBD = new Date(Date.now() + BD_OFFSET_MS);
    const todayStartUTC = new Date(
      Date.UTC(nowBD.getUTCFullYear(), nowBD.getUTCMonth(), nowBD.getUTCDate()) - BD_OFFSET_MS,
    );

    const [sessions, total, today, globalTotal, newCount] = await Promise.all([
      CheckoutSession.find(filter)
        .sort({ abandonedAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      CheckoutSession.countDocuments(filter),
      CheckoutSession.countDocuments({ status: 'abandoned', abandonedAt: { $gte: todayStartUTC } }),
      CheckoutSession.countDocuments({ status: 'abandoned' }),
      countNewAbandoned(),
    ]);

    // Informational only (records are never merged): flag customers who
    // placed an order later from another checkout session.
    const variants = [...new Set(sessions.flatMap((s) => phoneVariants(s.phoneLocal)))];
    const laterOrders = variants.length
      ? await Order.find({ phone: { $in: variants } }).select('phone orderId createdAt').sort({ createdAt: 1 }).lean()
      : [];
    const abandonedOrders = sessions.map((s) => {
      const later = laterOrders.find(
        (o) => toLocalPhone(o.phone) === s.phoneLocal && o.createdAt >= s.createdAt,
      );
      return { ...s, laterOrderId: later?.orderId || '' };
    });

    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({
      abandonedOrders,
      total,
      page: pageNum,
      totalPages: Math.max(1, Math.ceil(total / limitNum)),
      stats: { today, total: globalTotal, new: newCount },
      serverTime: serverTime.toISOString(),
    });
  } catch (error) {
    console.error('Abandoned orders fetch error:', error);
    return res.status(500).json({ message: 'Failed to fetch abandoned orders' });
  }
}
