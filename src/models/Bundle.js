import mongoose from 'mongoose';
// Bundles populate their T-shirt and trouser; importing registers the model.
import './Product';

// One size choice inside a combo, e.g. "Small": tee S + trouser 28 for Rs 2500.
// The price is set by the admin and ignores any sale running on the products.
const BundleOptionSchema = new mongoose.Schema({
  label: { type: String, required: true, trim: true, maxlength: 60 },
  tshirtSize: { type: String, required: true },
  trouserSize: { type: String, required: true },
  price: { type: Number, required: true, min: [1, 'Combo price must be more than 0'] },
});

const BundleSchema = new mongoose.Schema({
  title: { type: String, required: [true, 'Please give the combo a title'], trim: true, maxlength: 200 },
  slug: { type: String, required: true, unique: true, lowercase: true },
  description: { type: String, trim: true, maxlength: 5000 },

  tshirt: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: [true, 'Please select a T-shirt'] },
  trouser: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: [true, 'Please select a trouser'] },

  options: {
    type: [BundleOptionSchema],
    validate: [(v) => v.length > 0, 'Add at least one size option'],
  },

  // Optional combo photo; without it the storefront shows both product photos.
  image: {
    url: String,
    publicId: String,
  },

  status: { type: String, enum: ['active', 'draft'], default: 'active' },
  featured: { type: Boolean, default: false },

  // Optional offer window. Outside it the combo is hidden from the shop.
  startsAt: Date,
  endsAt: Date,
}, {
  timestamps: true,
});

BundleSchema.index({ status: 1, featured: 1 });
BundleSchema.index({ tshirt: 1 });
BundleSchema.index({ trouser: 1 });

export default mongoose.models.Bundle || mongoose.model('Bundle', BundleSchema);
