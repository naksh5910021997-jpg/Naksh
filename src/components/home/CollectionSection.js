// components/home/CollectionSection.jsx
'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function CollectionSection({ title, subtitle, products, viewAllLink, featured = false }) {
  if (!products || products.length === 0) return null;

  return (
    <section className={`py-20 ${featured ? 'bg-card-bg' : 'bg-main-bg'}`}>
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <h2 className="text-4xl font-black uppercase tracking-tighter text-text mb-2">
              {title}
            </h2>
            {subtitle && (
              <p className="text-text opacity-60 text-sm uppercase tracking-widest">
                {subtitle}
              </p>
            )}
          </div>

          {viewAllLink && (
            <Link
              href={viewAllLink}
              className="text-[10px] uppercase tracking-[0.3em] font-black text-text hover:opacity-60 transition-opacity mt-4 md:mt-0"
            >
              View All Collection →
            </Link>
          )}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.slice(0, 4).map((product) => (
            <CollectionCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

// Collection Card Component
function CollectionCard({ product }) {
  const discountPercentage = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  return (
    <Link href={`/products/${product.slug || product._id}`} className="group block">
      <div className="relative overflow-hidden bg-card-bg border border-accent-dim rounded-md group-hover:border-text transition-all duration-500">

        {/* Product Image */}
        <div className="relative aspect-[3/4] overflow-hidden">
          {product.images && product.images.length > 0 ? (
            <Image
              src={product.images[0].url}
              alt={product.name}
              fill
              className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[10px] uppercase tracking-widest text-text opacity-40">
              No Image
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 right-3 flex flex-col gap-1">
            {product.featured && (
              <span className="bg-text text-card-bg text-[8px] uppercase font-bold px-2 py-1 tracking-tighter rounded-sm">
                New
              </span>
            )}
            {discountPercentage > 0 && (
              <span className="bg-red-500 text-white text-[8px] uppercase font-bold px-2 py-1 tracking-tighter rounded-sm">
                -{discountPercentage}%
              </span>
            )}
          </div>

          {/* Quick View */}
          <div className="absolute bottom-0 left-0 w-full bg-text text-card-bg py-3 text-[10px] uppercase font-bold tracking-[0.2em] text-center translate-y-full group-hover:translate-y-0 transition-transform duration-500">
            Quick View
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h3 className="text-sm font-bold uppercase tracking-tight mb-2 text-text group-hover:opacity-80 transition-opacity">
            {product.name}
          </h3>

          <div className="flex items-center gap-3">
            <span className="text-lg font-black text-text">Rs {product.price}</span>
            {product.comparePrice && (
              <span className="text-sm text-text opacity-40 line-through">Rs {product.comparePrice}</span>
            )}
          </div>

          {/* Color Dots */}
          {product.colors && product.colors.length > 0 && (
            <div className="flex gap-1.5 mt-3">
              {product.colors.slice(0, 3).map((color, index) => (
                <div
                  key={index}
                  className="w-3 h-3 border border-accent-dim rounded-full"
                  style={{ backgroundColor: color.hexCode }}
                  title={color.name}
                />
              ))}
              {product.colors.length > 3 && (
                <span className="text-[9px] text-text opacity-60 font-mono ml-1">
                  +{product.colors.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}