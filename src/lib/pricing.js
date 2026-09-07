// Centralized price/sale calculation.
//
// The real selling price and sale price live per-size (product.sizes[].price /
// salePrice / onSale). `basePrice` and the legacy top-level `price`/`comparePrice`
// fields are only fallbacks for products that were created without size-level
// pricing - they must never take priority over size data.

export function getEffectiveSizePrice(size) {
  return size.onSale && size.salePrice > 0 ? size.salePrice : size.price;
}

export function getEffectiveSizeComparePrice(size) {
  if (size.onSale && size.salePrice > 0) {
    return size.comparePrice > 0 ? size.comparePrice : size.price;
  }
  return size.comparePrice > 0 ? size.comparePrice : null;
}

export function getProductPrice(product) {
  if (product.sizes && product.sizes.length > 0) {
    const prices = product.sizes.filter(size => size.price > 0).map(getEffectiveSizePrice);
    if (prices.length > 0) return Math.min(...prices);
  }
  if (product.basePrice) return product.basePrice;
  if (product.price) return product.price;
  return 0;
}

export function getComparePrice(product) {
  if (product.sizes && product.sizes.length > 0) {
    const onSaleSizes = product.sizes.filter(size => size.onSale && size.salePrice > 0);
    if (onSaleSizes.length > 0) {
      const compareValues = onSaleSizes.map(size => (size.comparePrice > 0 ? size.comparePrice : size.price));
      return Math.min(...compareValues);
    }
    const comparePrices = product.sizes.filter(size => size.comparePrice > 0).map(size => size.comparePrice);
    if (comparePrices.length > 0) return Math.min(...comparePrices);
  }
  return product.comparePrice || null;
}

export function getPriceRange(product) {
  if (product.sizes && product.sizes.length > 0) {
    const prices = product.sizes.filter(size => size.price > 0).map(getEffectiveSizePrice);
    if (prices.length === 0) return 'Price not set';
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    return minPrice === maxPrice ? `Rs ${minPrice}` : `Rs ${minPrice} - Rs ${maxPrice}`;
  }
  if (product.basePrice) return `Rs ${product.basePrice}`;
  return product.price ? `Rs ${product.price}` : 'Price not set';
}

export function isProductOnSale(product) {
  if (product.sizes && product.sizes.length > 0) {
    return product.sizes.some(size => size.onSale && size.salePrice > 0);
  }
  return product.onSale || false;
}

export function getDiscountPercentage(currentPrice, comparePrice) {
  return comparePrice && currentPrice
    ? Math.round(((comparePrice - currentPrice) / comparePrice) * 100)
    : 0;
}
