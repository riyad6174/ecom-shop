import mongoose from 'mongoose';

const orderErrorSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['validation', 'network', 'timeout', 'server', 'db_connection', 'duplicate', 'unknown'],
      default: 'unknown',
    },
    source: { type: String, enum: ['client', 'server'], default: 'server' },
    statusCode: { type: Number },
    message: { type: String },
    stack: { type: String },

    // Customer
    name: { type: String },
    phone: { type: String },
    deliveryZone: { type: String },
    address: { type: String },

    // Order
    orderId: { type: String },
    productNames: { type: String },
    totalPrice: { type: Number },
    shippingCharge: { type: Number },
    grandTotal: { type: Number },
    items: { type: String }, // raw JSON string
    orderDate: { type: String },
    submissionTime: { type: String },

    // Diagnostics
    userAgent: { type: String },
    url: { type: String },
  },
  { timestamps: true },
);

orderErrorSchema.index({ createdAt: -1 });
orderErrorSchema.index({ type: 1 });
orderErrorSchema.index({ source: 1 });
orderErrorSchema.index({ orderId: 1 });

export default mongoose.models.OrderError || mongoose.model('OrderError', orderErrorSchema);
