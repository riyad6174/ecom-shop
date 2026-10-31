// Shared coupon pricing — used by the landing page, the OrderDialog and
// /api/submit so the customer sees exactly what the server will save.

export const COUPON_TYPES = ['percentage', 'fixed', 'free_shipping'];

export const normalizeCouponCode = (raw) => {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (typeof value !== 'string') return '';
  return value.trim().toUpperCase();
};

const lineTotal = (item) => Number(item?.price || 0) * Number(item?.quantity || 1);

/**
 * @param {Object}   args
 * @param {Array}    args.items          cart items ({ id, price, quantity })
 * @param {number}   args.shippingCharge delivery charge before the coupon
 * @param {Object}   [args.coupon]       { code, discountType, discountValue, minPurchase, productId? }
 *                                       productId limits a product discount to that product's items.
 */
export function calculateCouponPricing({ items = [], shippingCharge = 0, coupon = null }) {
  const subtotal = items.reduce((sum, item) => sum + lineTotal(item), 0);
  const shipping = Number(shippingCharge) || 0;
  const result = {
    subtotal,
    discount: 0,
    shipping,
    savings: 0,
    grandTotal: subtotal + shipping,
    applied: false,
    error: null,
  };

  if (!coupon || !coupon.code || !COUPON_TYPES.includes(coupon.discountType)) return result;

  const eligibleItems = coupon.productId
    ? items.filter((item) => String(item?.id) === String(coupon.productId))
    : items;
  const eligibleSubtotal = eligibleItems.reduce((sum, item) => sum + lineTotal(item), 0);

  if (eligibleSubtotal <= 0) {
    result.error = 'এই কুপনটি কার্টের পণ্যের জন্য প্রযোজ্য নয়';
    return result;
  }

  const minPurchase = Number(coupon.minPurchase || 0);
  if (minPurchase > 0 && eligibleSubtotal < minPurchase) {
    result.error = `সর্বনিম্ন ৳${minPurchase} কেনাকাটায় কুপনটি প্রযোজ্য`;
    return result;
  }

  const value = Number(coupon.discountValue || 0);
  if (coupon.discountType === 'percentage') {
    result.discount = Math.round(eligibleSubtotal * (Math.min(value, 100) / 100));
  } else if (coupon.discountType === 'fixed') {
    result.discount = Math.round(Math.min(value, eligibleSubtotal));
  } else {
    result.shipping = 0;
  }

  result.savings = result.discount + (shipping - result.shipping);
  result.grandTotal = Math.max(0, subtotal - result.discount) + result.shipping;
  result.applied = true;
  return result;
}

// Must match the delivery-zone options in OrderDialog.
export const shippingChargeForZone = (zone) => (zone === 'ঢাকার ভেতরে' ? 60 : 120);
