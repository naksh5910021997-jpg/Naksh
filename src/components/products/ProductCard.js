'use client';

import Link from 'next/link';
import Image from 'next/image';

// Helper functions for price calculation
function getProductPrice(product) {
  // First try basePrice
  if (product.basePrice) {
    return product.basePrice;
  }

  // Then try sizes pricing
  if (product.sizes && product.sizes.length > 0) {
    const prices = product.sizes
      .filter(size => size.price > 0)
      .map(size => size.price);

    if (prices.length > 0) {
      return Math.min(...prices); // Return minimum price
    }
  }

  // Fallback to old price field (if exists)
  if (product.price) {
    return product.price;
  }

  return 0;
}

function getComparePrice(product) {
  // Check if any size has comparePrice
  if (product.sizes && product.sizes.length > 0) {
    const comparePrices = product.sizes
      .filter(size => size.comparePrice > 0)
      .map(size => size.comparePrice);

    if (comparePrices.length > 0) {
      return Math.min(...comparePrices);
    }
  }

  // Fallback to old comparePrice field
  return product.comparePrice || null;
}

function isProductOnSale(product) {
  // Check if any size is on sale
  if (product.sizes && product.sizes.length > 0) {
    return product.sizes.some(size => size.onSale);
  }

  // Fallback to old onSale field
  return product.onSale || false;
}

function getPriceRange(product) {
  // If basePrice exists, show that
  if (product.basePrice) {
    return `Rs ${product.basePrice}`;
  }

  // Calculate price range from sizes
  if (product.sizes && product.sizes.length > 0) {
    const prices = product.sizes
      .filter(size => size.price > 0)
      .map(size => size.price);

    if (prices.length === 0) return 'Price not set';

    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    return minPrice === maxPrice
      ? `Rs ${minPrice}`
      : `Rs ${minPrice} - Rs ${maxPrice}`;
  }

  // Fallback
  return product.price ? `Rs ${product.price}` : 'Price not set';
}

export default function ProductCard({ product }) {
  const currentPrice = getProductPrice(product);
  const comparePrice = getComparePrice(product);
  const onSale = isProductOnSale(product);

  const discountPercentage = comparePrice && currentPrice
    ? Math.round(((comparePrice - currentPrice) / comparePrice) * 100)
    : 0;

  return (
    <Link href={`/products/${product.slug || product._id}`} className="group block bg-card-bg font-sans">
      <div className="relative overflow-hidden border border-accent-dim group-hover:border-text transition-colors duration-500 rounded-md">

        {/* Product Image */}
        <div className="relative aspect-[3/4] overflow-hidden bg-main-bg">
          {product.images && product.images.length > 0 ? (
            <Image
              src={product.images[0].url}
              alt={product.name}
              fill
              className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-in-out"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[10px] uppercase tracking-widest text-text opacity-60">
              No Image
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
            {product.featured && (
              <span className="bg-text text-card-bg text-[8px] uppercase font-bold px-2 py-1 tracking-tighter rounded-sm">
                Featured
              </span>
            )}
            {product.trending && (
              <span className="bg-red-500 text-white text-[8px] uppercase font-bold px-2 py-1 tracking-tighter rounded-sm">
                Trending
              </span>
            )}
            {onSale && (
              <span className="bg-green-500 text-white text-[8px] uppercase font-bold px-2 py-1 tracking-tighter rounded-sm">
                Sale
              </span>
            )}
            {discountPercentage  && (
              <span className="bg-card-bg text-text border border-text text-[20px] uppercase font-bold px-2 py-1 tracking-tighter rounded-sm">
                {discountPercentage}%
              </span>
            )}
          </div>

          {/* Quick View Overlay */}
          <div className="absolute bottom-0 left-0 w-full bg-text text-card-bg py-3 text-[10px] uppercase font-bold tracking-[0.2em] text-center translate-y-full group-hover:translate-y-0 transition-transform duration-500">
            View Details
          </div>
        </div>

        {/* Product Info */}
        <div className="py-5 px-1">
          <div className="flex justify-between items-start mb-1">
            {/* Category */}
            {product.category && (
              <p className="text-[10px] text-text opacity-60 uppercase tracking-widest font-medium">
                {product.category.name}
              </p>
            )}

            {/* Rating */}
            {product.rating > 0 && (
              <div className="flex items-center text-[10px] text-text font-bold tracking-tighter">
                ★ {product.rating}
              </div>
            )}
          </div>

          {/* Product Name */}
          <h3 className="text-sm font-bold uppercase tracking-tight mb-3 line-clamp-1 group-hover:underline underline-offset-4 decoration-1 text-text">
            {product.name}
          </h3>

          {/* Price */}
          <div className="flex items-center gap-3">
            {/* Show price range if multiple sizes, otherwise single price */}
            {product.sizes && product.sizes.length > 1 ? (
              <span className="text-sm font-black text-text">
                {getPriceRange(product)}
              </span>
            ) : (
              <span className="text-sm font-black text-text">
                Rs {currentPrice}
              </span>
            )}

            {comparePrice && (
              <span className="text-xs text-text opacity-40 line-through font-light">
                Rs {comparePrice}
              </span>
            )}
              {/* Discount Percentage */}

          </div>

          {/* Size indicator */}
          {product.sizes && product.sizes.length > 0 && (
            <p className="text-[9px] text-text opacity-60 uppercase tracking-widest mt-1">
              {product.sizes.length} size{product.sizes.length > 1 ? 's' : ''} available
            </p>
          )}

          {/* Color Indicators */}
          {product.colors && product.colors.length > 0 && (
            <div className="flex gap-1.5 mt-4">
              {product.colors.slice(0, 4).map((color, index) => (
                <div
                  key={index}
                  className="w-3 h-3 border border-accent-dim transition-transform group-hover:scale-110 rounded-sm"
                  style={{ backgroundColor: color.hexCode }}
                  title={color.name}
                ></div>
              ))}
              {product.colors.length > 4 && (
                <span className="text-[9px] text-text opacity-60 font-mono">
                  +{product.colors.length - 4}
                </span>
              )}
            </div>
          )}

          {/* Stock indicator */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="mt-2">
              {(() => {
                const totalStock = product.sizes.reduce((sum, size) => sum + (size.stock || 0), 0);
                if (totalStock === 0) {
                  return (
                    <span className="text-[9px] text-red-500 uppercase tracking-widest font-bold">
                      Out of Stock
                    </span>
                  );
                } else if (totalStock <= (product.lowStockThreshold || 5)) {
                  return (
                    <span className="text-[9px] text-yellow-600 uppercase tracking-widest font-bold">
                      Low Stock
                    </span>
                  );
                }
                return null;
              })()}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}