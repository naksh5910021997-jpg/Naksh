// Browser-side ad attribution. On every page load we remember where the
// visitor came from (UTM tags, Facebook click id) so the order they place
// later can be credited to the right ad.

const STORAGE_KEY = 'naksh_attribution';
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];

function readStored() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function getCookie(name) {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : '';
}

// Call once per page load. A visit that arrives with ad parameters replaces
// the stored attribution (last ad click wins); plain visits keep it.
export function captureAttribution() {
  if (typeof window === 'undefined') return;
  const params = new URLSearchParams(window.location.search);
  const fbclid = params.get('fbclid');
  const hasUtm = UTM_KEYS.some((key) => params.get(key));
  if (!fbclid && !hasUtm && localStorage.getItem(STORAGE_KEY)) return;

  const data = {
    landingPage: window.location.href,
    referrer: document.referrer || '',
    capturedAt: Date.now(),
  };
  UTM_KEYS.forEach((key) => {
    if (params.get(key)) data[key] = params.get(key);
  });
  if (fbclid) {
    data.fbclid = fbclid;
    // Same format the Meta pixel uses for its _fbc cookie, so we have it even
    // before the pixel is installed or if it gets blocked.
    data.fbc = `fb.1.${Date.now()}.${fbclid}`;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage blocked (private mode) - attribution is best-effort.
  }
}

// Tracking fields to send along with an order.
export function getAttribution() {
  if (typeof window === 'undefined') return {};
  const stored = readStored();
  return {
    fbp: getCookie('_fbp'),
    fbc: getCookie('_fbc') || stored.fbc || '',
    fbclid: stored.fbclid || '',
    utmSource: stored.utm_source || '',
    utmMedium: stored.utm_medium || '',
    utmCampaign: stored.utm_campaign || '',
    utmContent: stored.utm_content || '',
    utmTerm: stored.utm_term || '',
    landingPage: stored.landingPage || '',
    referrer: stored.referrer || '',
    pageUrl: window.location.href,
  };
}

// Random id shared by the browser pixel event and the server event for one action.
export function generateEventId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

// Order reference like NK-7K2QX9 (no 0/O/1/I to avoid confusion when read aloud).
export function generateOrderRef() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = new Uint8Array(6);
  window.crypto.getRandomValues(bytes);
  return `NK-${Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('')}`;
}
