import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Order, { ORDER_STATUSES } from '@/models/Order';
import { authMiddleware } from '@/middleware/auth';
import { sendOrderEvent } from '@/lib/meta';

const invalidId = () =>
  NextResponse.json({ success: false, message: 'Invalid order ID' }, { status: 400 });
const notFound = () =>
  NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });

const STATUS_DATE_FIELD = { confirmed: 'confirmedAt', delivered: 'deliveredAt', cancelled: 'cancelledAt' };
const CUSTOMER_FIELDS = { name: 100, phone: 30, address: 500, city: 100 };

// PATCH - Update status / customer details / notes, or resend the Purchase event (Admin only)
// Body: { status?, customer?: { name, phone, address, city }, notes?, resendPurchase? }
async function updateOrder(request, { params }) {
  try {
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) return invalidId();

    const body = await request.json().catch(() => ({}));
    if (body.status !== undefined && !ORDER_STATUSES.includes(body.status)) {
      return NextResponse.json({ success: false, message: 'Invalid status' }, { status: 400 });
    }

    await connectDB();
    const order = await Order.findById(id);
    if (!order) return notFound();

    if (body.customer && typeof body.customer === 'object') {
      for (const [field, max] of Object.entries(CUSTOMER_FIELDS)) {
        if (body.customer[field] !== undefined) {
          order.set(`customer.${field}`, String(body.customer[field] || '').trim().slice(0, max));
        }
      }
    }
    if (body.notes !== undefined) order.notes = String(body.notes || '').trim().slice(0, 2000);

    const isSaleStatus = (status) => status === 'confirmed' || status === 'delivered';
    let becameSale = false;

    if (body.status && body.status !== order.status) {
      if (isSaleStatus(body.status) && !order.customer?.phone) {
        return NextResponse.json(
          { success: false, message: 'Add the customer phone number before confirming.' },
          { status: 400 }
        );
      }
      becameSale = isSaleStatus(body.status) && !isSaleStatus(order.status);
      order.status = body.status;
      const dateField = STATUS_DATE_FIELD[body.status];
      if (dateField && !order[dateField]) order[dateField] = new Date();
      // Delivered without a separate confirm step still counts as confirmed.
      if (becameSale && !order.confirmedAt) order.confirmedAt = new Date();
    }

    // A sale is reported to Meta once, when the order first becomes confirmed/delivered.
    // resendPurchase retries it if Meta wasn't set up yet or the call failed.
    const purchaseSent = !!order.metaEvents?.purchase?.sentAt;
    if (!purchaseSent && isSaleStatus(order.status) && (becameSale || body.resendPurchase)) {
      order.set('metaEvents.purchase', await sendOrderEvent('Purchase', order));
    }

    await order.save();
    return NextResponse.json({ success: true, data: order.toObject() });
  } catch (error) {
    console.error('Update order error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Remove an order, e.g. spam or a test (Admin only)
async function deleteOrder(request, { params }) {
  try {
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) return invalidId();

    await connectDB();
    const deleted = await Order.findByIdAndDelete(id);
    if (!deleted) return notFound();

    return NextResponse.json({ success: true, message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Delete order error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

export const PATCH = (request, context) => authMiddleware(updateOrder, true)(request, context);
export const DELETE = (request, context) => authMiddleware(deleteOrder, true)(request, context);
