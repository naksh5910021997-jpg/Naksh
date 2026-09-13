import Link from 'next/link';
import Script from 'next/script';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import { SITE_URL } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Our Story',
  description:
    'Naksh Studio is a premium clothing brand based in Karachi, Pakistan, focused on heavy-weight t-shirts and trousers built for everyday wear.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'Our Story — Naksh Studio',
    description: 'Naksh Studio is a premium clothing brand based in Karachi, Pakistan.',
    url: '/about',
  },
};

const aboutJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  url: `${SITE_URL}/about`,
  mainEntity: {
    '@type': 'ClothingStore',
    name: 'Naksh Studio',
    description:
      'Naksh Studio is a Karachi, Pakistan based clothing brand designing premium, heavy-weight t-shirts and trousers. Orders are placed online and confirmed via WhatsApp, with delivery across Karachi.',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Karachi',
      addressRegion: 'Sindh',
      addressCountry: 'PK',
    },
  },
};

const values = [
  {
    title: 'Premium Cotton',
    detail: 'Ethically sourced, long-staple fibers for a garment that lasts decades, not seasons.',
  },
  {
    title: 'Karachi Made, Karachi Delivered',
    detail: 'Every order is packed and dispatched from Karachi, with same-city delivery and WhatsApp order confirmation.',
  },
  {
    title: 'Transparent Pricing',
    detail: 'No hidden markups. We believe in high-quality essentials at an honest price point.',
  },
];

export default function AboutPage() {
  return (
    <div className="bg-main-bg min-h-screen font-sans">
      <Script id="ld-about" type="application/ld+json">
        {JSON.stringify(aboutJsonLd)}
      </Script>
      <Navbar />

      <main className="container mx-auto px-6 pt-32 pb-24 max-w-4xl">
        <nav className="text-[10px] uppercase tracking-[0.2em] font-bold text-text opacity-60 mb-10 flex gap-2">
          <Link href="/" className="hover:opacity-100">Home</Link>
          <span>/</span>
          <span className="text-text opacity-100 italic">Our Story</span>
        </nav>

        <header className="mb-16">
          <span className="text-[10px] uppercase tracking-[0.3em] font-black text-text opacity-60 mb-3 block">
            Naksh Studio
          </span>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none text-text mb-6">
            Our Story
          </h1>
          <p className="text-text opacity-70 text-sm md:text-base leading-relaxed max-w-2xl font-medium">
            Naksh Studio is a clothing brand based in <strong className="text-text opacity-100">Karachi, Pakistan</strong>,
            designing heavy-weight t-shirts and trousers for everyday wear. We keep things simple:
            good fabric, honest pricing, and orders confirmed directly with you over WhatsApp.
          </p>
        </header>

        <section className="grid md:grid-cols-3 gap-6 mb-16">
          {values.map((value) => (
            <div key={value.title} className="bg-card-bg border border-accent-dim rounded-md p-6 space-y-3">
              <h2 className="text-[11px] uppercase tracking-widest font-black text-text">{value.title}</h2>
              <p className="text-xs text-text opacity-70 leading-relaxed font-medium">{value.detail}</p>
            </div>
          ))}
        </section>

        <section className="bg-card-bg border border-accent-dim rounded-md p-6 md:p-8">
          <h2 className="text-[11px] uppercase tracking-[0.4em] font-black text-text opacity-60 mb-4">
            Where We Deliver
          </h2>
          <p className="text-xs md:text-sm text-text opacity-70 leading-relaxed font-medium">
            We currently deliver and process exchanges within Karachi only. See our{' '}
            <Link href="/shipping" className="underline">shipping details</Link> and{' '}
            <Link href="/returns" className="underline">return &amp; exchange policy</Link> for full timelines.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
