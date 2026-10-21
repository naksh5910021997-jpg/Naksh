// Starts a WhatsApp order from the browser: tracks the lead, opens WhatsApp
// with the prefilled message and records the pending order in the background.

import { pushToDataLayer } from '@/lib/gtm';
import { getAttribution, generateEventId, generateOrderRef } from '@/lib/attribution';
import { BUSINESS } from '@/lib/seo';

// buildMessage(orderRef) returns the plain-text WhatsApp message.
// order is the /api/orders body without ref/ids, e.g. { productId, size, quantity }.
// Returns { opened, url }; opened is false when a popup blocker stopped WhatsApp.
export function startWhatsAppOrder({ buildMessage, order, value, items }) {
  const orderRef = generateOrderRef();
  const eventId = generateEventId();
  const url = `https://wa.me/${BUSINESS.whatsapp}?text=${encodeURIComponent(buildMessage(orderRef))}`;

  // event_id lets Meta match this browser event with the server-side Lead.
  pushToDataLayer({
    event: 'generate_lead',
    event_id: eventId,
    order_ref: orderRef,
    ecommerce: { currency: 'PKR', value, items },
  });

  // Open WhatsApp first, synchronously in the click, so popup blockers allow it.
  const win = window.open(url, '_blank');

  // Record the pending order in the background. keepalive lets the request
  // finish even if the page is left for WhatsApp.
  fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    keepalive: true,
    body: JSON.stringify({ orderRef, eventId, ...order, tracking: getAttribution() }),
  }).catch(() => {
    // The order still reaches us on WhatsApp; only the record is lost.
  });

  return { opened: !!win, url };
}
