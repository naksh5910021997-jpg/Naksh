import Link from 'next/link';
import Script from 'next/script';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Return & Exchange Policy',
  description:
    'How exchanges, store credit, and refunds work at Naksh Studio — delivery and exchanges within Karachi, Pakistan only.',
  alternates: { canonical: '/returns' },
  openGraph: {
    title: 'Return & Exchange Policy — Naksh Studio',
    description: 'How exchanges, store credit, and refunds work at Naksh Studio.',
    url: '/returns',
  },
};

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Do you deliver and exchange outside Karachi?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No, Naksh Studio currently delivers and processes exchanges within Karachi only.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do I get a cash refund or store credit?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Naksh Studio operates a strict no cash refund policy. If you are not 100% satisfied, you receive Online Store Credit for the item’s value (excluding shipping). Cash refunds are only issued for damaged, defective, or incorrectly delivered items.',
      },
    },
    {
      '@type': 'Question',
      name: 'How long do I have to request an exchange?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Exchange requests must be submitted within 14 days of receiving your order. Store credit then remains valid for 14 days from the date the returned item is received and verified.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I start an exchange?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Message Naksh Studio on WhatsApp with your Order ID and clear photos of the item. Once approved, courier return details are shared on WhatsApp.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I exchange a sale item?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No, sale items are final and cannot be exchanged or refunded.',
      },
    },
  ],
};

const WHATSAPP_NUMBER = '03712367217';

const timeline = [
  {
    title: 'Exchange Window',
    detail: 'Exchange requests must be submitted within 14 days of receiving your order.',
  },
  {
    title: 'Store Credit Validity',
    detail: 'Store credit remains valid for 14 days from the date we receive and verify your returned item.',
  },
  {
    title: 'Item Condition',
    detail: 'Items must be unworn, unwashed, and unaltered, with all original tags and labels intact.',
  },
  {
    title: 'Sale Items',
    detail: 'Sale items are final and cannot be exchanged or refunded.',
  },
  {
    title: 'Full-Price → Later On Sale',
    detail: 'If an item was purchased at full price and later goes on sale, it will be exchanged at its original purchase price — as long as it’s within the 14-day window.',
  },
  {
    title: 'Seasonal Items',
    detail: 'Seasonal items can only be exchanged for items within the same season (Summer for Summer, Winter for Winter), subject to stock availability.',
  },
  {
    title: 'Product Range',
    detail: 'Exchanges are limited strictly to items within our current product range.',
  },
];

const steps = [
  {
    n: '01',
    title: 'Message Us',
    detail: `Message us on WhatsApp at ${WHATSAPP_NUMBER} with your Order ID and clear photos of the item.`,
  },
  {
    n: '02',
    title: 'Get Approved',
    detail: 'Once approved, we’ll share courier return details with you on WhatsApp.',
  },
  {
    n: '03',
    title: 'Ship It Back',
    detail: 'You are responsible for return shipping costs unless the issue was our error.',
  },
];

export default function ReturnsPage() {
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER.replace(/^0/, '92')}`;

  return (
    <div className="bg-main-bg min-h-screen font-sans">
      <Script id="ld-faq" type="application/ld+json">
        {JSON.stringify(faqJsonLd)}
      </Script>
      <Navbar />

      <main className="container mx-auto px-6 pt-32 pb-24 max-w-4xl">
        {/* Breadcrumb */}
        <nav className="text-[10px] uppercase tracking-[0.2em] font-bold text-text opacity-60 mb-10 flex gap-2">
          <Link href="/" className="hover:opacity-100">Home</Link>
          <span>/</span>
          <span className="text-text opacity-100 italic">Return &amp; Exchange Policy</span>
        </nav>

        {/* Header */}
        <header className="mb-16">
          <span className="text-[10px] uppercase tracking-[0.3em] font-black text-text opacity-60 mb-3 block">
            Naksh Studio
          </span>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none text-text mb-6">
            Return &amp; Exchange Policy
          </h1>
          <p className="text-text opacity-70 text-sm md:text-base leading-relaxed max-w-2xl font-medium">
            We currently deliver and process exchanges within <strong className="text-text opacity-100">Karachi only</strong>.
            If you&apos;re not 100% satisfied with your order, you can receive Online Store Credit
            for the item&apos;s value (excluding shipping costs) for future purchases.
          </p>
        </header>

        {/* Exchange Rules & Timelines */}
        <section className="mb-16">
          <h2 className="text-[11px] uppercase tracking-[0.4em] font-black text-text opacity-60 mb-8 pb-4 border-b border-accent-dim">
            Exchange Rules &amp; Timelines
          </h2>
          <div className="space-y-0">
            {timeline.map((item, i) => (
              <div
                key={item.title}
                className="grid grid-cols-12 gap-4 md:gap-8 py-6 border-b border-accent-dim last:border-b-0"
              >
                <div className="col-span-2 md:col-span-1">
                  <span className="text-[10px] font-mono font-black text-text opacity-40">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                <div className="col-span-4 md:col-span-3">
                  <h3 className="text-[11px] uppercase tracking-widest font-black text-text">
                    {item.title}
                  </h3>
                </div>
                <div className="col-span-6 md:col-span-8">
                  <p className="text-xs md:text-sm text-text opacity-70 leading-relaxed font-medium">
                    {item.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How to Initiate an Exchange */}
        <section className="mb-16">
          <h2 className="text-[11px] uppercase tracking-[0.4em] font-black text-text opacity-60 mb-8 pb-4 border-b border-accent-dim">
            How to Initiate an Exchange
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((step) => (
              <div
                key={step.n}
                className="bg-card-bg border border-accent-dim rounded-md p-6 space-y-3"
              >
                <span className="text-2xl font-black text-text opacity-20 block">{step.n}</span>
                <h3 className="text-[11px] uppercase tracking-widest font-black text-text">
                  {step.title}
                </h3>
                <p className="text-xs text-text opacity-70 leading-relaxed font-medium">
                  {step.detail}
                </p>
              </div>
            ))}
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white py-4 px-6 text-[11px] uppercase font-black tracking-[0.3em] rounded-md transition-all"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.106" />
            </svg>
            Start an Exchange on WhatsApp
          </a>
        </section>

        {/* Refunds */}
        <section className="mb-8">
          <h2 className="text-[11px] uppercase tracking-[0.4em] font-black text-text opacity-60 mb-8 pb-4 border-b border-accent-dim">
            Refunds
          </h2>
          <div className="bg-card-bg border border-accent-dim rounded-md p-6 md:p-8 space-y-6">
            <div className="flex gap-4">
              <span className="text-[10px] font-black bg-red-50 text-red-500 px-2 py-1 uppercase rounded-sm h-fit shrink-0">
                No Cash Refunds
              </span>
              <p className="text-xs md:text-sm text-text opacity-70 leading-relaxed font-medium">
                We operate a strict no cash refund policy. Cash refunds are only issued for
                damaged, defective, or incorrectly delivered items.
              </p>
            </div>
            <div className="flex gap-4">
              <span className="text-[10px] font-black bg-green-50 text-green-600 px-2 py-1 uppercase rounded-sm h-fit shrink-0">
                Shipping
              </span>
              <p className="text-xs md:text-sm text-text opacity-70 leading-relaxed font-medium">
                Shipping costs are refunded only if the item was damaged on arrival or the wrong
                item was delivered.
              </p>
            </div>
          </div>
        </section>

        {/* Footnote */}
        <p className="text-[9px] text-text opacity-50 text-center leading-relaxed pt-8 border-t border-accent-dim">
          Have a question about your order? Reach us anytime on{' '}
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="underline">
            WhatsApp
          </a>.
        </p>
      </main>

      <Footer />
    </div>
  );
}
