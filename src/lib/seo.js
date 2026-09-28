export const SITE_URL = 'https://www.nakshshop.com';
export const SITE_NAME = 'Naksh Shop';
export const SITE_DESCRIPTION =
  'Naksh Shop — a Karachi, Pakistan clothing brand for premium t-shirts and trousers. Order online, delivery across Karachi, confirm via WhatsApp.';

export const BUSINESS = {
  name: 'Naksh Shop',
  telephone: '+923712367217',
  whatsapp: '923712367217',
  email: 'support@nakshshop.com',
  instagram: 'https://www.instagram.com/naksh.shop5/',
  facebook: 'https://www.facebook.com/share/19S8mNCQXx/',
  addressLocality: 'Karachi',
  addressRegion: 'Sindh',
  addressCountry: 'PK',
  areaServed: 'Karachi, Pakistan',
};

export function absoluteUrl(path = '') {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
