import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import { fetchCourierHistory, normalizePhoneForQC, emptyFraudCheck } from '@/lib/fraudChecker';

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
  } = req.body;

  console.log(`[ORDER] Attempt ${orderId} — ${name} — ${phone} — ৳${grandTotal}`);

  if (!name || !phone || !deliveryZone || !address) {
    console.warn(`[ORDER] Missing fields for ${orderId}`);
    return res.status(400).json({ message: 'Missing required fields' });
  }

  if (!orderId) {
    return res.status(400).json({ message: 'Order ID is required' });
  }

  try {
    // Connection is cached and reused, so this is fast after the first call.
    await connectDB();

    // Authoritative repeat-customer check by phone number.
    // Normalise to digits-only so "+8801..." and "01..." match each other.
    const phoneDigits = String(phone || '').replace(/\D/g, '');
    const phoneVariants = phoneDigits
      ? [
          ...new Set([
            String(phone),
            phoneDigits,
            phoneDigits.startsWith('880') ? phoneDigits.slice(3) : `880${phoneDigits}`,
          ]),
        ]
      : [String(phone)];
    const previousOrderCount = await Order.countDocuments({
      phone: { $in: phoneVariants },
    });
    const customerType = previousOrderCount > 0 ? 'repeat' : 'new';

    // ── FraudChecker courier history (non-blocking by design).
    // Runs BEFORE the response but inside its own guarded call: the helper
    // never throws and has a hard timeout, so any vendor failure simply
    // yields null and the order below still saves. No after-response work
    // (unreliable on Vercel serverless).
    let fraudCheck = emptyFraudCheck();
    let qcStatus = 'pending';
    try {
      const qcData = await fetchCourierHistory(phone);
      if (qcData) {
        fraudCheck = qcData;
        qcStatus = 'ok';
      } else {
        qcStatus = normalizePhoneForQC(phone) ? 'failed' : 'skipped';
      }
    } catch (qcErr) {
      console.warn(`[ORDER] QC guard caught for ${orderId}:`, qcErr?.message || qcErr);
      qcStatus = normalizePhoneForQC(phone) ? 'failed' : 'skipped';
    }

    await Order.create({
      name,
      phone,
      deliveryZone,
      address,
      items: typeof items === 'string' ? items : JSON.stringify(items),
      totalPrice: Number(totalPrice) || 0,
      shippingCharge: Number(shippingCharge) || 0,
      grandTotal: Number(grandTotal) || 0,
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
      fraudCheck,
      qcStatus,
      qcCheckedAt: new Date(),
      qcRetryCount: 0,
    });

    // Order saved. SMS is sent later by the background cron job — the order
    // response returns immediately and is never delayed by SMS work.
    // (QC failures are retried by /api/cron/backfill-qc, never by the client.)
    console.log(`[ORDER] SUCCESS ${orderId} (${customerType}, ${trafficSource || 'organic'}, qc=${qcStatus})`);
    return res.status(200).json({
      message: 'Order submitted successfully',
      orderId,
      customerType,
      previousOrderCount,
    });
  } catch (error) {
    console.error(`[ORDER] FAIL ${orderId}:`, error.message || error);

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
