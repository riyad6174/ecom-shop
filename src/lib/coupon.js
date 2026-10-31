import Coupon from '@/models/Coupon';
import { normalizeCouponCode } from '@/utils/coupon';

// Shared by /api/public/coupons/validate and /api/submit.
// Returns { coupon } when usable, otherwise { message }.
export async function findUsableCoupon(rawCode) {
  const code = normalizeCouponCode(rawCode);
  if (!code) return { message: 'Coupon code is required' };

  const coupon = await Coupon.findOne({ code, isActive: true }).lean();
  if (!coupon) return { message: 'Invalid or inactive coupon code' };
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
    return { message: 'Coupon code has expired' };
  }
  if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
    return { message: 'Coupon usage limit reached' };
  }
  return { coupon };
}

// Atomically counts one use; fails if the limit was hit in the meantime.
export async function claimCouponUse(code) {
  const now = new Date();
  const updated = await Coupon.findOneAndUpdate(
    {
      code,
      isActive: true,
      $and: [
        { $or: [{ expiresAt: null }, { expiresAt: { $gte: now } }] },
        { $or: [{ usageLimit: null }, { $expr: { $lt: ['$usedCount', '$usageLimit'] } }] },
      ],
    },
    { $inc: { usedCount: 1 } },
    { new: true, lean: true },
  );
  return Boolean(updated);
}

export async function releaseCouponUse(code) {
  await Coupon.updateOne({ code, usedCount: { $gt: 0 } }, { $inc: { usedCount: -1 } }).catch(() => {});
}
