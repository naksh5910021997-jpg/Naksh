import crypto from 'crypto';

// Meta Conversions API (server-side events). Needs META_PIXEL_ID and
// META_CAPI_TOKEN in .env.local - until they're set, events are skipped and
// orders still work normally. META_TEST_EVENT_CODE (optional) routes events
// to Events Manager > Test Events while verifying the setup.
export const isMetaConfigured = () =>
  !!(process.env.META_PIXEL_ID && process.env.META_CAPI_TOKEN);

const GRAPH_VERSION = process.env.META_GRAPH_VERSION || 'v23.0';

const sha256 = (value) =>
  crypto.createHash('sha256').update(String(value).trim().toLowerCase()).digest('hex');

// Meta expects phone numbers as digits with country code, e.g. 923001234567.
export function normalizePkPhone(phone) {
  let digits = String(phone || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('0092')) digits = digits.slice(2);
  else if (digits.startsWith('0')) digits = `92${digits.slice(1)}`;
  else if (digits.length === 10 && digits.startsWith('3')) digits = `92${digits}`;
  return digits;
}

// Builds Meta user_data from an order: personal fields are SHA-256 hashed,
// browser identifiers (fbp/fbc/ip/user agent) are sent as-is.
function buildUserData(order) {
  const { customer = {}, tracking = {} } = order;
  const userData = {
    country: [sha256('pk')],
    external_id: [sha256(order.orderRef)],
  };

  const phone = normalizePkPhone(customer.phone);
  if (phone) userData.ph = [sha256(phone)];

  const [firstName, ...rest] = String(customer.name || '').trim().split(/\s+/);
  if (firstName) userData.fn = [sha256(firstName)];
  if (rest.length) userData.ln = [sha256(rest.join(' '))];

  if (customer.city) userData.ct = [sha256(customer.city.replace(/\s+/g, ''))];
  if (tracking.fbp) userData.fbp = tracking.fbp;
  if (tracking.fbc) userData.fbc = tracking.fbc;
  if (tracking.ip) userData.client_ip_address = tracking.ip;
  if (tracking.userAgent) userData.client_user_agent = tracking.userAgent;

  return userData;
}

function buildCustomData(order) {
  return {
    currency: order.currency || 'PKR',
    value: order.subtotal,
    order_id: order.orderRef,
    content_type: 'product',
    content_ids: order.items.map((item) => String(item.product)),
    contents: order.items.map((item) => ({
      id: String(item.product),
      quantity: item.quantity,
      item_price: item.price,
    })),
    num_items: order.items.reduce((sum, item) => sum + item.quantity, 0),
  };
}

// Sends one order event ('Lead' or 'Purchase') to Meta.
// Resolves to { sentAt } | { skipped: true } | { error } - it never throws, so a
// Meta outage can't break order creation or confirmation.
export async function sendOrderEvent(eventName, order) {
  if (!isMetaConfigured()) return { skipped: true };

  // Lead shares the browser pixel's event id for deduplication. Purchase only
  // happens server-side, so it gets its own id (still stable per order).
  const eventId = eventName === 'Lead' ? order.eventId : `${order.eventId}-purchase`;
  // Meta rejects events older than 7 days, so a late resend of an old order fails.
  const eventTime = eventName === 'Lead' ? order.createdAt : order.confirmedAt;

  const payload = {
    data: [{
      event_name: eventName,
      event_time: Math.floor(new Date(eventTime || Date.now()).getTime() / 1000),
      event_id: eventId,
      // WhatsApp-confirmed orders are still attributed to the website visit.
      action_source: 'website',
      event_source_url: order.tracking?.pageUrl || process.env.NEXT_PUBLIC_APP_URL,
      user_data: buildUserData(order),
      custom_data: buildCustomData(order),
    }],
  };
  if (process.env.META_TEST_EVENT_CODE) payload.test_event_code = process.env.META_TEST_EVENT_CODE;

  try {
    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_VERSION}/${process.env.META_PIXEL_ID}/events?access_token=${encodeURIComponent(process.env.META_CAPI_TOKEN)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(8000),
      }
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { error: data?.error?.message || `Meta responded with ${res.status}` };
    }
    return { sentAt: new Date() };
  } catch (error) {
    return { error: error.message || 'Could not reach Meta' };
  }
}
