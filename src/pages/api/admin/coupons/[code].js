import { connectDB } from '@/lib/mongodb';
import Coupon from '@/models/Coupon';
import { verifyAdmin } from '@/lib/auth';

export default async function handler(req, res) {
  const admin = verifyAdmin(req);
  if (!admin) return res.status(401).json({ message: 'Unauthorized' });

  const { code } = req.query;
  const couponCode = Array.isArray(code) ? code[0] : code;

  if (!couponCode) {
    return res.status(400).json({ message: 'Coupon code is required' });
  }

  try {
    await connectDB();

    if (req.method === 'GET') {
      const coupon = await Coupon.findOne({ code: String(couponCode).toUpperCase() }).lean();
      if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
      return res.status(200).json({ coupon });
    }

    if (req.method === 'PATCH') {
      const { discountType, discountValue, minPurchase, usageLimit, isActive, expiresAt } = req.body;
      const update = {};
      if (discountType !== undefined) {
        if (!['percentage', 'fixed', 'free_shipping'].includes(discountType)) {
          return res.status(400).json({ message: 'Invalid discount type' });
        }
        update.discountType = discountType;
      }
      if (discountValue !== undefined) {
        if (discountValue < 0) return res.status(400).json({ message: 'Discount value must be >= 0' });
        update.discountValue = Number(discountValue);
      }
      if (minPurchase !== undefined) update.minPurchase = Number(minPurchase);
      if (usageLimit !== undefined) update.usageLimit = usageLimit ? Number(usageLimit) : null;
      if (isActive !== undefined) update.isActive = Boolean(isActive);
      if (expiresAt !== undefined) update.expiresAt = expiresAt ? new Date(expiresAt) : null;

      const coupon = await Coupon.findOneAndUpdate(
        { code: String(couponCode).toUpperCase() },
        { $set: update },
        { new: true, lean: true },
      );
      if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
      return res.status(200).json({ coupon });
    }

    if (req.method === 'DELETE') {
      const result = await Coupon.deleteOne({ code: String(couponCode).toUpperCase() });
      if (result.deletedCount === 0) return res.status(404).json({ message: 'Coupon not found' });
      return res.status(200).json({ message: 'Coupon deleted' });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message || 'Server error' });
  }
}
