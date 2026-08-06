import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import { sendOrderConfirmationSMS } from '@/lib/sms';

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
    await Promise.race([
      connectDB(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('DB connection timeout')), 8000),
      ),
    ]);

    const savedOrder = await Order.create({
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
    });

    // Fire-and-forget background SMS — never blocks or fails the order flow.
    sendOrderConfirmationSMS(savedOrder).catch(() => {});

    console.log(`[ORDER] SUCCESS ${orderId}`);
    return res.status(200).json({
      message: 'Order submitted successfully',
      orderId,
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
