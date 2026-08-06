import mongoose from 'mongoose';

const smsLogSchema = new mongoose.Schema(
  {
    name: { type: String },
    phone: { type: String }, // normalized international (8801XXXXXXXX)
    orderId: { type: String },
    productNames: { type: String }, // comma-joined product titles
    orderValue: { type: Number }, // grandTotal
    message: { type: String }, // full message body sent
    status: {
      type: String,
      enum: ['sent', 'failed', 'suspicious_skipped', 'dedup_skipped'],
      default: 'sent',
    },
    apiCode: { type: Number }, // BulkSMSBD response_code (202) or custom (-1 error, 0 skipped)
    apiMessage: { type: String }, // provider message / error text
    reason: { type: String }, // optional human note
    sentDate: { type: String }, // Bangladesh date YYYY-MM-DD (for dedup query)
  },
  { timestamps: true },
);

// Dedup lookup: one sent SMS per phone per BD day
smsLogSchema.index({ phone: 1, sentDate: 1 });
smsLogSchema.index({ createdAt: -1 });

export default mongoose.models.SmsLog || mongoose.model('SmsLog', smsLogSchema);
