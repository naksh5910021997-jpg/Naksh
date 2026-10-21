// Combo (bundle) price calculations shared by the admin form, the storefront
// and the order API. Works on a bundle whose tshirt/trouser are populated.

import { getEffectiveSizePrice } from '@/lib/pricing';

const findSize = (product, size) => (product?.sizes || []).find((s) => s.size === size);

// Full details for one size option: what the two pieces cost separately right
// now, the combo price, the saving and whether both sizes are in stock.
export function getBundleOptionDetails(bundle, option) {
  const tshirtSize = findSize(bundle.tshirt, option.tshirtSize);
  const trouserSize = findSize(bundle.trouser, option.trouserSize);
  const tshirtPrice = tshirtSize ? getEffectiveSizePrice(tshirtSize) : 0;
  const trouserPrice = trouserSize ? getEffectiveSizePrice(trouserSize) : 0;
  const separatePrice = tshirtPrice + trouserPrice;
  const savings = Math.max(0, separatePrice - option.price);

  return {
    ...option,
    tshirtPrice,
    trouserPrice,
    separatePrice,
    savings,
    savingsPercent: separatePrice > 0 ? Math.round((savings / separatePrice) * 100) : 0,
    // A size removed from the product after the combo was made counts as unavailable.
    inStock: !!(tshirtSize && trouserSize && tshirtSize.stock > 0 && trouserSize.stock > 0),
  };
}

export function getBundleOptions(bundle) {
  return (bundle.options || []).map((option) => getBundleOptionDetails(bundle, option));
}

// Summary for cards: lowest combo price, biggest saving, any option in stock.
export function getBundleSummary(bundle) {
  const options = getBundleOptions(bundle);
  if (options.length === 0) return { fromPrice: 0, maxSavings: 0, maxSavingsPercent: 0, inStock: false, options };
  return {
    fromPrice: Math.min(...options.map((o) => o.price)),
    maxSavings: Math.max(...options.map((o) => o.savings)),
    maxSavingsPercent: Math.max(...options.map((o) => o.savingsPercent)),
    inStock: options.some((o) => o.inStock),
    options,
  };
}

// Live = active, inside its offer dates, and both products still on sale in the shop.
export function isBundleLive(bundle, now = new Date()) {
  if (bundle.status !== 'active') return false;
  if (bundle.startsAt && new Date(bundle.startsAt) > now) return false;
  if (bundle.endsAt && new Date(bundle.endsAt) < now) return false;
  return bundle.tshirt?.status === 'active' && bundle.trouser?.status === 'active';
}

// Images for a combo: its own photo, else the first photo of each product.
export function getBundleImages(bundle) {
  if (bundle.image?.url) return [{ url: bundle.image.url, alt: bundle.title }];
  return [bundle.tshirt, bundle.trouser]
    .filter((p) => p?.images?.[0]?.url)
    .map((p) => ({ url: p.images[0].url, alt: p.name }));
}
