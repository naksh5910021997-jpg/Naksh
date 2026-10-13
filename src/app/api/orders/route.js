import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Order, { ORDER_STATUSES } from '@/models/Order';
import Product from '@/models/Product';
import { authMiddleware } from '@/middleware/auth';
import { getEffectiveSizePrice } from '@/lib/pricing';
import { sendOrderEvent } from '@/lib/meta';
import { isMailConfigured, sendMail } from '@/lib/mailer';
import { BUSINESS } from '@/lib/seo';

const ORDER_REF_RE = /^NK-[A-Z2-9]{6}$/;
const MAX_QUANTITY = 50;

const clip = (value, max = 500) => String(value || '').trim().slice(0, max);

function getClientIp(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') || '';
}

const badRequest = (message) =>
  NextResponse.json({ success: false, message }, { status: 400 });

// POST - Record a WhatsApp order as pending (Public)
// The browser opens WhatsApp right away and calls this in the background, so the
// order reference is generated client-side and validated here.
export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const orderRef = clip(body.orderRef, 20).toUpperCase();
    const eventId = clip(body.eventId, 100);
    const quantity = Number(body.quantity);
    const sizeName = clip(body.size, 30);
    const colorName = clip(body.color, 50);

    if (!ORDER_REF_RE.test(orderRef)) return badRequest('Invalid order reference');
    if (!eventId) return badRequest('Missing event id');
    if (!mongoose.isValidObjectId(body.productId)) return badRequest('Invalid product');
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
      return badRequest('Invalid quantity');
    }

    await connectDB();
    const product = await Product.findById(body.productId).populate('category', 'name').lean();
    if (!product || product.status !== 'active') {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    }

    // Price always comes from the database, never from the browser.
    const sizes = product.sizes || [];
    let price = product.basePrice || product.price || 0;
    let sku = product.productSku || product.sku;
    if (sizes.length > 0) {
      const size = sizes.find((s) => s.size === sizeName);
      if (!size) return badRequest('Invalid size');
      price = getEffectiveSizePrice(size);
      sku = size.sku || sku;
    }
    const color = (product.colors || []).find((c) => c.name === colorName)?.name;

    const tracking = body.tracking || {};
    const order = await Order.create({
      orderRef,
      eventId,
      items: [{
        product: product._id,
        name: product.name,
        sku,
        category: product.category?.name,
        size: sizes.length > 0 ? sizeName : undefined,
        color,
        price,
        quantity,
      }],
      subtotal: price * quantity,
      tracking: {
        fbp: clip(tracking.fbp, 200),
        fbc: clip(tracking.fbc, 300),
        fbclid: clip(tracking.fbclid, 300),
        utmSource: clip(tracking.utmSource, 200),
        utmMedium: clip(tracking.utmMedium, 200),
        utmCampaign: clip(tracking.utmCampaign, 200),
        utmContent: clip(tracking.utmContent, 200),
        utmTerm: clip(tracking.utmTerm, 200),
        landingPage: clip(tracking.landingPage, 1000),
        referrer: clip(tracking.referrer, 1000),
        pageUrl: clip(tracking.pageUrl, 1000),
        ip: getClientIp(request),
        userAgent: clip(request.headers.get('user-agent'), 500),
      },
    });

    // Order is saved; Meta and email are best-effort and never fail the request.
    const [leadResult] = await Promise.all([
      sendOrderEvent('Lead', order),
      notifyAdmin(order).catch((error) => console.error('Order email error:', error)),
    ]);
    order.set('metaEvents.lead', leadResult);
    await order.save();

    return NextResponse.json({ success: true, data: { orderRef: order.orderRef } }, { status: 201 });
  } catch (error) {
    if (error?.code === 11000) {
      return NextResponse.json({ success: false, message: 'Order already recorded' }, { status: 409 });
    }
    console.error('Create order error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

async function notifyAdmin(order) {
  if (!isMailConfigured()) return;
  const item = order.items[0];
  await sendMail({
    to: process.env.CONTACT_TO || BUSINESS.email,
    subject: `[New order] ${order.orderRef} - Rs ${order.subtotal}`,
    text: [
      `Order: ${order.orderRef}`,
      `Product: ${item.name}${item.sku ? ` (${item.sku})` : ''}`,
      `Size: ${item.size || '-'}   Color: ${item.color || '-'}   Qty: ${item.quantity}`,
      `Total: Rs ${order.subtotal}`,
      `Source: ${order.tracking?.utmSource || (order.tracking?.fbclid ? 'facebook' : 'direct')}`,
      '',
      'The customer is sending this on WhatsApp. Confirm it at /admin/orders once agreed.',
    ].join('\n'),
  });
}

// GET - List orders (Admin only). Optional ?status=pending&search=NK-ABC123
async function listOrders(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = clip(searchParams.get('search'), 50);

    const filter = {};
    if (status && ORDER_STATUSES.includes(status)) filter.status = status;
    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { orderRef: { $regex: escaped, $options: 'i' } },
        { 'customer.phone': { $regex: escaped, $options: 'i' } },
        { 'customer.name': { $regex: escaped, $options: 'i' } },
      ];
    }

    await connectDB();
    const orders = await Order.find(filter).sort({ createdAt: -1 }).limit(500).lean();
    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

export const GET = (request) => authMiddleware(listOrders, true)(request);
