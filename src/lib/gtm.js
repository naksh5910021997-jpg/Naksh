export const GTM_ID = 'GTM-PRBZ348X';

export function pushToDataLayer(data) {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(data);
}
