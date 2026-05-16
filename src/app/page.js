import Link from 'next/link';
import Navbar from '@/components/ui/Navbar';
import ProductCard from '@/components/products/ProductCard';
import Footer from '@/components/ui/Footer';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

async function getHomeData() {
  try {
    await connectDB();

    // Multiple collections in one query for better performance
    const [featuredProducts, newProducts, trendingProducts, categories] = await Promise.all([
      Product.find({ featured: true, status: 'active' }).limit(8).lean(),
      Product.find({ status: 'active' }).sort({ createdAt: -1 }).limit(8).lean(),
      // FIXED: Proper trending logic using your schema fields
      getTrendingProducts(),
      Category.find().sort({ name: 1 }).lean()
    ]);

    return {
      featuredProducts: JSON.parse(JSON.stringify(featuredProducts)),
      newProducts: JSON.parse(JSON.stringify(newProducts)),
      trendingProducts: JSON.parse(JSON.stringify(trendingProducts)),
      categories: JSON.parse(JSON.stringify(categories)),
    };
  } catch (error) {
    console.error('Build Data Error:', error);
    return { featuredProducts: [], newProducts: [], trendingProducts: [], categories: [] };
  }
}

// Home page mein getTrendingProducts function ko replace karo:

async function getTrendingProducts() {
  let trending = [];

  // 1. Products marked as trending
  const trendingMarked = await Product.find({
    status: 'active',
    trending: true
  })
  .sort({ rating: -1, createdAt: -1 })
  .limit(6)
  .lean();

  trending = [...trendingMarked];
  // 2. If not enough, add high-rated products (4+ rating)
  if (trending.length < 6) {
    const highRated = await Product.find({
      status: 'active',
      rating: { $gte: 4 },
      _id: { $nin: trending.map(p => p._id) }
    })
    .sort({ rating: -1, numReviews: -1 })
    .limit(6 - trending.length)
    .lean();

    trending = [...trending, ...highRated];
  }

  // 3. If still not enough, add featured products
  if (trending.length < 6) {
    const featured = await Product.find({
      status: 'active',
      featured: true,
      _id: { $nin: trending.map(p => p._id) }
    })
    .sort({ createdAt: -1 })
    .limit(6 - trending.length)
    .lean();

    trending = [...trending, ...featured];
  }

  // 4. If still not enough, add on-sale products
  if (trending.length < 6) {
    const onSale = await Product.find({
      status: 'active',
      onSale: true,
      _id: { $nin: trending.map(p => p._id) }
    })
    .sort({ createdAt: -1 })
    .limit(6 - trending.length)
    .lean();

    trending = [...trending, ...onSale];
  }

  // 5. Fill remaining with any recent products
  if (trending.length < 6) {
    const recent = await Product.find({
      status: 'active',
      _id: { $nin: trending.map(p => p._id) }
    })
    .sort({ createdAt: -1 })
    .limit(6 - trending.length)
    .lean();

    trending = [...trending, ...recent];
  }

  return trending;
}

export default async function HomePage() {
  const { featuredProducts, newProducts, trendingProducts, categories } = await getHomeData();

  return (
    <div className="bg-main-bg min-h-screen font-sans">
      <Navbar />

      {/* HERO SECTION */}
      <section className="bg-card-bg pt-16 pb-24 border-b border-accent-dim">
        <div className="container mx-auto px-4 mt-10 text-center">
          <div className="inline-block px-3 py-1 border border-text text-[10px] uppercase tracking-[0.3em] font-bold mb-8 rounded-sm">
            Est... 2026
          </div>
          <h1 className="text-7xl md:text-9xl font-black uppercase tracking-tighter leading-[0.8] mb-10 text-text">
            Naksh <br />
            <span className="text-outline-md text-transparent">Studio</span>
          </h1>
          <p className="max-w-xl mx-auto text-text text-sm md:text-base font-medium leading-relaxed mb-12 opacity-70">
            Focusing on form and function. Our essential collection features heavy-weight fabrics and oversized silhouettes.
          </p>
          <div className="flex justify-center border border-text max-w-fit mx-auto overflow-hidden rounded-sm">
            <Link href="/products" className="bg-text text-card-bg px-12 py-5 text-xs uppercase font-bold tracking-widest hover:opacity-80 transition-all border-r border-text">
              Shop All
            </Link>
            <Link href="/categories" className="bg-card-bg text-text px-12 py-5 text-xs uppercase font-bold tracking-widest hover:bg-text hover:text-card-bg transition-all">
              Catalog
            </Link>
          </div>
        </div>
      </section>

      {/* NEW ARRIVALS SECTION */}
      {newProducts.length > 0 && (
        <section className="py-20 bg-main-bg">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-4 mb-12">
              <h2 className="text-xs uppercase font-black tracking-[0.4em] text-text">Latest</h2>
              <div className="h-[1px] flex-grow bg-accent-dim"></div>
              <span className="text-[10px] font-mono text-text opacity-60">02 — NEW ARRIVALS</span>
            </div>

            <div className="flex justify-between items-end mb-8">
              <h3 className="text-4xl font-black uppercase tracking-tighter text-text">Fresh<br/>Drops</h3>
              <Link href="/products?sortBy=createdAt&sortOrder=desc" className="text-[10px] uppercase font-bold tracking-widest border-b border-text pb-1 text-text hover:opacity-60 transition-opacity">
                View All New
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-12">
              {newProducts.slice(0, 4).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* TRENDING SECTION */}
      {trendingProducts.length > 0 && (
        <section className="py-20 bg-card-bg">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <span className="text-[10px] uppercase tracking-[0.5em] font-black text-text opacity-60 mb-4 block">
                What's Hot Right Now
              </span>
              <h2 className="text-5xl font-black uppercase tracking-tighter text-text mb-4">
                Hot Picks
              </h2>
              <p className="text-text opacity-60 max-w-md mx-auto">
                Our trending pieces and community favorites
              </p>
            </div>

            {/* Featured + Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
              {/* Large Featured */}
              <div className="lg:col-span-6">
                <Link href={`/products/${trendingProducts[0].slug || trendingProducts[0]._id}`} className="group block">
                  <div className="relative overflow-hidden bg-main-bg border border-accent-dim rounded-md group-hover:border-text transition-all duration-500 aspect-[4/5]">
                    {trendingProducts[0].images && trendingProducts[0].images.length > 0 ? (
                      <Image
                        src={trendingProducts[0].images[0].url}
                        alt={trendingProducts[0].name}
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
                        🔥 Hot Pick #1
                      </span>
                    </div>

                    {/* Product Info Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                      <h3 className="text-xl font-black uppercase tracking-tight text-white mb-2">
                        {trendingProducts[0].name}
                      </h3>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-black text-white">Rs {trendingProducts[0].price}</span>
                        {trendingProducts[0].comparePrice && (
                          <span className="text-lg text-white/60 line-through">Rs {trendingProducts[0].comparePrice}</span>
                        )}
                      </div>

                      {/* Rating if available */}
                      {trendingProducts[0].rating > 0 && (
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={i < Math.floor(trendingProducts[0].rating) ? 'text-yellow-400' : 'text-white/30'}>
                                ★
                              </span>
                            ))}
                          </div>
                          <span className="text-white/80 text-sm">({trendingProducts[0].numReviews})</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              </div>

              {/* Small Grid */}
              <div className="lg:col-span-6 grid grid-cols-2 gap-4">
                {trendingProducts.slice(1, 5).map((product, index) => (
                  <Link key={product._id} href={`/products/${product.slug || product._id}`} className="group block">
                    <div className="relative overflow-hidden bg-main-bg border border-accent-dim rounded-md group-hover:border-text transition-all duration-500 aspect-square">
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

                      <div className="absolute top-2 right-2">
                        <span className="bg-text text-card-bg text-[8px] uppercase font-bold px-2 py-1 tracking-tighter rounded-sm">
                          #{index + 2}
                        </span>
                      </div>

                      {/* Special badges */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        {product.trending && (
                          <span className="bg-red-500 text-white text-[8px] uppercase font-bold px-2 py-1 tracking-tighter rounded-sm">
                            Trending
                          </span>
                        )}
                        {product.onSale && (
                          <span className="bg-green-500 text-white text-[8px] uppercase font-bold px-2 py-1 tracking-tighter rounded-sm">
                            Sale
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-3">
                      <h4 className="text-xs font-bold uppercase tracking-tight text-text mb-1 line-clamp-1">
                        {product.name}
                      </h4>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-text">Rs {product.price}</span>
                        {product.comparePrice && (
                          <span className="text-xs text-text opacity-40 line-through">Rs {product.comparePrice}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="text-center">
              <Link
                href="/products?trending=true"
                className="inline-block bg-text text-card-bg px-8 py-4 text-[11px] uppercase font-black tracking-[0.3em] hover:opacity-80 transition-opacity rounded-sm"
              >
                Explore Hot Picks
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CATEGORIES */}
      {categories.length > 0 && (
        <section className="py-20 bg-main-bg">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-4 mb-12">
              <h2 className="text-xs uppercase font-black tracking-[0.4em] text-text">Index</h2>
              <div className="h-[1px] flex-grow bg-accent-dim"></div>
              <span className="text-[10px] font-mono text-text opacity-60">03 — CATEGORIES</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
              {categories.map((category, index) => (
                <Link key={category._id} href={`/categories/${category.slug}`}
                      className="group relative bg-card-bg aspect-[4/3] flex flex-col justify-end p-8 border border-accent-dim hover:border-text transition-all duration-500 rounded-md">
                  <span className="text-[10px] font-mono mb-2 text-text opacity-60 group-hover:opacity-100">/ 0{index + 1}</span>
                  <h3 className="text-2xl font-bold uppercase tracking-tight text-text group-hover:pl-4 transition-all duration-500">{category.name}</h3>
                  <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M4 16L16 4M16 4H7M16 4V13" stroke="currentColor" strokeWidth="2" className="text-text"/>
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FEATURED PRODUCTS */}
      {featuredProducts.length > 0 && (
        <section className="py-24 border-t border-accent-dim bg-card-bg">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-4 mb-12">
              <h2 className="text-xs uppercase font-black tracking-[0.4em] text-text">Curated</h2>
              <div className="h-[1px] flex-grow bg-accent-dim"></div>
              <span className="text-[10px] font-mono text-text opacity-60">04 — FEATURED</span>
            </div>

            <div className="flex justify-between items-end mb-16">
              <h2 className="text-5xl font-black uppercase tracking-tighter text-text">Editor's<br/>Choice</h2>
              <Link href="/products?featured=true" className="text-[10px] uppercase font-bold tracking-widest border-b border-text pb-1 mb-2 text-text hover:opacity-60 transition-opacity">
                All Featured
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-12">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* BRAND PROMISE */}
      <section className="py-32 bg-text text-card-bg overflow-hidden relative">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-20">
            <div className="space-y-4">
              <span className="text-[10px] font-mono opacity-60 tracking-widest italic">Quality</span>
              <h3 className="text-xl font-bold uppercase tracking-widest">Premium Cotton</h3>
              <p className="opacity-70 text-sm font-light">Ethically sourced, long-staple fibers for a garment that lasts decades, not seasons.</p>
            </div>
            <div className="space-y-4">
              <span className="text-[10px] font-mono opacity-60 tracking-widest italic">Shipping</span>
              <h3 className="text-xl font-bold uppercase tracking-widest">Fast Logistics</h3>
              <p className="opacity-70 text-sm font-light">Global reach with carbon-neutral shipping options. From our studio to your door in 48h.</p>
            </div>
            <div className="space-y-4">
              <span className="text-[10px] font-mono opacity-60 tracking-widest italic">Ethos</span>
              <h3 className="text-xl font-bold uppercase tracking-widest">Transparent</h3>
              <p className="opacity-70 text-sm font-light">No hidden markups. We believe in high-quality essentials at an honest price point.</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}