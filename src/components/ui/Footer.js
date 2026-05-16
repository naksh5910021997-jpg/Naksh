'use client';

import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinkStyles = "text-[11px] uppercase tracking-widest text-card-bg opacity-60 hover:opacity-100 transition-all duration-300 block";
  const sectionTitleStyles = "text-[10px] uppercase tracking-[0.3em] font-black text-card-bg mb-8";

  return (
    <footer className="bg-text text-card-bg border-t border-card-bg/5">
      <div className="container mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">

          {/* Brand - Span 4 columns */}
          <div className="md:col-span-4">
            <Link href="/" className="text-2xl font-black uppercase tracking-[0.2em] mb-6 block text-card-bg">
              Naksh<span className="opacity-40">.</span>
            </Link>
            <p className="text-card-bg opacity-60 text-[11px] uppercase tracking-widest leading-relaxed max-w-xs">
              Refining the essentials. <br />
              Premium apparel engineered for <br />
              the modern silhouette.
            </p>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-2">
            <h4 className={sectionTitleStyles}>Index</h4>
            <ul className="space-y-4">
              <li><Link href="/" className={footerLinkStyles}>Home</Link></li>
              <li><Link href="/products" className={footerLinkStyles}>All Products</Link></li>
              <li><Link href="/categories" className={footerLinkStyles}>Collections</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="md:col-span-2">
            <h4 className={sectionTitleStyles}>Support</h4>
            <ul className="space-y-4">
              <li><Link href="/about" className={footerLinkStyles}>Our Story</Link></li>
              <li><Link href="/shipping" className={footerLinkStyles}>Shipping</Link></li>
              <li><Link href="/returns" className={footerLinkStyles}>Returns</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="md:col-span-4 md:text-right">
            <h4 className={sectionTitleStyles}>Contact</h4>
            <ul className="space-y-4 text-card-bg opacity-60 text-[11px] uppercase tracking-widest">
              <li className="hover:opacity-100 transition-all cursor-pointer">it@Naksh.com</li>
              <li>+91 1234567890</li>
              <li className="mt-6 opacity-40">Studio: India</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-card-bg/5 mt-20 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-[9px] font-mono text-card-bg opacity-40 tracking-widest uppercase">
            &copy; {currentYear} Naksh STUDIO / ALL RIGHTS RESERVED
          </div>

          {/* Social Links */}
          <div className="flex gap-8">
            <Link href="#" className="text-[9px] font-mono text-card-bg opacity-40 hover:opacity-100 uppercase tracking-widest transition-all">Instagram</Link>
            <Link href="#" className="text-[9px] font-mono text-card-bg opacity-40 hover:opacity-100 uppercase tracking-widest transition-all">Twitter</Link>
            <Link href="#" className="text-[9px] font-mono text-card-bg opacity-40 hover:opacity-100 uppercase tracking-widest transition-all">Legal</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}