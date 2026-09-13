import Script from 'next/script';
import './globals.css';
import { GTM_ID } from '@/lib/gtm';
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, BUSINESS } from '@/lib/seo';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Naksh Studio — Premium T-Shirts & Trousers in Karachi, Pakistan',
    template: '%s — Naksh Studio',
  },
  description: SITE_DESCRIPTION,
  keywords: [
    'Naksh Studio',
    'clothing brand Karachi',
    'clothing brand Pakistan',
    'premium t-shirts Pakistan',
    'trousers Pakistan',
    'streetwear Karachi',
    'online clothing store Pakistan',
    'buy t-shirts online Karachi',
  ],
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME }],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_PK',
    url: '/',
    siteName: SITE_NAME,
    title: 'Naksh Studio — Premium T-Shirts & Trousers in Karachi, Pakistan',
    description: SITE_DESCRIPTION,
    images: [{ url: '/logo.png', width: 500, height: 500, alt: SITE_NAME }],
  },
  twitter: {
    card: 'summary',
    title: 'Naksh Studio — Premium T-Shirts & Trousers in Karachi, Pakistan',
    description: SITE_DESCRIPTION,
    images: ['/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ClothingStore',
  '@id': `${SITE_URL}/#organization`,
  name: BUSINESS.name,
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  image: `${SITE_URL}/logo.png`,
  telephone: BUSINESS.telephone,
  priceRange: 'Rs',
  areaServed: {
    '@type': 'City',
    name: BUSINESS.addressLocality,
  },
  address: {
    '@type': 'PostalAddress',
    addressLocality: BUSINESS.addressLocality,
    addressRegion: BUSINESS.addressRegion,
    addressCountry: BUSINESS.addressCountry,
  },
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  url: SITE_URL,
  name: SITE_NAME,
  publisher: { '@id': `${SITE_URL}/#organization` },
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE_URL}/products?search={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <Script id="gtm-base" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${GTM_ID}');`}
        </Script>
        <Script id="ld-organization" type="application/ld+json" strategy="beforeInteractive">
          {JSON.stringify(organizationJsonLd)}
        </Script>
        <Script id="ld-website" type="application/ld+json" strategy="beforeInteractive">
          {JSON.stringify(websiteJsonLd)}
        </Script>
      </head>
      <body className="antialiased">
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {children}
      </body>
    </html>
  );
}
