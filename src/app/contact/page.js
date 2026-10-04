import Link from 'next/link';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import ContactForm from '@/components/contact/ContactForm';
import { BUSINESS } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Contact Us',
  description:
    'Contact Naksh Shop for orders, sizing help and exchanges. Email support@nakshshop.com or message us on WhatsApp. Karachi, Pakistan.',
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'Contact Us — Naksh Shop',
    description: 'Email support@nakshshop.com or message Naksh Shop on WhatsApp.',
    url: '/contact',
  },
};

export default function ContactPage() {
  const whatsappUrl = `https://wa.me/${BUSINESS.whatsapp}`;

  const channels = [
    { title: 'Email', value: BUSINESS.email, href: `mailto:${BUSINESS.email}` },
    { title: 'WhatsApp', value: BUSINESS.telephone, href: whatsappUrl, external: true },
    { title: 'Instagram', value: '@naksh.shop5', href: BUSINESS.instagram, external: true },
    { title: 'Facebook', value: 'Naksh Shop', href: BUSINESS.facebook, external: true },
  ];

  return (
    <div className="bg-main-bg min-h-screen font-sans">
      <Navbar />

      <main className="container mx-auto px-6 pt-12 pb-24 max-w-5xl">
        <nav className="text-[10px] uppercase tracking-[0.2em] font-bold text-text opacity-60 mb-10 flex gap-2">
          <Link href="/" className="hover:opacity-100">Home</Link>
          <span>/</span>
          <span className="text-text opacity-100 italic">Contact</span>
        </nav>

        <header className="mb-16">
          <span className="text-[10px] uppercase tracking-[0.3em] font-black text-text opacity-60 mb-3 block">
            Naksh Shop
          </span>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none text-text mb-6">
            Contact Us
          </h1>
          <p className="text-text opacity-70 text-sm md:text-base leading-relaxed max-w-2xl font-medium">
            Questions about an order, sizing or an exchange? Send us a message and our team will get back to you.
            For the fastest reply, message us on WhatsApp.
          </p>
        </header>

        <div className="grid lg:grid-cols-12 gap-8">
          <section className="lg:col-span-7">
            <ContactForm />
          </section>

          <aside className="lg:col-span-5 space-y-4">
            {channels.map((c) => (
              <a
                key={c.title}
                href={c.href}
                {...(c.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="block bg-card-bg border border-accent-dim rounded-md p-6 hover:border-text transition-colors"
              >
                <h2 className="text-[11px] uppercase tracking-widest font-black text-text opacity-60 mb-2">{c.title}</h2>
                <p className="text-sm font-bold text-text break-all">{c.value}</p>
              </a>
            ))}
            <p className="text-xs text-text opacity-60 leading-relaxed px-1">
              Based in {BUSINESS.addressLocality}, Pakistan. We deliver within Karachi only — see{' '}
              <Link href="/shipping" className="underline">Shipping</Link> and{' '}
              <Link href="/returns" className="underline">Returns</Link>.
            </p>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
