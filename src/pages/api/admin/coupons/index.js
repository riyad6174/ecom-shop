import { connectDB } from '@/lib/mongodb';
import Coupon from '@/models/Coupon';
import { verifyAdmin } from '@/lib/auth';

export default async function handler(req, res) {
  const admin = verifyAdmin(req);
  if (!admin) return res.status(401).json({ message: 'Unauthorized' });

  try {
    await connectDB();

    if (req.method === 'GET') {
      const coupons = await Coupon.find({}).sort({ createdAt: -1 }).lean();
      return res.status(200).json({ coupons });
    }

    if (req.method === 'POST') {
      const {
        code,
        discountType,
        discountValue,
        minPurchase,
        usageLimit,
        isActive,
        expiresAt,
      } = req.body;

      if (!code) {
        return res.status(400).json({ message: 'Coupon code is required' });
      }
      if (!discountType || !['percentage', 'fixed', 'free_shipping'].includes(discountType)) {
        return res.status(400).json({ message: 'Invalid discount type' });
      }
      if (discountValue == null || discountValue < 0) {
        return res.status(400).json({ message: 'Discount value is required' });
      }
      if (discountType !== 'free_shipping' && discountValue === 0) {
        return res.status(400).json({ message: 'Discount value must be greater than 0' });
      }

      const normalizedCode = String(code).trim().toUpperCase();

      const existing = await Coupon.findOne({ code: normalizedCode });
      if (existing) {
        return res.status(409).json({ message: 'Coupon code already exists' });
      }

      const coupon = await Coupon.create({
        code: normalizedCode,
        discountType,
        discountValue: Number(discountValue),
        minPurchase: minPurchase ? Number(minPurchase) : 0,
        usageLimit: usageLimit ? Number(usageLimit) : null,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      });

      return res.status(201).json({ coupon });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Coupon code already exists' });
    }
    return res.status(500).json({ message: err.message || 'Server error' });
  }
}
