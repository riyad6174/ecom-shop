import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import { fetchCourierHistory, normalizePhoneForQC, emptyFraudCheck } from '@/lib/fraudChecker';
import { findUsableCoupon, claimCouponUse, releaseCouponUse } from '@/lib/coupon';
import { calculateCouponPricing, normalizeCouponCode, shippingChargeForZone, COUPON_TYPES } from '@/utils/coupon';

export default async function handler(req, res) {
  // HEAD: pre-warm the DB connection when the order dialog opens
  if (req.method === 'HEAD') {
    await connectDB().catch(() => {});
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const {
    name,
    phone,
    deliveryZone,
    address,
    items,
    totalPrice,
    shippingCharge,
    grandTotal,
    orderId,
    orderDate,
    submissionTime,
    // ── Attribution / device meta (optional — old clients don't send these)
    userAgent,
    deviceType,
    deviceOS,
    browser,
    landingUrl,
    pageUrl,
    referrer,
    trafficSource,
    utmSource,
    utmMedium,
    utmCampaign,
    firstTouchSource,
    firstTouchUrl,
    // ── Promo coupon (optional)
    couponCode,
    couponProductId,
    couponDiscount,
    couponSavings,
    couponType,
  } = req.body;

  console.log(`[ORDER] Attempt ${orderId} — ${name} — ${phone} — ৳${grandTotal}`);

  if (!name || !phone || !deliveryZone || !address) {
    console.warn(`[ORDER] Missing fields for ${orderId}`);
    return res.status(400).json({ message: 'Missing required fields' });
  }

  if (!orderId) {
    return res.status(400).json({ message: 'Order ID is required' });
  }

  let claimedCoupon = null;
  try {
    // Connection is cached and reused, so this is fast after the first call.
    await connectDB();

    // ── Promo coupon: re-validated and re-priced here, never trusted from
    // the client. Without a coupon the client totals are saved as before.
    let totals = {
      totalPrice: Number(totalPrice) || 0,
      shippingCharge: Number(shippingCharge) || 0,
      grandTotal: Number(grandTotal) || 0,
    };
    let couponFields = { couponCode: '', couponDiscount: 0, couponSavings: 0, couponType: '' };
    const requestedCoupon = normalizeCouponCode(couponCode);
    if (requestedCoupon) {
      const couponInvalid = (reason) => {
        console.warn(`[ORDER] Coupon ${requestedCoupon} rejected for ${orderId}: ${reason}`);
        return res.status(400).json({
          code: 'COUPON_INVALID',
          message: 'দুঃখিত, কুপনটি এখন আর প্রযোজ্য নয়। নতুন মূল্য দেখে আবার অর্ডার করুন।',
        });
      };

      try {
        // A retry of an order that was already saved must still get its 409,
        // even if that first save used up the coupon's last slot.
        if (await Order.exists({ orderId })) {
          return res.status(409).json({ message: 'Duplicate order ID. Please try again.' });
        }

        const { coupon, message } = await findUsableCoupon(requestedCoupon);
        if (!coupon) return couponInvalid(message);

        let parsedItems = [];
        try {
          parsedItems = typeof items === 'string' ? JSON.parse(items) : items || [];
        } catch {
          parsedItems = [];
        }
        const pricing = calculateCouponPricing({
          items: parsedItems,
          shippingCharge: shippingChargeForZone(deliveryZone),
          coupon: { ...coupon, productId: couponProductId || null },
        });
        if (!pricing.applied) return couponInvalid(pricing.error);

        if (!(await claimCouponUse(coupon.code))) return couponInvalid('usage limit reached');
        claimedCoupon = coupon.code;

        totals = {
          totalPrice: pricing.subtotal,
          shippingCharge: pricing.shipping,
          grandTotal: pricing.grandTotal,
        };
        couponFields = {
          couponCode: coupon.code,
          couponDiscount: pricing.discount,
          couponSavings: pricing.savings,
          couponType: coupon.discountType,
        };
      } catch (couponErr) {
        // Never lose an order because the coupon check itself failed:
        // save it with the price the customer was shown and flag it in logs.
        console.error(`[ORDER] Coupon check failed for ${orderId}, saving client totals:`, couponErr?.message || couponErr);
        couponFields = {
          couponCode: requestedCoupon,
          couponDiscount: Number(couponDiscount) || 0,
          couponSavings: Number(couponSavings) || 0,
          couponType: COUPON_TYPES.includes(couponType) ? couponType : '',
        };
      }
    }

    // Authoritative repeat-customer check by phone number.
    // Normalise to digits-only so "+8801..." and "01..." match each other.
    const phoneDigits = String(phone || '').replace(/\D/g, '');
    // Local 11-digit form ("01XXXXXXXXX") used to build variants.
    let localDigits = phoneDigits;
    if (localDigits.startsWith('880')) localDigits = `0${localDigits.slice(3)}`;
    const phoneVariants = phoneDigits
      ? [
          ...new Set(
            [String(phone), phoneDigits, localDigits, `880${localDigits.slice(1)}`].filter(Boolean),
          ),
        ]
      : [String(phone)];
    const previousOrderCount = await Order.countDocuments({
      phone: { $in: phoneVariants },
    });
    const customerType = previousOrderCount > 0 ? 'repeat' : 'new';

    // Save FIRST so the order can never be lost because of a slow/failing
    // vendor lookup. Duplicate orderIds (client retry) hit the unique index
    // here and return 409 before any vendor call is spent.
    const doc = await Order.create({
      name,
      phone,
      deliveryZone,
      address,
      items: typeof items === 'string' ? items : JSON.stringify(items),
      ...totals,
      orderId,
      orderDate: orderDate || new Date().toISOString(),
      submissionTime:
        submissionTime ||
        new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }),
      userAgent: String(userAgent || '').slice(0, 500),
      deviceType: String(deviceType || ''),
      deviceOS: String(deviceOS || ''),
      browser: String(browser || ''),
      landingUrl: String(landingUrl || '').slice(0, 1000),
      pageUrl: String(pageUrl || '').slice(0, 1000),
      referrer: String(referrer || '').slice(0, 1000),
      trafficSource: String(trafficSource || 'organic').slice(0, 50),
      utmSource: String(utmSource || '').slice(0, 200),
      utmMedium: String(utmMedium || '').slice(0, 200),
      utmCampaign: String(utmCampaign || '').slice(0, 200),
      firstTouchSource: String(firstTouchSource || '').slice(0, 50),
      firstTouchUrl: String(firstTouchUrl || '').slice(0, 1000),
      customerType,
      previousOrderCount,
      ...couponFields,
      fraudCheck: emptyFraudCheck(),
      qcStatus: 'pending',
      qcCheckedAt: null,
      qcRetryCount: 0,
    });

    // ── FraudChecker courier history (guarded, hard timeout inside helper).
    // Runs AFTER the save: any vendor failure only affects the QC fields and
    // is retried later by /api/cron/backfill-qc — never by the client.
    let qcStatus = 'pending';
    try {
      const qcData = await fetchCourierHistory(phone);
      if (qcData) {
        qcStatus = 'ok';
        await Order.updateOne(
          { _id: doc._id },
          {
            $set: {
              fraudCheck: qcData,
              qcStatus: 'ok',
              qcCheckedAt: new Date(),
            },
          },
        ).catch((e) => console.warn(`[ORDER] QC update failed for ${orderId}:`, e?.message || e));
      } else {
        qcStatus = normalizePhoneForQC(phone) ? 'failed' : 'skipped';
        await Order.updateOne(
          { _id: doc._id },
          { $set: { qcStatus, qcCheckedAt: new Date() } },
        ).catch(() => {});
      }
    } catch (qcErr) {
      console.warn(`[ORDER] QC guard caught for ${orderId}:`, qcErr?.message || qcErr);
      qcStatus = normalizePhoneForQC(phone) ? 'failed' : 'skipped';
      await Order.updateOne(
        { _id: doc._id },
        { $set: { qcStatus, qcCheckedAt: new Date() } },
      ).catch(() => {});
    }

    // Order saved. SMS is sent later by the background cron job — the order
    // response is never delayed by SMS work. The QC lookup above is bounded
    // by a short timeout; its failures are retried by /api/cron/backfill-qc,
    // never by the client.
    console.log(`[ORDER] SUCCESS ${orderId} (${customerType}, ${trafficSource || 'organic'}, qc=${qcStatus})`);
    return res.status(200).json({
      message: 'Order submitted successfully',
      orderId,
      ...totals,
      ...couponFields,
      customerType,
      previousOrderCount,
    });
  } catch (error) {
    console.error(`[ORDER] FAIL ${orderId}:`, error.message || error);
    // The order was not saved, so give the coupon use back.
    if (claimedCoupon) await releaseCouponUse(claimedCoupon);

    if (error.code === 11000) {
      return res
        .status(409)
        .json({ message: 'Duplicate order ID. Please try again.' });
    }

    return res
      .status(500)
      .json({ message: 'Failed to submit order. Please try again.' });
  }
}
