import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import { verifyAdmin } from '@/lib/auth';
import CheckoutSession, { CALL_RESPONSES, FOLLOW_UP_STATUSES } from '@/models/CheckoutSession';

const MAX_ACTIVITY = 50;
const MAX_NOTE = 2000;
// Statuses that carry a callback / expected-order time
const SCHEDULED = ['call_later', 'order_later'];

// Admin follow-up on one abandoned checkout: status, call result, callback
// time and note. Never touches the tracking fields (status, items, …), so the
// abandoned/active/completed lifecycle is unaffected.
export default async function handler(req, res) {
  const admin = verifyAdmin(req);
  if (!admin) return res.status(401).json({ message: 'Unauthorized' });
  const { id } = req.query;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: 'Invalid id' });

  if (req.method === 'GET') {
    try {
      await connectDB();
      const session = await CheckoutSession.findById(id).lean();
      if (!session) return res.status(404).json({ message: 'Abandoned order not found' });
      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).json({ abandonedOrder: session });
    } catch (error) {
      console.error('Abandoned order fetch error:', error);
      return res.status(500).json({ message: 'Failed to fetch' });
    }
  }
  if (req.method !== 'PATCH') return res.status(405).json({ message: 'Method not allowed' });

  const { followUpStatus, callResponse, followUpAt, note } = req.body || {};
  if ([followUpStatus, callResponse, followUpAt, note].every((v) => v === undefined)) {
    return res.status(400).json({ message: 'No fields to update' });
  }
  if (followUpStatus !== undefined && !FOLLOW_UP_STATUSES.includes(followUpStatus)) {
    return res.status(400).json({ message: 'Invalid follow-up status' });
  }
  if (callResponse !== undefined && callResponse !== null && !CALL_RESPONSES.includes(callResponse)) {
    return res.status(400).json({ message: 'Invalid call response' });
  }
  let followUpDate;
  if (followUpAt !== undefined) {
    followUpDate = followUpAt ? new Date(followUpAt) : null;
    if (followUpDate && Number.isNaN(followUpDate.getTime())) {
      return res.status(400).json({ message: 'Invalid follow-up time' });
    }
  }
  if (note !== undefined && typeof note !== 'string') {
    return res.status(400).json({ message: 'Invalid note' });
  }

  const now = new Date();
  const by = admin.email || '';
  const set = { followUpUpdatedAt: now, followUpUpdatedBy: by };
  const activity = [];
  const log = (field, value) => activity.push({ at: now, by, field, value: String(value ?? '') });

  if (followUpStatus !== undefined) {
    set.followUpStatus = followUpStatus;
    log('followUpStatus', followUpStatus);
    // A closed or reset case has nothing scheduled any more
    if (!SCHEDULED.includes(followUpStatus) && followUpAt === undefined) set.followUpAt = null;
  }
  if (callResponse !== undefined) {
    set.callResponse = callResponse || null;
    log('callResponse', callResponse || 'none');
  }
  if (followUpAt !== undefined) {
    set.followUpAt = followUpDate;
    log('followUpAt', followUpDate ? followUpDate.toISOString() : '');
  }
  if (note !== undefined) {
    set.note = note.slice(0, MAX_NOTE);
    log('note', set.note.slice(0, 200));
  }

  try {
    await connectDB();
    const session = await CheckoutSession.findByIdAndUpdate(
      id,
      { $set: set, $push: { activity: { $each: activity, $slice: -MAX_ACTIVITY } } },
      { new: true, lean: true },
    );
    if (!session) return res.status(404).json({ message: 'Abandoned order not found' });
    return res.status(200).json({ abandonedOrder: session });
  } catch (error) {
    console.error('Abandoned follow-up update error:', error);
    return res.status(500).json({ message: 'Failed to update' });
  }
}
