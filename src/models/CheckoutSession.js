import mongoose from 'mongoose';

// One document per checkout attempt (identified by a client-generated
// sessionId). Created once the customer enters a valid phone number and
// updated in place as the form is filled in.
//
// Lifecycle:
//   active    → customer is (or recently was) filling the form
//   abandoned → no activity for ABANDON_AFTER_MS (set by the backend sweep)
//   completed → the order was placed. Final: nothing moves it out again.
const itemSchema = new mongoose.Schema(
  {
    id: { type: String, default: '' },
    title: { type: String, default: '' },
    variant: { type: String, default: '' },
    price: { type: Number, default: 0 },
    quantity: { type: Number, default: 1 },
    image: { type: String, default: '' },
  },
  { _id: false },
);

const checkoutSessionSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ['active', 'abandoned', 'completed'],
      default: 'active',
    },

    // ── Customer
    name: { type: String, default: '' },
    phone: { type: String, default: '' }, // as entered, e.g. +8801XXXXXXXXX
    phoneLocal: { type: String, default: '' }, // normalised 01XXXXXXXXX
    deliveryZone: { type: String, default: '' },
    address: { type: String, default: '' },

    // ── Order details
    items: { type: [itemSchema], default: [] },
    totalPrice: { type: Number, default: 0 },
    shippingCharge: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 },
    couponCode: { type: String, default: '' },

    // ── Attribution
    pageUrl: { type: String, default: '' },
    trafficSource: { type: String, default: '' },
    deviceType: { type: String, default: '' },

    // ── Timing
    lastActivityAt: { type: Date, default: Date.now },
    abandonedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    orderId: { type: String, default: '' }, // set when completed

    // false until an admin has seen this abandoned order on
    // /admin/abandoned-orders. Drives the sidebar "new" counter.
    seenByAdmin: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// Sweep: find active sessions whose last activity is older than the cutoff
checkoutSessionSchema.index({ status: 1, lastActivityAt: 1 });
// Admin list (newest abandoned first) and unread counter
checkoutSessionSchema.index({ status: 1, abandonedAt: -1 });
checkoutSessionSchema.index({ status: 1, seenByAdmin: 1 });
checkoutSessionSchema.index({ phoneLocal: 1 });
// Completed sessions are only tracking data — drop them after 30 days.
// Abandoned/active sessions have completedAt = null and never expire.
checkoutSessionSchema.index({ completedAt: 1 }, { expireAfterSeconds: 30 * 24 * 3600 });

export default mongoose.models.CheckoutSession ||
  mongoose.model('CheckoutSession', checkoutSessionSchema);
