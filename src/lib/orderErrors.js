import { connectDB } from '@/lib/mongodb';
import OrderError from '@/models/OrderError';

export function extractProductNames(itemsStr) {
  try {
    const arr = JSON.parse(itemsStr || '[]');
    const names = arr
      .map((it) => it.title || it.name || 'Item')
      .filter(Boolean);
    return [...new Set(names)].join(', ');
  } catch {
    return '';
  }
}

/**
 * Persist an order error. Never throws — callers must pass fire-and-forget
 * (`.catch(() => {})`) so logging never breaks the order flow.
 */
export async function logOrderError(entry) {
  try {
    await connectDB();
    const {
      type,
      source,
      statusCode,
      message,
      stack,
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
      userAgent,
      url,
    } = entry;

    await OrderError.create({
      type: ['validation', 'network', 'timeout', 'server', 'db_connection', 'duplicate', 'unknown'].includes(type)
        ? type
        : 'unknown',
      source: source === 'client' ? 'client' : 'server',
      statusCode: Number(statusCode) || undefined,
      message: message || 'Unknown error',
      stack,
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
      userAgent: userAgent || '',
      url: url || '',
    });
  } catch (error) {
    console.error('[OrderError] Failed to persist log:', error.message || error);
  }
}
