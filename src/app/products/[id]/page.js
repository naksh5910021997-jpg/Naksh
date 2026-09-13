import Link from 'next/link';
import Script from 'next/script';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import ProductGallery from '@/components/products/ProductGallery';
import ProductPurchasePanel from '@/components/products/ProductPurchasePanel';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { SITE_URL } from '@/lib/seo';
import { getProductPrice, getComparePrice } from '@/lib/pricing';

export const dynamic = 'force-dynamic';

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

  const description = product.metaDescription || product.shortDescription || product.description;
  const path = `/products/${product.slug || product._id}`;
  const image = product.images?.[0]?.url;

  return {
    title: product.metaTitle || product.name,
    description,
    keywords: product.keywords?.length
      ? product.keywords
      : [product.name, product.category?.name, 'Naksh Studio', 'Karachi', 'Pakistan'].filter(Boolean),
    alternates: { canonical: path },
    openGraph: {
      title: product.name,
      description,
      url: path,
      images: image ? [{ url: image, alt: product.name }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description,
      images: image ? [image] : undefined,
    },
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
// console.log('Product data:', product); // Debugging line to check the product data
  const price = getProductPrice(product);
  const totalStock = product.sizes?.length
    ? product.sizes.reduce((sum, size) => sum + (size.stock || 0), 0)
    : (product.totalStock || 0);
  const productPath = `/products/${product.slug || product._id}`;

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.shortDescription || product.description,
    image: product.images?.map((img) => img.url),
    sku: product.productSku || product.sku,
    brand: { '@type': 'Brand', name: product.brand || 'Naksh Studio' },
    category: product.category?.name,
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}${productPath}`,
      priceCurrency: 'PKR',
      price,
      availability: totalStock > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
    ...(product.rating > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.rating,
        reviewCount: product.numReviews || 1,
      },
    }),
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Products', item: `${SITE_URL}/products` },
      { '@type': 'ListItem', position: 3, name: product.name, item: `${SITE_URL}${productPath}` },
    ],
  };

  return (
    <div className="bg-main-bg min-h-screen font-sans">
      <Script id="ld-product" type="application/ld+json">
        {JSON.stringify(productJsonLd)}
      </Script>
      <Script id="ld-breadcrumb" type="application/ld+json">
        {JSON.stringify(breadcrumbJsonLd)}
      </Script>
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

            </section>

            {/* Price, Size/Color Selection, Quantity & Order */}
            <ProductPurchasePanel product={product} />

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
                 { label: 'SKU', value: product.productSku || product.sku },
                 { label: 'Garment', value: product.garmentType === 'trouser' ? 'Trouser' : 'T-Shirt' },
                 { label: 'Category', value: product.category?.name, link: `/categories/${product.category?.slug}` },
                 { label: 'Origin', value: product.madeIn },
                 { label: 'Type', value: product.productType?.replace('-', ' ') },
                 ...(product.garmentType === 'trouser' ? [
                   { label: 'Rise', value: product.trouserDetails?.rise },
                   { label: 'Leg Style', value: product.trouserDetails?.legStyle },
                   { label: 'Waist', value: product.trouserDetails?.waistType },
                   { label: 'Closure', value: product.trouserDetails?.closure },
                   { label: 'Length', value: product.trouserDetails?.length },
                   { label: 'Pockets', value: product.trouserDetails?.pockets },
                 ] : [
                   { label: 'Neckline', value: product.neckline },
                   { label: 'Sleeve', value: product.sleeveLength },
                 ]),
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
