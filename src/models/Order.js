import mongoose from 'mongoose';

export const ORDER_STATUSES = ['pending', 'confirmed', 'delivered', 'cancelled'];

const OrderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name: { type: String, required: true },
  sku: String,
  category: String,
  size: String,
  color: String,
  price: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 1 },
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  // Short human-friendly reference, also sent in the WhatsApp message so the
  // admin can match a chat to its order (e.g. NK-7K2QX9).
  orderRef: { type: String, required: true, unique: true, uppercase: true, trim: true },

  items: { type: [OrderItemSchema], required: true },
  subtotal: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'PKR' },

  status: { type: String, enum: ORDER_STATUSES, default: 'pending' },
  confirmedAt: Date,
  deliveredAt: Date,
  cancelledAt: Date,

  // Filled in by the admin from the WhatsApp chat when confirming.
  customer: {
    name: { type: String, trim: true, maxlength: 100 },
    phone: { type: String, trim: true, maxlength: 30 },
    address: { type: String, trim: true, maxlength: 500 },
    city: { type: String, trim: true, maxlength: 100 },
  },
  notes: { type: String, trim: true, maxlength: 2000 },

  // Where the visitor came from - used for ad attribution and Meta Conversions API.
  tracking: {
    fbp: String,
    fbc: String,
    fbclid: String,
    utmSource: String,
    utmMedium: String,
    utmCampaign: String,
    utmContent: String,
    utmTerm: String,
    landingPage: String,
    referrer: String,
    pageUrl: String,
    ip: String,
    userAgent: String,
  },

  // Shared with the browser pixel event so Meta can deduplicate browser + server events.
  eventId: { type: String, required: true },

  // Result of each server-side Meta event, e.g. { lead: { sentAt }, purchase: { error } }.
  metaEvents: {
    lead: { sentAt: Date, skipped: Boolean, error: String },
    purchase: { sentAt: Date, skipped: Boolean, error: String },
  },
}, {
  timestamps: true,
});

OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ createdAt: -1 });

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
