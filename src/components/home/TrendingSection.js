// components/home/TrendingSection.jsx
'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function TrendingSection({ products }) {
  if (!products || products.length === 0) return null;

  return (
    <section className="py-20 bg-main-bg">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-[10px] uppercase tracking-[0.5em] font-black text-text opacity-60 mb-4 block">
            What's Hot Right Now
          </span>
          <h2 className="text-5xl font-black uppercase tracking-tighter text-text mb-4">
            Trending
          </h2>
          <p className="text-text opacity-60 max-w-md mx-auto">
            Most loved pieces by our community this week
          </p>
        </div>

        {/* Featured Product + Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Large Featured Product */}
          <div className="lg:col-span-6">
            <TrendingFeaturedCard product={products[0]} />
          </div>

          {/* Smaller Products Grid */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            {products.slice(1, 5).map((product) => (
              <TrendingSmallCard key={product._id} product={product} />
            ))}
          </div>
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link
            href="/products?sortBy=trending"
            className="inline-block bg-text text-card-bg px-8 py-4 text-[11px] uppercase font-black tracking-[0.3em] hover:opacity-80 transition-opacity rounded-sm"
          >
            Explore Trending
          </Link>
        </div>
      </div>
    </section>
  );
}

// Large Featured Card
function TrendingFeaturedCard({ product }) {
  return (
    <Link href={`/products/${product.slug || product._id}`} className="group block">
      <div className="relative overflow-hidden bg-card-bg border border-accent-dim rounded-lg group-hover:border-text transition-all duration-500 h-full">

        <div className="relative aspect-[4/5] overflow-hidden">
          {product.images && product.images.length > 0 ? (
            <Image
              src={product.images[0].url}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          ) : (
            <div className="w-full h-full bg-accent-dim flex items-center justify-center">
              <span className="text-text opacity-40">No Image</span>
            </div>
          )}

          {/* Trending Badge */}
          <div className="absolute top-4 left-4">
            <span className="bg-red-500 text-white text-[10px] uppercase font-bold px-3 py-1.5 tracking-tighter rounded-sm">
              🔥 Trending #1
            </span>
          </div>

          {/* Product Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
            <h3 className="text-xl font-black uppercase tracking-tight text-white mb-2">
              {product.name}
            </h3>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-black text-white">Rs {product.price}</span>
              {product.comparePrice && (
                <span className="text-lg text-white/60 line-through">Rs {product.comparePrice}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

// Small Card
function TrendingSmallCard({ product }) {
  return (
    <Link href={`/products/${product.slug || product._id}`} className="group block">
      <div className="relative overflow-hidden bg-card-bg border border-accent-dim rounded-md group-hover:border-text transition-all duration-500">

        <div className="relative aspect-square overflow-hidden">
          {product.images && product.images.length > 0 ? (
            <Image
              src={product.images[0].url}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
              sizes="(max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="w-full h-full bg-accent-dim" />
          )}
        </div>

        <div className="p-3">
          <h4 className="text-xs font-bold uppercase tracking-tight text-text mb-1 line-clamp-1">
            {product.name}
          </h4>
          <span className="text-sm font-black text-text">Rs {product.price}</span>
        </div>
      </div>
    </Link>
  );
}