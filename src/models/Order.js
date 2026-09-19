import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    deliveryZone: { type: String, required: true },
    address: { type: String, required: true },
    items: { type: String, required: true }, // JSON string
    totalPrice: { type: Number, required: true },
    shippingCharge: { type: Number, required: true },
    grandTotal: { type: Number, required: true },
    orderId: { type: String, required: true, unique: true },
    orderDate: { type: String },
    submissionTime: { type: String },
    orderStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'cancel'],
      default: 'pending',
    },
    responseStatus: {
      type: String,
      enum: ['called', 'number_off', 'did_not_pick', 'call_later', 'fake_order', null],
      default: null,
    },
    note: { type: String, default: '' },
    // ── Order attribution / device tracking (all optional → old orders unaffected)
    userAgent: { type: String, default: '' },
    deviceType: { type: String, default: '' }, // Mobile | Desktop | Tablet
    deviceOS: { type: String, default: '' }, // Android | iOS | Windows | macOS | Linux
    browser: { type: String, default: '' }, // Chrome | Safari | Firefox | Edge ...
    landingUrl: { type: String, default: '' },
    pageUrl: { type: String, default: '' },
    referrer: { type: String, default: '' },
    trafficSource: { type: String, default: 'organic' }, // meta | google | tiktok | organic | referral
    utmSource: { type: String, default: '' },
    utmMedium: { type: String, default: '' },
    utmCampaign: { type: String, default: '' },
    firstTouchSource: { type: String, default: '' },
    firstTouchUrl: { type: String, default: '' },
    // Server-computed from phone history: 'new' | 'repeat'
    customerType: { type: String, enum: ['new', 'repeat'], default: 'new' },
    previousOrderCount: { type: Number, default: 0 },
    smsStatus: {
      type: String,
      enum: ['pending', 'sent', 'failed', 'suspicious_skipped', 'dedup_skipped'],
      default: 'pending',
    },
  },
  { timestamps: true },
);

// Index for fast search
orderSchema.index({ name: 'text', phone: 'text', orderId: 'text' });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ responseStatus: 1 });
orderSchema.index({ smsStatus: 1 });
orderSchema.index({ trafficSource: 1 });
orderSchema.index({ customerType: 1 });
orderSchema.index({ phone: 1 });

// If cached model is missing new fields (e.g. after schema change), rebuild it
if (
  mongoose.models.Order &&
  (!mongoose.models.Order.schema.path('note') ||
    !mongoose.models.Order.schema.path('smsStatus') ||
    !mongoose.models.Order.schema.path('trafficSource') ||
    !mongoose.models.Order.schema.path('customerType'))
) {
  delete mongoose.models.Order;
}

export default mongoose.models.Order || mongoose.model('Order', orderSchema);
