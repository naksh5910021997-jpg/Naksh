// Server-side combo (bundle) queries for storefront pages.

import connectDB from '@/lib/mongodb';
import Bundle from '@/models/Bundle';
import { isBundleLive } from '@/lib/bundle-pricing';

const PRODUCT_FIELDS = 'name slug images sizes status garmentType sizeType category';

const serialize = (value) => JSON.parse(JSON.stringify(value));

function populated(query) {
  return query
    .populate({ path: 'tshirt', select: PRODUCT_FIELDS, populate: { path: 'category', select: 'name' } })
    .populate({ path: 'trouser', select: PRODUCT_FIELDS, populate: { path: 'category', select: 'name' } })
    .lean();
}

// Live combos, newest first. `filter` narrows the query (e.g. { featured: true }).
export async function getLiveBundles(filter = {}, limit = 50) {
  await connectDB();
  const bundles = await populated(Bundle.find({ status: 'active', ...filter }).sort({ createdAt: -1 }).limit(limit));
  return serialize(bundles.filter((b) => isBundleLive(b)));
}

// Live combos that include the given product, for the "complete the set" box.
export async function getLiveBundlesForProduct(productId) {
  return getLiveBundles({ $or: [{ tshirt: productId }, { trouser: productId }] }, 6);
}

// A single combo by slug, or null if it doesn't exist or isn't live.
export async function getLiveBundleBySlug(slug) {
  await connectDB();
  const bundle = await populated(Bundle.findOne({ slug }));
  return bundle && isBundleLive(bundle) ? serialize(bundle) : null;
}
