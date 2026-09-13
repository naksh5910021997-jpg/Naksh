import Link from 'next/link';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import { BUSINESS } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Shipping Information',
  description:
    'Naksh Studio delivers within Karachi only. Orders are confirmed via WhatsApp before dispatch.',
  alternates: { canonical: '/shipping' },
  openGraph: {
    title: 'Shipping Information — Naksh Studio',
    description: 'Naksh Studio delivers within Karachi only. Orders are confirmed via WhatsApp before dispatch.',
    url: '/shipping',
  },
};

const steps = [
  {
    n: '01',
    title: 'Delivery Area',
    detail: 'We currently deliver exclusively within Karachi, Pakistan.',
  },
  {
    n: '02',
    title: 'Order Confirmation',
    detail: 'Every order is confirmed with you on WhatsApp before it’s packed and dispatched.',
  },
  {
    n: '03',
    title: 'Courier Handover',
    detail: 'Once confirmed, your order is handed to our courier partner and tracking details are shared on WhatsApp.',
  },
];

export default function ShippingPage() {
  const whatsappUrl = `https://wa.me/${BUSINESS.whatsapp}`;

  return (
    <div className="bg-main-bg min-h-screen font-sans">
      <Navbar />

      <main className="container mx-auto px-6 pt-32 pb-24 max-w-4xl">
        <nav className="text-[10px] uppercase tracking-[0.2em] font-bold text-text opacity-60 mb-10 flex gap-2">
          <Link href="/" className="hover:opacity-100">Home</Link>
          <span>/</span>
          <span className="text-text opacity-100 italic">Shipping Information</span>
        </nav>

        <header className="mb-16">
          <span className="text-[10px] uppercase tracking-[0.3em] font-black text-text opacity-60 mb-3 block">
            Naksh Studio
          </span>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none text-text mb-6">
            Shipping Information
          </h1>
          <p className="text-text opacity-70 text-sm md:text-base leading-relaxed max-w-2xl font-medium">
            We currently deliver within <strong className="text-text opacity-100">Karachi, Pakistan</strong> only.
            Every order is confirmed directly with you on WhatsApp before it ships.
          </p>
        </header>

        <section className="grid md:grid-cols-3 gap-6 mb-16">
          {steps.map((step) => (
            <div key={step.n} className="bg-card-bg border border-accent-dim rounded-md p-6 space-y-3">
              <span className="text-2xl font-black text-text opacity-20 block">{step.n}</span>
              <h2 className="text-[11px] uppercase tracking-widest font-black text-text">{step.title}</h2>
              <p className="text-xs text-text opacity-70 leading-relaxed font-medium">{step.detail}</p>
            </div>
          ))}
        </section>

        <p className="text-[9px] text-text opacity-50 text-center leading-relaxed pt-8 border-t border-accent-dim">
          Questions about an order in progress? Reach us on{' '}
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="underline">WhatsApp</a>.
          Need to exchange or return something? See our{' '}
          <Link href="/returns" className="underline">Return &amp; Exchange Policy</Link>.
        </p>
      </main>

      <Footer />
    </div>
  );
}
