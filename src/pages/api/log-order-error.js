import { connectDB } from '@/lib/mongodb';
import OrderError from '@/models/OrderError';
import { extractProductNames } from '@/lib/orderErrors';

const VALID_TYPES = ['validation', 'network', 'timeout', 'server', 'db_connection', 'duplicate', 'unknown'];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const body = req.body || {};
  const {
    type = 'unknown',
    statusCode,
    message,
    name,
    phone,
    deliveryZone,
    address,
    orderId,
    items,
    totalPrice,
    shippingCharge,
    grandTotal,
    orderDate,
    submissionTime,
    url,
  } = body;

  const errorType = VALID_TYPES.includes(type) ? type : 'unknown';
  const code = Number(statusCode) || undefined;
  const userAgent = req.headers['user-agent'] || '';

  try {
    await connectDB();

    // Client dedup: one row per orderId for client-reported errors.
    await OrderError.findOneAndUpdate(
      { orderId: orderId || '', source: 'client' },
      {
        type: errorType,
        source: 'client',
        statusCode: code,
        message: message || 'Unknown error',
        name: name || '',
        phone: phone || '',
        deliveryZone: deliveryZone || '',
        address: address || '',
        orderId: orderId || '',
        productNames: extractProductNames(items),
        totalPrice: Number(totalPrice) || 0,
        shippingCharge: Number(shippingCharge) || 0,
        grandTotal: Number(grandTotal) || 0,
        items: typeof items === 'string' ? items : JSON.stringify(items || ''),
        orderDate: orderDate || '',
        submissionTime: submissionTime || '',
        userAgent,
        url: url || '',
      },
      { upsert: true, new: true },
    );

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('[log-order-error] Failed:', error.message || error);
    // Never fail the client order flow because logging broke.
    return res.status(200).json({ ok: true });
  }
}
