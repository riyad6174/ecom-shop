import { connectDB } from '@/lib/mongodb';
import { findUsableCoupon } from '@/lib/coupon';
import { normalizeCouponCode } from '@/utils/coupon';

export default async function handler(req, res) {
  // Validity changes (deactivate, usage limit) must never be served from cache
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  if (!normalizeCouponCode(req.query.code)) {
    return res.status(400).json({ valid: false, message: 'Coupon code is required' });
  }

  try {
    await connectDB();

    const { coupon, message } = await findUsableCoupon(req.query.code);
    if (!coupon) {
      return res.status(200).json({ valid: false, message });
    }

    return res.status(200).json({
      valid: true,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minPurchase: coupon.minPurchase,
      message: 'Coupon applied successfully',
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ valid: false, message: 'Server error validating coupon' });
  }
}
