import { cache } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Script from 'next/script';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import ProductGallery from '@/components/products/ProductGallery';
import BundlePurchasePanel from '@/components/bundles/BundlePurchasePanel';
import { getLiveBundleBySlug } from '@/lib/bundles';
import { getBundleImages, getBundleSummary } from '@/lib/bundle-pricing';
import { SITE_URL } from '@/lib/seo';

export const dynamic = 'force-dynamic';

// Shared by generateMetadata and the page so the combo is fetched once.
const getBundle = cache((slug) => getLiveBundleBySlug(slug));

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const bundle = await getBundle(slug);
  if (!bundle) notFound();

  const { maxSavings } = getBundleSummary(bundle);
  const description = bundle.description
    || `${bundle.tshirt.name} + ${bundle.trouser.name} combo${maxSavings > 0 ? ` — save up to Rs ${maxSavings}` : ''}.`;
  const image = getBundleImages(bundle)[0]?.url;

  return {
    title: bundle.title,
    description,
    alternates: { canonical: `/bundles/${bundle.slug}` },
    openGraph: {
      title: bundle.title,
      description,
      url: `/bundles/${bundle.slug}`,
      images: image ? [{ url: image, alt: bundle.title }] : undefined,
    },
  };
}

export default async function BundleDetailPage({ params }) {
  const { slug } = await params;
  const bundle = await getBundle(slug);
  if (!bundle) notFound();

  // Combo photo first, then every photo of both products.
  const gallery = [
    ...(bundle.image?.url ? [{ url: bundle.image.url, alt: bundle.title }] : []),
    ...(bundle.tshirt.images || []),
    ...(bundle.trouser.images || []),
  ];
  const { fromPrice, inStock } = getBundleSummary(bundle);
  const path = `/bundles/${bundle.slug}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: bundle.title,
    description: bundle.description || `${bundle.tshirt.name} + ${bundle.trouser.name}`,
    image: gallery.map((img) => img.url),
    brand: { '@type': 'Brand', name: 'Naksh Shop' },
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}${path}`,
      priceCurrency: 'PKR',
      price: fromPrice,
      availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      ...(bundle.endsAt && { priceValidUntil: bundle.endsAt.slice(0, 10) }),
    },
  };

  return (
    <div className="bg-main-bg min-h-screen font-sans">
      <Script id="ld-bundle" type="application/ld+json">{JSON.stringify(jsonLd)}</Script>
      <Navbar />

      <main className="container mx-auto px-6 py-12">
        <nav className="text-[10px] uppercase tracking-[0.2em] font-bold text-text opacity-60 mb-10 flex gap-2">
          <Link href="/" className="hover:opacity-100">Home</Link>
          <span>/</span>
          <Link href="/bundles" className="hover:opacity-100">Combos</Link>
          <span>/</span>
          <span className="text-text opacity-100 italic">{bundle.title}</span>
        </nav>

        <div className="grid lg:grid-cols-12 gap-16">
          <div className="lg:col-span-7">
            <div className="sticky top-28">
              <ProductGallery images={gallery} productName={bundle.title} />
            </div>
          </div>

          <div className="lg:col-span-5 space-y-10">
            <section>
              <span className="text-[10px] uppercase tracking-[0.3em] font-black text-text opacity-80 mb-2 block">
                Combo Deal • T-Shirt + Trouser
              </span>
              <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none text-text mb-6">
                {bundle.title}
              </h1>
              {bundle.endsAt && (
                <p className="text-[10px] uppercase tracking-widest font-bold text-red-500">
                  Offer ends {new Date(bundle.endsAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              )}
            </section>

            <BundlePurchasePanel bundle={bundle} />

            {/* What's in the set */}
            <div className="py-6 border-t border-accent-dim space-y-4">
              <h3 className="text-[10px] uppercase tracking-widest font-black text-text opacity-60">What&apos;s in the set</h3>
              {[bundle.tshirt, bundle.trouser].map((product) => (
                <Link key={product._id} href={`/products/${product.slug || product._id}`} className="flex items-center gap-4 group">
                  <div className="relative w-16 h-20 shrink-0 bg-card-bg border border-accent-dim rounded-sm overflow-hidden">
                    {product.images?.[0]?.url && (
                      <Image src={product.images[0].url} alt={product.name} fill className="object-cover" sizes="64px" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-tight text-text group-hover:underline">{product.name}</p>
                    <p className="text-[10px] uppercase tracking-widest text-text opacity-60">
                      {product.garmentType === 'trouser' ? 'Trouser' : 'T-Shirt'} • View details
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {bundle.description && (
          <div className="mt-32 max-w-4xl mx-auto border-t border-accent-dim pt-20 text-center">
            <h2 className="text-[11px] uppercase font-black tracking-[0.5em] mb-12 text-text opacity-60">About This Combo</h2>
            <div className="text-text opacity-80 leading-relaxed font-medium text-lg whitespace-pre-line">
              {bundle.description}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
