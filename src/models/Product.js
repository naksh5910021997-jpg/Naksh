import mongoose from 'mongoose';
import { ALL_PRODUCT_TYPES, ALL_SIZES } from '@/lib/product-config';

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a product name'],
    maxlength: [200, 'Name cannot be more than 200 characters'],
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
  },
  shortDescription: {
    type: String,
    maxlength: [500, 'Short description cannot be more than 500 characters'],
  },

  // Base price - minimum price ya starting price
  basePrice: {
    type: Number,
    required: [true, 'Please provide a base price'],
    min: [0, 'Price cannot be negative'],
  },

  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Please select a category'],
  },

  // Top-level garment family keeps shared product data reusable as the catalog grows.
  // The default preserves all products created before this field was introduced.
  garmentType: {
    type: String,
    enum: ['tshirt', 'trouser'],
    required: true,
    default: 'tshirt',
  },

  productType: {
    type: String,
    enum: ALL_PRODUCT_TYPES,
    required: [true, 'Please select a product type'],
  },

  // Updated sizes with individual pricing
  sizes: [{
    size: {
      type: String,
      enum: ALL_SIZES,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative'],
    },
    comparePrice: {
      type: Number,
      min: [0, 'Compare price cannot be negative'],
    },
    salePrice: {
      type: Number,
      min: [0, 'Sale price cannot be negative'],
    },
    onSale: {
      type: Boolean,
      default: false,
    },
    // Size-specific SKU
    sku: {
      type: String,
      sparse: true,
    }
  }],

  colors: [{
    name: {
      type: String,
      required: true,
    },
    hexCode: {
      type: String,
      required: true,
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please provide a valid hex color code'],
    },
    images: [{
      url: String,
      publicId: String,
      alt: String,
    }],
  }],

  images: [{
    url: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
    alt: String,
  }],

  material: {
    type: String,
    required: [true, 'Please specify the material'],
    default: '100% Cotton',
  },
  fabricType: {
    type: String,
    enum: ['cotton', 'polyester', 'blend', 'linen', 'silk', 'other'],
    default: 'cotton',
  },
  gsm: {
    type: Number,
    min: [100, 'GSM should be at least 100'],
    max: [300, 'GSM should not exceed 300'],
  },
  careInstructions: {
    type: [String],
    default: ['Machine wash cold', 'Do not bleach', 'Tumble dry low', 'Iron on low heat'],
  },

  fit: {
    type: String,
    enum: ['slim', 'regular', 'loose', 'oversized', 'athletic'],
    default: 'regular',
  },
  neckline: {
    type: String,
    enum: ['round', 'v-neck', 'polo', 'henley', 'crew'],
  },
  sleeveLength: {
    type: String,
    enum: ['short', 'long', 'sleeveless', '3/4'],
  },
  trouserDetails: {
    rise: {
      type: String,
      enum: ['low', 'mid', 'high'],
    },
    legStyle: {
      type: String,
      enum: ['skinny', 'slim', 'straight', 'tapered', 'wide', 'bootcut'],
    },
    waistType: {
      type: String,
      enum: ['fixed', 'elasticated', 'drawstring', 'adjustable'],
    },
    closure: {
      type: String,
      enum: ['button', 'zip', 'drawstring', 'hook-and-bar', 'elastic'],
    },
    length: {
      type: String,
      enum: ['short', 'regular', 'long'],
    },
    pockets: {
      type: Number,
      min: [0, 'Pockets cannot be negative'],
      default: 2,
    },
  },
  pattern: {
    type: String,
    enum: ['solid', 'striped', 'printed', 'checkered', 'graphic', 'plain'],
    default: 'solid',
  },

  brand: {
    type: String,
    default: 'Naksh',
  },
  madeIn: {
    type: String,
    default: 'India',
  },

  features: [{
    type: String,
  }],

  metaTitle: String,
  metaDescription: String,
  keywords: [String],

  status: {
    type: String,
    enum: ['draft', 'active', 'archived'],
    default: 'active',
  },
  featured: {
    type: Boolean,
    default: false,
  },
  trending: {
    type: Boolean,
    default: false,
  },

  rating: {
    type: Number,
    default: 0,
    min: [0, 'Rating cannot be less than 0'],
    max: [5, 'Rating cannot be more than 5'],
  },
  numReviews: {
    type: Number,
    default: 0,
  },

  // Main product SKU
  productSku: {
    type: String,
    unique: true,
    sparse: true,
  },
  barcode: String,

  weight: {
    value: Number,
    unit: {
      type: String,
      enum: ['g', 'kg'],
      default: 'g',
    },
  },

  // Inventory tracking
  totalStock: {
    type: Number,
    default: 0,
  },
  lowStockThreshold: {
    type: Number,
    default: 5,
  },

}, {
  timestamps: true
});

// Virtual for checking if product is in stock
ProductSchema.virtual('inStock').get(function() {
  return this.totalStock > 0;
});

// Virtual for getting price range
ProductSchema.virtual('priceRange').get(function() {
  if (!this.sizes || this.sizes.length === 0) return null;

  const prices = this.sizes.map(size => size.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  return minPrice === maxPrice ? minPrice : { min: minPrice, max: maxPrice };
});

// Pre-save middleware to calculate total stock
ProductSchema.pre('save', function(next) {
  if (this.sizes && this.sizes.length > 0) {
    this.totalStock = this.sizes.reduce((total, size) => total + size.stock, 0);
  }
  next();
});

// Create indexes for better query performance
ProductSchema.index({ name: 'text', description: 'text' });
ProductSchema.index({ category: 1, status: 1 });
ProductSchema.index({ garmentType: 1, status: 1 });
ProductSchema.index({ 'sizes.price': 1 });
ProductSchema.index({ basePrice: 1 });
ProductSchema.index({ featured: 1, status: 1 });
ProductSchema.index({ trending: 1, status: 1 });

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
