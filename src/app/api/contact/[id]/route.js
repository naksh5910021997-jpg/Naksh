import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import ContactMessage from '@/models/ContactMessage';
import { authMiddleware } from '@/middleware/auth';

const invalidId = () =>
  NextResponse.json({ success: false, message: 'Invalid message ID' }, { status: 400 });
const notFound = () =>
  NextResponse.json({ success: false, message: 'Message not found' }, { status: 404 });

// PATCH - Mark a message read/unread (Admin only)
async function updateMessage(request, { params }) {
  try {
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) return invalidId();

    const { read } = await request.json().catch(() => ({}));
    if (typeof read !== 'boolean') {
      return NextResponse.json({ success: false, message: '`read` must be true or false' }, { status: 400 });
    }

    await connectDB();
    const message = await ContactMessage.findByIdAndUpdate(id, { read }, { new: true }).lean();
    if (!message) return notFound();

    return NextResponse.json({ success: true, data: message });
  } catch (error) {
    console.error('Update contact message error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Remove a message (Admin only)
async function deleteMessage(request, { params }) {
  try {
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) return invalidId();

    await connectDB();
    const deleted = await ContactMessage.findByIdAndDelete(id);
    if (!deleted) return notFound();

    return NextResponse.json({ success: true, message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete contact message error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

export const PATCH = (request, context) => authMiddleware(updateMessage, true)(request, context);
export const DELETE = (request, context) => authMiddleware(deleteMessage, true)(request, context);
