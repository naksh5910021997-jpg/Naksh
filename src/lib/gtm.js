export const GTM_ID = 'GTM-PRBZ348X';

export function pushToDataLayer(data) {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  // GTM merges pushes into one data model, so clear the previous ecommerce
  // object first or old item fields leak into this event.
  if (data.ecommerce) window.dataLayer.push({ ecommerce: null });
  window.dataLayer.push(data);
}
