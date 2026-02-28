import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import { verifyAdmin } from '@/lib/auth';

export default async function handler(req, res) {
  const admin = verifyAdmin(req);
  if (!admin) return res.status(401).json({ message: 'Unauthorized' });

  const { id } = req.query;

  if (req.method !== 'PATCH') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { orderStatus, responseStatus } = req.body;

  // Validate at least one field is being updated
  if (orderStatus === undefined && responseStatus === undefined) {
    return res.status(400).json({ message: 'No fields to update' });
  }

  // Validate values
  if (orderStatus !== undefined && !['pending', 'confirmed', 'cancel'].includes(orderStatus)) {
    return res.status(400).json({ message: 'Invalid order status' });
  }

  if (responseStatus !== undefined && !['called', 'number_off', 'did_not_pick', null].includes(responseStatus)) {
    return res.status(400).json({ message: 'Invalid response status' });
  }

  try {
    await connectDB();

    const update = {};
    if (orderStatus !== undefined) update.orderStatus = orderStatus;
    if (responseStatus !== undefined) update.responseStatus = responseStatus || null;

    const order = await Order.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true, lean: true },
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    return res.status(200).json({ order });
  } catch (error) {
    console.error('Order update error:', error);
    return res.status(500).json({ message: 'Failed to update order' });
  }
}
