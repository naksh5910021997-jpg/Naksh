import Link from 'next/link';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import ProductGallery from '@/components/products/ProductGallery';
import WhatsAppOrderButton from '../WhatsAppOrderButton';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';

export const dynamic = 'force-dynamic';

// Helper functions for price calculation (same as before)
function getProductPrice(product) {
  if (product.basePrice) return product.basePrice;
  if (product.sizes && product.sizes.length > 0) {
    const prices = product.sizes.filter(size => size.price > 0).map(size => size.price);
    if (prices.length > 0) return Math.min(...prices);
  }
  if (product.price) return product.price;
  return 0;
}

function getComparePrice(product) {
  if (product.sizes && product.sizes.length > 0) {
    const comparePrices = product.sizes.filter(size => size.comparePrice > 0).map(size => size.comparePrice);
    if (comparePrices.length > 0) return Math.min(...comparePrices);
  }
  return product.comparePrice || null;
}

function getPriceRange(product) {
  if (product.basePrice) return `Rs ${product.basePrice}`;
  if (product.sizes && product.sizes.length > 0) {
    const prices = product.sizes.filter(size => size.price > 0).map(size => size.price);
    if (prices.length === 0) return 'Price not set';
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    return minPrice === maxPrice ? `Rs ${minPrice}` : `Rs ${minPrice} - Rs ${maxPrice}`;
  }
  return product.price ? `Rs ${product.price}` : 'Price not set';
}

function isProductOnSale(product) {
  if (product.sizes && product.sizes.length > 0) {
    return product.sizes.some(size => size.onSale);
  }
  return product.onSale || false;
}

async function getProduct(id) {
  try {
    await connectDB();
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    let product;
    if (isObjectId) {
      product = await Product.findById(id).populate('category').lean();
    } else {
      product = await Product.findOne({ slug: id }).populate('category').lean();
    }
    return product ? JSON.parse(JSON.stringify(product)) : null;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return { title: 'Product Not Found' };
  return {
    title: `${product.name} — Naksh Studio`,
    description: product.shortDescription || product.description,
  };
}

export default async function ProductDetailPage({ params }) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return (
       <div className="bg-main-bg min-h-screen flex flex-col justify-center items-center font-sans">
         <h1 className="text-4xl font-black text-text">PIECE NOT FOUND</h1>
         <Link href="/products" className="mt-4 underline text-xs tracking-widest text-text">BACK TO COLLECTION</Link>
       </div>
    );
  }

  const currentPrice = getProductPrice(product);
  const comparePrice = getComparePrice(product);
  const onSale = isProductOnSale(product);

  const discountPercentage = comparePrice && currentPrice
    ? Math.round(((comparePrice - currentPrice) / comparePrice) * 100)
    : 0;

  return (
    <div className="bg-main-bg min-h-screen font-sans">
      <Navbar />

      <main className="container mx-auto pt-20 px-6 py-12">
        {/* Breadcrumb */}
        <nav className="text-[10px] uppercase tracking-[0.2em] font-bold text-text opacity-60 mb-10 flex gap-2">
          <Link href="/" className="hover:opacity-100">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:opacity-100">Products</Link>
          <span>/</span>
          <span className="text-text opacity-100 italic">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-12 gap-16">
          {/* Left: Gallery */}
          <div className="lg:col-span-7">
            <div className="sticky top-28">
               <ProductGallery images={product.images} productName={product.name} />
            </div>
          </div>

          {/* Right: Info */}
          <div className="lg:col-span-5 space-y-10">
            <section>
              <span className="text-[10px] uppercase tracking-[0.3em] font-black text-text opacity-80 mb-2 block">
                {product.brand || 'Naksh Original'}
              </span>
              <h1 className="text-5xl font-black uppercase tracking-tighter leading-none text-text mb-6">
                {product.name}
              </h1>

              {/* Rating */}
              {product.rating > 0 && (
                <div className="flex items-center gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < Math.floor(product.rating) ? "text-yellow-400" : "text-accent-dim"}>★</span>
                  ))}
                  <span className="text-[10px] font-bold text-text opacity-60 ml-2">({product.numReviews} REVIEWS)</span>
                </div>
              )}

              {/* Price Section */}
              <div className="space-y-3">
                {product.sizes && product.sizes.length > 1 ? (
                  <div className="flex items-baseline gap-4">
                    <span className="text-4xl font-black text-text tracking-tighter">
                      {getPriceRange(product)}
                    </span>
                    {comparePrice && (
                      <span className="text-xl text-text opacity-40 line-through font-medium">
                        Rs {comparePrice}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="flex items-baseline gap-4">
                    <span className="text-4xl font-black text-text tracking-tighter">
                      Rs {currentPrice}
                    </span>
                    {comparePrice && (
                      <span className="text-xl text-text opacity-40 line-through font-medium">
                        Rs {comparePrice}
                      </span>
                    )}
                  </div>
                )}

                {/* Badges */}
                <div className="flex gap-2">
                  {discountPercentage > 0 && (
                    <span className="text-[10px] font-black bg-red-50 text-red-500 px-2 py-1 uppercase rounded-sm">
                      -{discountPercentage}% OFF
                    </span>
                  )}
                  {onSale && (
                    <span className="text-[10px] font-black bg-green-50 text-green-600 px-2 py-1 uppercase rounded-sm">
                      ON SALE
                    </span>
                  )}
                  {product.trending && (
                    <span className="text-[10px] font-black bg-red-50 text-red-500 px-2 py-1 uppercase rounded-sm">
                      🔥 TRENDING
                    </span>
                  )}
                </div>

                {product.sizes && product.sizes.length > 0 && (
                  <p className="text-[10px] text-text opacity-60 uppercase tracking-widest">
                    {product.sizes.length} size{product.sizes.length > 1 ? 's' : ''} available
                  </p>
                )}
              </div>
            </section>

            {/* Sizes Section (if available) */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <h3 className="text-[10px] uppercase tracking-widest font-black mb-4 text-text opacity-60">
                  Available Sizes
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {product.sizes.map((size, i) => (
                    <div key={i} className="border border-accent-dim rounded-md p-3 text-center hover:border-text transition-colors">
                      <div className="text-sm font-black text-text uppercase tracking-tight">
                        {size.size}
                      </div>
                      <div className="text-[10px] text-text opacity-60 mt-1">
                        Rs {size.price}
                      </div>
                      {size.stock <= 0 && (
                        <div className="text-[8px] text-red-500 font-bold uppercase tracking-widest mt-1">
                          Out of Stock
                        </div>
                      )}
                      {size.stock > 0 && size.stock <= (product.lowStockThreshold || 5) && (
                        <div className="text-[8px] text-yellow-600 font-bold uppercase tracking-widest mt-1">
                          Low Stock ({size.stock})
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Colors Section */}
            {product.colors?.length > 0 && (
              <div>
                <h3 className="text-[10px] uppercase tracking-widest font-black mb-4 text-text opacity-60">Available Palette</h3>
                <div className="flex gap-4">
                  {product.colors.map((color, i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 rounded-full border border-accent-dim p-0.5 hover:scale-110 transition-all cursor-pointer">
                        <div className="w-full h-full rounded-full" style={{ backgroundColor: color.hexCode }} />
                      </div>
                      <span className="text-[8px] font-bold text-text opacity-60 uppercase tracking-tighter">{color.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Features */}
            {product.features?.length > 0 && (
              <div className="py-6 border-t border-accent-dim">
                <h3 className="text-[10px] uppercase tracking-widest font-black mb-4 text-text opacity-60">Key Attributes</h3>
                <ul className="grid grid-cols-2 gap-y-2">
                  {product.features.map((feature, i) => (
                    <li key={i} className="text-[11px] font-bold text-text opacity-80 flex items-center gap-2">
                      <span className="text-text text-lg">·</span> {feature.toUpperCase()}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* WhatsApp Order Button - Replace AddToCartButton */}
            <WhatsAppOrderButton product={product} />

            {/* Material & Care Card */}
            <div className="bg-card-bg border border-accent-dim rounded-md p-6 space-y-4">
              <div>
                <h3 className="text-[10px] uppercase tracking-widest font-black text-text opacity-60 mb-2">Material Composition</h3>
                <p className="text-xs font-bold text-text">{product.material || 'NOT SPECIFIED'}</p>
              </div>
              {product.careInstructions?.length > 0 && (
                <div>
                  <h3 className="text-[10px] uppercase tracking-widest font-black text-text opacity-60 mb-2">Care Guide</h3>
                  <div className="text-[10px] font-medium text-text opacity-70 space-y-1">
                    {product.careInstructions.map((ins, i) => <p key={i}>• {ins}</p>)}
                  </div>
                </div>
              )}
            </div>

            {/* Specs Table */}
            <div className="pt-6 space-y-3">
               {[
                 { label: 'SKU', value: product.sku },
                 { label: 'Category', value: product.category?.name, link: `/categories/${product.category?.slug}` },
                 { label: 'Origin', value: product.madeIn },
                 { label: 'Type', value: product.productType?.replace('-', ' ') },
                 { label: 'Total Stock', value: product.sizes?.reduce((sum, size) => sum + (size.stock || 0), 0) || product.stock || 0 }
               ].map((spec, i) => spec.value && (
                 <div key={i} className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest py-2 border-b border-accent-dim">
                   <span className="text-text opacity-60">{spec.label}</span>
                   {spec.link ? (
                     <Link href={spec.link} className="text-text hover:underline">{spec.value}</Link>
                   ) : (
                     <span className="text-text">{spec.value}</span>
                   )}
                 </div>
               ))}
            </div>
          </div>
        </div>

        {/* Studio Notes */}
        <div className="mt-32 max-w-4xl mx-auto border-t border-accent-dim pt-20 text-center">
          <h2 className="text-[11px] uppercase font-black tracking-[0.5em] mb-12 text-text opacity-60">Studio Notes & Composition</h2>
          <div className="text-text opacity-80 leading-relaxed font-medium italic text-lg">
             "{product.description}"
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}