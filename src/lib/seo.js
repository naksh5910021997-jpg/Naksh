export const SITE_URL = 'https://www.nakshshop.com';
export const SITE_NAME = 'Naksh Studio';
export const SITE_DESCRIPTION =
  'Naksh Studio — a Karachi, Pakistan clothing brand for premium t-shirts and trousers. Order online, delivery across Karachi, confirm via WhatsApp.';

export const BUSINESS = {
  name: 'Naksh Studio',
  telephone: '+923181058796',
  whatsapp: '923181058796',
  addressLocality: 'Karachi',
  addressRegion: 'Sindh',
  addressCountry: 'PK',
  areaServed: 'Karachi, Pakistan',
};

export function absoluteUrl(path = '') {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
